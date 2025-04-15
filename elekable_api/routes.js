// routes.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // On importe le module de connexion à MySQL

// ===============================
// Route GET : Récupérer tous les utilisateurs
// ===============================
router.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des utilisateurs :", err);
            return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
        }
        res.json(results);
    });
});

// ===============================
// Route GET : Récupérer un utilisateur par son ID
// ===============================
router.get('/users/:id', (req, res) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'utilisateur :", err);
            return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json(results[0]);
    });
});

// ===============================
// Route POST : Créer un nouvel utilisateur
// ===============================
router.post('/users', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Le username et le password sont requis" });
    }
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error("Erreur lors de la création de l'utilisateur :", err);
            return res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
        }
        res.status(201).json({ message: "Utilisateur créé", id: result.insertId, username, password });
    });
});

// ===============================
// Route PUT : Mettre à jour un utilisateur existant
// ===============================
router.put('/users/:id', (req, res) => {
    const { username, password } = req.body;
    const sql = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
    db.query(sql, [username, password, req.params.id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
            return res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json({ message: "Utilisateur mis à jour" });
    });
});

// ===============================
// Route DELETE : Supprimer un utilisateur
// ===============================
router.delete('/users/:id', (req, res) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression de l'utilisateur :", err);
            return res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json({ message: "Utilisateur supprimé" });
    });
});

// Exemple de route pour tester la connexion à la base de données
router.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            return res.status(500).send('Erreur lors de l\'exécution de la requête.');
        }
        res.json(results[0]);
    });
});

module.exports = router;
