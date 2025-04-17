const db = require('./db');

class Commande {
  static async findByUser(userId) {
    const [rows] = await db.query('SELECT * FROM commande WHERE id_utilisateur = ?', [userId]);
    return rows;
  }

  static async create(data) {
    const { id_utilisateur, total } = data;
    const [result] = await db.query(`
      INSERT INTO commande (id_utilisateur, total)
      VALUES (?, ?)`,
      [id_utilisateur, total]
    );
    return result.insertId;
  }

  static async updateStatus(id, statut) {
    await db.query(`UPDATE commande SET statut = ? WHERE id_commande = ?`, [statut, id]);
  }
}

module.exports = Commande;
