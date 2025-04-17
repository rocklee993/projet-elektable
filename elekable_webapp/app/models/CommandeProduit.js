const db = require('./db');

class CommandeProduit {
  static async addProduitToCommande(id_commande, id_produit, quantite, prix_unitaire) {
    await db.query(`
      INSERT INTO commande_produit (id_commande, id_produit, quantite, prix_unitaire)
      VALUES (?, ?, ?, ?)`,
      [id_commande, id_produit, quantite, prix_unitaire]
    );
  }

  static async getProduitsForCommande(id_commande) {
    const [rows] = await db.query(`
      SELECT p.nom, cp.quantite, cp.prix_unitaire
      FROM commande_produit cp
      JOIN produit p ON cp.id_produit = p.id_produit
      WHERE cp.id_commande = ?`, 
      [id_commande]
    );
    return rows;
  }
}

module.exports = CommandeProduit;
