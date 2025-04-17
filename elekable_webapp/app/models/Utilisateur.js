const db = require('./db');

class Utilisateur {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM utilisateur');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM utilisateur WHERE id_utilisateur = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom, prenom, email, mot_de_passe, adresse, telephone, type_utilisateur } = data;
    const [result] = await db.query(`
      INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, adresse, telephone, type_utilisateur)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      [nom, prenom, email, mot_de_passe, adresse, telephone, type_utilisateur || 'client']
    );
    return result.insertId;
  }
}

module.exports = Utilisateur;
