const express = require('express');
const app = express();

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

// Importer le module des routes
const routes = require('./routes');

// Utiliser les routes, par exemple sous le préfixe /api
app.use('/api', routes);

// Démarrage du serveur sur le port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serveur API en marche sur le port ${port}`);
});
