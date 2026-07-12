const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'blackwater.sqlite');

let dbInstance = null;
let useSqlJs = false;
let sqlJsEngine = null;

// Try loading better-sqlite3 first, otherwise fallback to sql.js
function getDb() {
  if (dbInstance) return dbInstance;

  try {
    const Database = require('better-sqlite3');
    dbInstance = new Database(DB_PATH, { verbose: null });
    dbInstance.pragma('journal_mode = WAL');
    initSchema(dbInstance, false);
    return dbInstance;
  } catch (err) {
    console.warn("better-sqlite3 not available or native build error, falling back to sql.js (WebAssembly SQLite)...");
    useSqlJs = true;
    return null; // Will be initialized asynchronously via initSqlJsDb()
  }
}

async function initSqlJsDb() {
  if (dbInstance && !useSqlJs && typeof dbInstance.pragma === 'function') return dbInstance;
  if (dbInstance && useSqlJs) return dbInstance;

  useSqlJs = true;
  const initSqlJs = require('sql.js');
  sqlJsEngine = await initSqlJs();

  let buffer;
  if (fs.existsSync(DB_PATH)) {
    buffer = fs.readFileSync(DB_PATH);
    dbInstance = new sqlJsEngine.Database(buffer);
  } else {
    dbInstance = new sqlJsEngine.Database();
  }

  initSchema(dbInstance, true);
  saveSqlJsDb();
  return dbInstance;
}

function saveSqlJsDb() {
  if (useSqlJs && dbInstance && sqlJsEngine) {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function initSchema(db, isSqlJs) {
  const exec = (query) => {
    if (isSqlJs) {
      db.run(query);
    } else {
      db.exec(query);
    }
  };

  exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      coverImageUrl TEXT,
      description TEXT,
      excerpt TEXT,
      stockStatus TEXT DEFAULT 'In Stock',
      price REAL DEFAULT 12.50,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS search_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      queryString TEXT NOT NULL UNIQUE,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      requestCount INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Pending'
    );
  `);
}

// Unified query runner wrapper so models work identically whether better-sqlite3 or sql.js is used
async function query(sqlText, params = []) {
  if (!dbInstance) {
    if (useSqlJs || !getDb()) {
      await initSqlJsDb();
    }
  }

  const isSqlJsInstance = useSqlJs || (dbInstance && typeof dbInstance.run === 'function' && typeof dbInstance.pragma !== 'function');

  if (isSqlJsInstance) {
    const stmt = dbInstance.prepare(sqlText);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } else {
    const stmt = dbInstance.prepare(sqlText);
    return stmt.all(...params);
  }
}

async function getOne(sqlText, params = []) {
  const results = await query(sqlText, params);
  return results.length > 0 ? results[0] : null;
}

async function execute(sqlText, params = []) {
  if (!dbInstance) {
    if (useSqlJs || !getDb()) {
      await initSqlJsDb();
    }
  }

  const isSqlJsInstance = useSqlJs || (dbInstance && typeof dbInstance.run === 'function' && typeof dbInstance.pragma !== 'function');

  if (isSqlJsInstance) {
    // Check if it's an insert or update
    dbInstance.run(sqlText, params);
    saveSqlJsDb();
    
    // Get last insert ID or changes
    const lastIdRes = dbInstance.exec("SELECT last_insert_rowid() as id, changes() as changes;");
    const lastId = lastIdRes[0] && lastIdRes[0].values[0] ? lastIdRes[0].values[0][0] : null;
    const changes = lastIdRes[0] && lastIdRes[0].values[0] ? lastIdRes[0].values[0][1] : 0;
    return { lastInsertRowid: lastId, changes };
  } else {
    const stmt = dbInstance.prepare(sqlText);
    return stmt.run(...params);
  }
}

module.exports = {
  getDb,
  initSqlJsDb,
  query,
  getOne,
  execute
};
