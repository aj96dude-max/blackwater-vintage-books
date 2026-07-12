const db = require('../database/db');

class SearchLog {
  static async recordMiss(queryString) {
    const cleanQuery = queryString.trim();
    if (!cleanQuery) return null;

    // Check if exact or case-insensitive query string already exists
    const existing = await db.getOne(
      'SELECT * FROM search_logs WHERE LOWER(queryString) = LOWER(?)',
      [cleanQuery]
    );

    if (existing) {
      await db.execute(
        `UPDATE search_logs 
         SET requestCount = requestCount + 1, 
             timestamp = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [existing.id]
      );
    } else {
      await db.execute(
        `INSERT INTO search_logs (queryString, requestCount, status) 
         VALUES (?, 1, 'Pending')`,
        [cleanQuery]
      );
    }
    return await db.getOne('SELECT * FROM search_logs WHERE LOWER(queryString) = LOWER(?)', [cleanQuery]);
  }

  static async findAll() {
    return await db.query(
      `SELECT * FROM search_logs 
       ORDER BY 
         CASE WHEN status = 'Pending' THEN 0 ELSE 1 END ASC,
         requestCount DESC, 
         timestamp DESC`
    );
  }

  static async updateStatus(id, status) {
    await db.execute(
      'UPDATE search_logs SET status = ? WHERE id = ?',
      [status, id]
    );
    return await db.getOne('SELECT * FROM search_logs WHERE id = ?', [id]);
  }

  static async markAddedByQuery(queryString) {
    const cleanQuery = queryString.trim();
    await db.execute(
      `UPDATE search_logs SET status = 'Added' WHERE LOWER(queryString) = LOWER(?)`,
      [cleanQuery]
    );
  }
}

module.exports = SearchLog;
