const db = require('./db');

class Produit {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM produit WHERE actif = TRUE');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM produit WHERE id_produit = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom, description, type_produit, prix_unitaire, unite } = data;
    const [result] = await db.query(`
      INSERT INTO produit (nom, description, type_produit, prix_unitaire, unite)
      VALUES (?, ?, ?, ?, ?)`,
      [nom, description, type_produit, prix_unitaire, unite]
    );
    return result.insertId;
  }
}

module.exports = Produit;
