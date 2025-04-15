// db.js
const mysql = require('mysql2');

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: 'localhost',      // Adresse du serveur MySQL
    port: 3306,             // Port du serveur MySQL
    user: 'root',           // Nom d'utilisateur MySQL
    password: 'root',       // Mot de passe MySQL
    database: 'elektable'    // Nom de la base de données
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.stack);
        return;
    }
    console.log('Connecté à MySQL en tant qu’ID', connection.threadId);
});

// Exporter la connexion pour l'utiliser dans d'autres parties de l'application
module.exports = connection;
