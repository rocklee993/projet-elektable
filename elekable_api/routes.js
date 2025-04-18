// routes.js
const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ======== Config JWT ========
const JWT_SECRET = process.env.JWT_SECRET || 'my_jwt_secret';
const TOKEN_EXPIRATION = '24h';

// ======== Middleware d'authentification ========
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
        req.user = user;
        next();
    });
}

// ======== /api/auth/register ========
router.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, phone, address, birthDate } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword)
        return res.status(400).json({ success:false, message:'Champs requis manquants' });
    if (password !== confirmPassword)
        return res.status(400).json({ success:false, message:'Les mots de passe ne correspondent pas' });

    try {
        const [existing] = await db.promise().query('SELECT id_utilisateur FROM utilisateur WHERE email = ?', [email]);
        if (existing.length) return res.status(400).json({ success:false, message:'Email déjà utilisé' });

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.promise().execute(
            'INSERT INTO utilisateur (prenom, nom, email, mot_de_passe, telephone, adresse, date_naissance, solde) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, hashed, phone, address, birthDate, 0]
        );

        const userId = result.insertId;
        const user = { id: userId, firstName, lastName, email };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

        res.status(201).json({ success:true, message:'Utilisateur créé', userId, accessToken, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Erreur serveur' });
    }
});

// ======== /api/auth/login ========
router.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Champs requis manquants' });

    try {
        const [rows] = await db.promise().query('SELECT * FROM utilisateur WHERE email = ?', [email]);
        const userRow = rows[0];
        if (!userRow) return res.status(400).json({ success:false, message:'Identifiants invalides' });

        const match = await bcrypt.compare(password, userRow.mot_de_passe);
        if (!match) return res.status(400).json({ success:false, message:'Identifiants invalides' });

        const user = { id: userRow.id_utilisateur, firstName: userRow.prenom, lastName: userRow.nom, email: userRow.email };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

        res.json({ success:true, accessToken, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Erreur serveur' });
    }
});

// ======== /api/auth/refresh ========
router.post('/api/auth/refresh', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success:false, error:'Token manquant' });

    jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }, (err, user) => {
        if (err) return res.status(403).json({ success:false, error:'Token invalide' });
        const { id, firstName, lastName, email } = user;
        const newToken = jwt.sign({ id, firstName, lastName, email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
        res.json({ success:true, accessToken: newToken });
    });
});

// ======== /api/auth/logout ========
router.post('/api/auth/logout', authenticateToken, (req, res) => {
    // TODO: implémenter un blacklist de tokens si nécessaire
    res.json({ success:true, message:'Déconnecté avec succès' });
});

