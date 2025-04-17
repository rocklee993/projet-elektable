const db = require('./db');

class Paiement {
  static async create(data) {
    const { id_commande, moyen, montant, statut } = data;
    const [result] = await db.query(`
      INSERT INTO paiement (id_commande, moyen, montant, statut)
      VALUES (?, ?, ?, ?)`,
      [id_commande, moyen, montant, statut || 'en attente']
    );
    return result.insertId;
  }

  static async findByCommande(id_commande) {
    const [rows] = await db.query('SELECT * FROM paiement WHERE id_commande = ?', [id_commande]);
    return rows;
  }
}

module.exports = Paiement;
