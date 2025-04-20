const mysql = require('mysql2');

const config = {
    host: process.env.DB_HOST || 'mariadb',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'userpass',
    database: process.env.DB_NAME || 'app_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('🔧 Configuration de la base de données :');
console.log(`   ➤ Hôte       : ${config.host}`);
console.log(`   ➤ Port       : ${config.port}`);
console.log(`   ➤ Utilisateur: ${config.user}`);
console.log(`   ➤ Base       : ${config.database}`);

// ✅ Création immédiate du pool avec .promise()
const db = mysql.createPool(config).promise();

module.exports = db;