// ======== /api/users/me (GET) ========
router.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT id_utilisateur, prenom, nom, email, telephone, adresse, date_naissance, solde FROM utilisateur WHERE id_utilisateur = ?',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ error:'Utilisateur non trouvé' });
        const u = rows[0];
        res.json({
            id: u.id_utilisateur,
            firstName: u.prenom,
            lastName: u.nom,
            email: u.email,
            phone: u.telephone,
            address: u.adresse,
            birthDate: u.date_naissance,
            balance: parseFloat(u.solde)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/users/me (PUT) ========
router.put('/api/users/me', authenticateToken, async (req, res) => {
    const { firstName, lastName, phone, address, birthDate } = req.body;
    try {
        await db.promise().execute(
            'UPDATE utilisateur SET prenom=?, nom=?, telephone=?, adresse=?, date_naissance=? WHERE id_utilisateur=?',
            [firstName, lastName, phone, address, birthDate, req.user.id]
        );
        res.json({ success:true, message:'Profil mis à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Erreur serveur' });
    }
});

// ======== /api/users/balance (GET) ========
router.get('/api/users/balance', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT solde FROM utilisateur WHERE id_utilisateur = ?', [req.user.id]);
        res.json({ balance: parseFloat(rows[0].solde) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/users/balance (PUT) ========
router.put('/api/users/balance', authenticateToken, async (req, res) => {
    const { amount } = req.body;
    try {
        await db.promise().execute('UPDATE utilisateur SET solde=solde+? WHERE id_utilisateur=?', [amount, req.user.id]);
        const [rows] = await db.promise().query('SELECT solde FROM utilisateur WHERE id_utilisateur = ?', [req.user.id]);
        res.json({ success:true, balance: parseFloat(rows[0].solde) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Erreur serveur' });
    }
});

// ======== /api/electricity/prices (GET) ========
router.get('/api/electricity/prices', authenticateToken, async (req, res) => {
    // Table `electricity_price(date, price)` attendue
    try {
        const [rows] = await db.promise().query('SELECT date, price FROM electricity_price ORDER BY date');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/electricity/current-price (GET) ========
router.get('/api/electricity/current-price', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT price FROM electricity_price ORDER BY date DESC LIMIT 1'
        );
        res.json({ price: parseFloat(rows[0].price) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/transactions/buy (POST) ========
router.post('/api/transactions/buy', authenticateToken, async (req, res) => {
    const { amount, useCard = false } = req.body;
    try {
        // 1) Récupérer le prix actuel
        const [rowsPrice] = await db.promise().query(
            'SELECT price FROM electricity_price ORDER BY date DESC LIMIT 1'
        );
        if (rowsPrice.length === 0) {
            return res.status(500).json({ success: false, message: 'Aucun prix disponible' });
        }
        // MySQL DECIMAL ressort en string, on convertit en nombre
        const price = parseFloat(rowsPrice[0].price);

        // 2) Calculer et valider la quantité
        const rawQuantity = amount / price;
        const quantity = Math.floor(rawQuantity);
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: `Le montant minimum pour un achat est de ${price.toFixed(2)} € pour 1 kWh`
            });
        }

        // 3) Recalculer le total sur la base de la quantité entière
        const totalAmount = parseFloat((quantity * price).toFixed(2));

        // 4) Créer la commande
        const [result] = await db.promise().execute(
            'INSERT INTO commande (id_utilisateur, statut, total) VALUES (?, ?, ?)',
            [req.user.id, 'payée', totalAmount]
        );
        const insertId = result.insertId;

        // 5) Lier le produit kWh (id_produit = 1)
        await db.promise().execute(
            'INSERT INTO commande_produit (id_commande, id_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
            [insertId, 1, quantity, price]
        );

        // 6) Mettre à jour le solde si nécessaire
        let amountFromBalance = 0;
        let amountFromCard = 0;
        if (!useCard) {
            amountFromBalance = totalAmount;
            await db.promise().execute(
                'UPDATE utilisateur SET solde = solde - ? WHERE id_utilisateur = ?',
                [totalAmount, req.user.id]
            );
        } else {
            amountFromCard = totalAmount;
        }

        // 7) Créer le paiement
        await db.promise().execute(
            'INSERT INTO paiement (id_commande, moyen, montant, statut) VALUES (?, ?, ?, ?)',
            [insertId, useCard ? 'Carte Bancaire' : 'Solde', totalAmount, 'réussi']
        );

        // 8) Générer un numéro de facture
        const invoiceNumber = `${insertId}-${Date.now()}`;

        // 9) Récupérer le solde mis à jour
        const [rowsUser] = await db.promise().query(
            'SELECT solde FROM utilisateur WHERE id_utilisateur = ?',
            [req.user.id]
        );
        const balance = rowsUser.length ? parseFloat(rowsUser[0].solde) : 0;

        // 10) Répondre
        res.json({
            success: true,
            message: 'Achat effectué',
            transaction: {
                id: insertId,
                type: 'Achat',
                amount: totalAmount,
                quantity,
                price,
                date: new Date().toISOString(),
                paymentMethod: useCard ? 'Carte Bancaire' : 'Solde',
                amountFromBalance,
                amountFromCard
            },
            invoiceNumber,
            balance
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ======== /api/transactions/sell (POST) ========
router.post('/api/transactions/sell', authenticateToken, async (req, res) => {
    const { amount } = req.body; // quantité en kWh à vendre
    try {
        // 1) Récupérer le prix actuel
        const [rowsPrice] = await db.promise().query(
            'SELECT price FROM electricity_price ORDER BY date DESC LIMIT 1'
        );
        if (rowsPrice.length === 0) {
            return res.status(500).json({ success: false, message: 'Aucun prix disponible' });
        }
        const price = parseFloat(rowsPrice[0].price);

        // 2) Calculer montant brut, commission (5%) et net
        const montant = parseFloat((amount * price).toFixed(2));
        const commission = parseFloat((montant * 0.05).toFixed(2));
        const totalNet = parseFloat((montant - commission).toFixed(2));

        // 3) Créer la commande
        const [result] = await db.promise().execute(
            'INSERT INTO commande (id_utilisateur, statut, total) VALUES (?, ?, ?)',
            [req.user.id, 'payée', totalNet]
        );
        const insertId = result.insertId;

        // 4) Lier le produit kWh (id_produit = 1) – quantité positive
        await db.promise().execute(
            'INSERT INTO commande_produit (id_commande, id_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
            [insertId, 1, amount, price]
        );

        // 5) Mettre à jour le solde de l’utilisateur (+ totalNet)
        await db.promise().execute(
            'UPDATE utilisateur SET solde = solde + ? WHERE id_utilisateur = ?',
            [totalNet, req.user.id]
        );

        // 6) Enregistrer le paiement
        await db.promise().execute(
            'INSERT INTO paiement (id_commande, moyen, montant, statut) VALUES (?, ?, ?, ?)',
            [insertId, 'Vente', totalNet, 'réussi']
        );

        // 7) Générer un numéro de facture
        const invoiceNumber = `${insertId}-${Date.now()}`;

        // 8) Récupérer le solde mis à jour
        const [rowsUser] = await db.promise().query(
            'SELECT solde FROM utilisateur WHERE id_utilisateur = ?',
            [req.user.id]
        );
        const balance = rowsUser.length ? parseFloat(rowsUser[0].solde) : 0;

        // 9) Répondre
        res.json({
            success: true,
            message: 'Vente effectuée',
            transaction: {
                id: insertId,
                type: 'Vente',
                amount: totalNet,
                quantity: amount,
                price,
                commission,
                date: new Date().toISOString()
            },
            invoiceNumber,
            balance
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ======== /api/transactions/history (GET) ========
router.get('/api/transactions/history', authenticateToken, async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    try {
        const [rows] = await db.promise().query(
            `SELECT c.id_commande AS id, c.date_commande AS date, c.statut AS type,
              cp.quantite AS amount, cp.quantite AS quantity, cp.prix_unitaire AS price,
              p.moyen AS paymentMethod
       FROM commande c
       JOIN commande_produit cp ON c.id_commande=cp.id_commande
       JOIN paiement p ON p.id_commande=c.id_commande
       WHERE c.id_utilisateur=?
       ORDER BY c.date_commande DESC
       LIMIT ?`,
            [req.user.id, limit]
        );
        res.json(rows.map(r => ({ ...r, date: r.date.toISOString() })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/invoices (GET) ========
router.get('/api/invoices', authenticateToken, async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    try {
        const [rows] = await db.promise().query(
            `SELECT f.id_facture AS id, f.montant_total AS amount, f.date_emission AS date,
              f.fichier_pdf AS invoiceNumber, c.statut AS status
       FROM facture f
       JOIN commande c ON f.id_commande=c.id_commande
       WHERE c.id_utilisateur=?
       ORDER BY f.date_emission DESC
       LIMIT ?`,
            [req.user.id, limit]
        );
        res.json(rows.map(r => ({ ...r, date: r.date.toISOString() })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/invoices/:id (GET) ========
router.get('/api/invoices/:id', authenticateToken, async (req, res) => {
    try {
        const [[inv]] = await db.promise().query(
            `SELECT f.id_facture AS id, f.montant_total AS amount, f.date_emission AS date,
              f.fichier_pdf AS invoiceNumber, c.statut AS status, u.prenom, u.nom, u.email, u.adresse
       FROM facture f
       JOIN commande c ON f.id_commande=c.id_commande
       JOIN utilisateur u ON c.id_utilisateur=u.id_utilisateur
       WHERE f.id_facture=? AND u.id_utilisateur=?`,
            [req.params.id, req.user.id]
        );
        if (!inv) return res.status(404).json({ message:'Facture non trouvée' });
        res.json({ invoice: { ...inv, date: inv.date.toISOString() }, user: { firstName: inv.prenom, lastName: inv.nom, email: inv.email, address: inv.adresse } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/payment/methods (GET) ========
router.get('/api/payment/methods', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT id, type, card_number AS cardNumber, card_holder AS cardHolder, expiry_date AS expiryDate, is_default AS isDefault FROM payment_methods WHERE user_id=?',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error:'Erreur serveur' });
    }
});

// ======== /api/payment/methods (POST) ========
router.post('/api/payment/methods', authenticateToken, async (req, res) => {
    const { type, cardNumber, cardHolder, expiryDate, isDefault=false } = req.body;
    try {
        const [{ insertId }] = await db.promise().execute(
            'INSERT INTO payment_methods (user_id, type, card_number, card_holder, expiry_date, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, type, cardNumber, cardHolder, expiryDate, isDefault]
        );
        res.status(201).json({ success:true, id: insertId, message:'Méthode ajoutée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Erreur serveur' });
    }
});

// ======== /api/payment/methods/:id (DELETE) ========
router.delete('/api/payment/methods/:id', authenticateToken, async (req, res) => {
    try {
        const [{ affectedRows }] = await db.promise().execute(
            'DELETE FROM payment_methods WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]
        );
        if (!affectedRows) return res.status(404).json({ message:'Méthode non trouvée' });
        res.json({ success:true, message:'Méthode supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Erreur serveur' });
    }
});

// ======== /api/payment/methods/:id (PUT) ========
router.put('/api/payment/methods/:id', authenticateToken, async (req, res) => {
    try {
        await db.promise().execute(
            'UPDATE payment_methods SET is_default=1 WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]
        );
        // Optionnel: reset les autres en is_default=0
        res.json({ success:true, message:'Méthode définie par défaut' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Erreur serveur' });
    }
});

//= /api/users/password (PUT) ========
router.put('/api/users/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    try {
        // Fetch the user's current password hash
        const [rows] = await db.promise().query(
            'SELECT mot_de_passe FROM utilisateur WHERE id_utilisateur = ?',
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].mot_de_passe);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await db.promise().execute(
            'UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
