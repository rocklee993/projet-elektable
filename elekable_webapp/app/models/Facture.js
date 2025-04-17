const db = require('./db');

class Facture {
  static async create(id_commande, montant_total, fichier_pdf) {
    const [result] = await db.query(`
      INSERT INTO facture (id_commande, montant_total, fichier_pdf)
      VALUES (?, ?, ?)`,
      [id_commande, montant_total, fichier_pdf]
    );
    return result.insertId;
  }

  static async findByCommande(id_commande) {
    const [rows] = await db.query('SELECT * FROM facture WHERE id_commande = ?', [id_commande]);
    return rows[0];
  }
}

module.exports = Facture;
