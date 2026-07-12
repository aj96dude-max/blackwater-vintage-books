const db = require('../database/db');

class Book {
  static async findAll(genreFilter = null) {
    if (genreFilter && genreFilter !== 'All Volumes') {
      return await db.query('SELECT * FROM books WHERE genre = ? ORDER BY id ASC', [genreFilter]);
    }
    return await db.query('SELECT * FROM books ORDER BY id ASC');
  }

  static async findById(id) {
    return await db.getOne('SELECT * FROM books WHERE id = ?', [id]);
  }

  static async searchByQuery(queryStr) {
    const likeParam = `%${queryStr.trim()}%`;
    return await db.query(
      `SELECT * FROM books 
       WHERE title LIKE ? OR author LIKE ? OR genre LIKE ? 
       ORDER BY title ASC`,
      [likeParam, likeParam, likeParam]
    );
  }

  static async create({ title, author, genre, coverImageUrl, description, excerpt, stockStatus = 'In Stock', price = 12.50 }) {
    const result = await db.execute(
      `INSERT INTO books (title, author, genre, coverImageUrl, description, excerpt, stockStatus, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author,
        genre,
        coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
        description || 'A remarkable vintage volume from the Blackwater & Co. catalog.',
        excerpt || 'From Chapter One: The shadows stretched long across the western horizon as the first bells of evening sounded...',
        stockStatus,
        parseFloat(price) || 12.50
      ]
    );
    if (result && result.lastInsertRowid) {
      return await this.findById(result.lastInsertRowid);
    }
    return await db.getOne('SELECT * FROM books WHERE title = ? AND author = ? ORDER BY id DESC LIMIT 1', [title, author]);
  }

  static async update(id, { title, author, genre, coverImageUrl, description, excerpt, stockStatus, price }) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db.execute(
      `UPDATE books SET 
         title = ?, 
         author = ?, 
         genre = ?, 
         coverImageUrl = ?, 
         description = ?, 
         excerpt = ?, 
         stockStatus = ?, 
         price = ?
       WHERE id = ?`,
      [
        title ?? existing.title,
        author ?? existing.author,
        genre ?? existing.genre,
        coverImageUrl ?? existing.coverImageUrl,
        description ?? existing.description,
        excerpt ?? existing.excerpt,
        stockStatus ?? existing.stockStatus,
        price !== undefined ? parseFloat(price) : existing.price,
        id
      ]
    );
    return await this.findById(id);
  }

  static async delete(id) {
    const existing = await this.findById(id);
    if (!existing) return false;
    await db.execute('DELETE FROM books WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Book;
