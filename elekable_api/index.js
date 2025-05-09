const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's URL
    credentials: true, // Allow cookies and credentials
}));

// Importer le module des routes
const routes = require('./routes');

// Utiliser les routes, par exemple sous le préfixe /api
app.use('', routes);

// Démarrage du serveur sur le port 5000
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Serveur API en marche sur le port ${port}`);
});