CREATE DATABASE IF NOT EXISTS elektable DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elektable;

CREATE TABLE utilisateur (
                             id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
                             nom VARCHAR(100) NOT NULL,
                             prenom VARCHAR(100) NOT NULL,
                             email VARCHAR(150) NOT NULL UNIQUE,
                             mot_de_passe VARCHAR(255) NOT NULL,
                             adresse TEXT,
                             telephone VARCHAR(20),
                             date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
                             type_utilisateur ENUM('client', 'admin') DEFAULT 'client'
);


CREATE TABLE produit (
                         id_produit INT AUTO_INCREMENT PRIMARY KEY,
                         nom VARCHAR(100) NOT NULL,
                         description TEXT,
                         type_produit ENUM('kWh', 'abonnement') NOT NULL,
                         prix_unitaire DECIMAL(10,2) NOT NULL,
                         unite VARCHAR(20) NOT NULL,
                         actif BOOLEAN DEFAULT TRUE,
                         date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT chk_prix_unitaire CHECK (prix_unitaire >= 0)
);


CREATE TABLE commande (
                          id_commande INT AUTO_INCREMENT PRIMARY KEY,
                          id_utilisateur INT NOT NULL,
                          date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
                          statut ENUM('en attente', 'payée', 'annulée') DEFAULT 'en attente',
                          total DECIMAL(10,2),
                          FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);


CREATE TABLE commande_produit (
                                  id_commande INT NOT NULL,
                                  id_produit INT NOT NULL,
                                  quantite INT NOT NULL,
                                  prix_unitaire DECIMAL(10,2) NOT NULL,
                                  PRIMARY KEY (id_commande, id_produit),
                                  FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE,
                                  FOREIGN KEY (id_produit) REFERENCES produit(id_produit),
                                  CONSTRAINT chk_quantite_positive CHECK (quantite > 0)
);

CREATE TABLE facture (
                         id_facture INT AUTO_INCREMENT PRIMARY KEY,
                         id_commande INT NOT NULL,
                         date_emission DATETIME DEFAULT CURRENT_TIMESTAMP,
                         montant_total DECIMAL(10,2),
                         fichier_pdf VARCHAR(255),
                         FOREIGN KEY (id_commande) REFERENCES commande(id_commande)
);


CREATE TABLE paiement (
                          id_paiement INT AUTO_INCREMENT PRIMARY KEY,
                          id_commande INT NOT NULL,
                          moyen VARCHAR(50) NOT NULL,
                          date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
                          montant DECIMAL(10,2) NOT NULL,
                          statut ENUM('réussi', 'échoué', 'en attente') DEFAULT 'en attente',
                          FOREIGN KEY (id_commande) REFERENCES commande(id_commande),
                          CONSTRAINT chk_montant_paiement CHECK (montant >= 0)
);

CREATE INDEX idx_commande_utilisateur ON commande(id_utilisateur);
CREATE INDEX idx_commande_produit_commande ON commande_produit(id_commande);
CREATE INDEX idx_commande_produit_produit ON commande_produit(id_produit);
CREATE INDEX idx_facture_commande ON facture(id_commande);
CREATE INDEX idx_paiement_commande ON paiement(id_commande);

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, adresse, telephone, type_utilisateur)
VALUES
    ('Dupont', 'Jean', 'jean.dupont@example.com', 'hashedpassword123', '12 rue de Paris, 75000 Paris', '0601020304', 'client'),
    ('Martin', 'Alice', 'alice.martin@example.com', 'hashedpassword456', '25 avenue de Lyon, 69000 Lyon', '0611223344', 'client'),
    ('Admin', 'Super', 'admin@elektable.com', 'hashedadminpass', '1 place centrale, 75001 Paris', '0600000000', 'admin');


INSERT INTO produit (nom, description, type_produit, prix_unitaire, unite)
VALUES
    ('Électricité - kWh', 'Énergie électrique facturée à l’unité', 'kWh', 0.15, 'kWh'),
    ('Abonnement Mensuel 5 kWh/jour', 'Formule mensuelle pour 5 kWh par jour', 'abonnement', 45.00, 'mois'),
    ('Abonnement Mensuel 10 kWh/jour', 'Formule mensuelle pour 10 kWh par jour', 'abonnement', 80.00, 'mois');


INSERT INTO commande (id_utilisateur, statut, total)
VALUES (1, 'payée', 60.00);


INSERT INTO commande (id_utilisateur, statut, total)
VALUES (2, 'en attente', 80.00);


INSERT INTO commande_produit (id_commande, id_produit, quantite, prix_unitaire)
VALUES
    (1, 1, 100, 0.15),
    (1, 2, 1, 45.00),
    (2, 3, 1, 80.00);

INSERT INTO facture (id_commande, montant_total, fichier_pdf)
VALUES
    (1, 60.00, 'factures/facture_1.pdf'),
    (2, 80.00, NULL);


INSERT INTO paiement (id_commande, moyen, montant, statut)
VALUES
    (1, 'Carte Bancaire', 60.00, 'réussi'),
    (2, 'PayPal', 80.00, 'en attente');

ALTER TABLE utilisateur
    ADD COLUMN date_naissance DATE,
  ADD COLUMN solde DECIMAL(10,2) DEFAULT 0;

CREATE TABLE electricity_price (
                                   date DATE PRIMARY KEY,
                                   price DECIMAL(10,2)
);

CREATE TABLE payment_methods (
                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                 user_id INT NOT NULL,
                                 type VARCHAR(50) NOT NULL,
                                 card_number VARCHAR(30) NOT NULL,
                                 card_holder VARCHAR(100) NOT NULL,
                                 expiry_date DATE NOT NULL,
                                 is_default BOOLEAN DEFAULT FALSE,
                                 FOREIGN KEY (user_id) REFERENCES utilisateur(id_utilisateur)
);


-- 1. Historique des prix de l'électricité (la semaine précédente)
INSERT INTO electricity_price(`date`, price) VALUES
                                                 ('2025-04-10', 0.14),
                                                 ('2025-04-11', 0.15),
                                                 ('2025-04-12', 0.16),
                                                 ('2025-04-13', 0.15),
                                                 ('2025-04-14', 0.14),
                                                 ('2025-04-15', 0.13),
                                                 ('2025-04-16', 0.15);

-- 2. Méthodes de paiement pour les utilisateurs existants (id_utilisateur = 1, 2)
INSERT INTO payment_methods(user_id, type, card_number, card_holder, expiry_date, is_default) VALUES
                                                                                                  (1, 'Carte Bancaire', '4111111111111111', 'Jean Dupont', '2026-12-31', TRUE),
                                                                                                  (1, 'PayPal',           'pp_jean@example.com', 'Jean Dupont', '2030-01-01', FALSE),
                                                                                                  (2, 'Carte Bancaire', '5555555555554444', 'Alice Martin', '2027-11-30', TRUE),
                                                                                                  (2, 'Carte Bancaire', '4012888888881881', 'Alice Martin', '2030-06-30', FALSE);

-- 3. Commandes supplémentaires pour tests
--    On suppose que les deux premières commandes ont id_commande = 1 et 2
INSERT INTO commande(id_utilisateur, statut, total) VALUES
                                                        (1, 'en attente', 30.00),   -- id_commande = 3
                                                        (2, 'annulée',   50.00);    -- id_commande = 4

-- 4. Liaison produits sur ces commandes
INSERT INTO commande_produit(id_commande, id_produit, quantite, prix_unitaire) VALUES
                                                                                   (3, 1, 200, 0.15),  -- 200 kWh à 0.15€
                                                                                   (4, 2,   1, 45.00); -- 1 abonnement 5 kWh/jour à 45€

-- 5. Factures correspondantes
INSERT INTO facture(id_commande, montant_total, fichier_pdf) VALUES
                                                                 (3, 30.00, NULL),
                                                                 (4, 50.00, NULL);

-- 6. Paiements de test
INSERT INTO paiement(id_commande, moyen, montant, statut)
VALUES
    (3, 'Solde',    30.00, 'réussi'),
    (4, 'Carte Bancaire', 50.00, 'échoué');

-- ===== Insertion de commandes + factures pour tester /api/invoices =====

-- Pour l'utilisateur 1, commande payée à 20€
INSERT INTO commande (id_utilisateur, statut, total)
VALUES (1, 'payée', 20.00);
SET @cmd1 = LAST_INSERT_ID();
INSERT INTO facture (id_commande, montant_total, fichier_pdf)
VALUES (@cmd1, 20.00, 'factures/facture_user1_20.pdf');

-- Pour l'utilisateur 1, commande en attente à 45.50€
INSERT INTO commande (id_utilisateur, statut, total)
VALUES (1, 'en attente', 45.50);
SET @cmd2 = LAST_INSERT_ID();
INSERT INTO facture (id_commande, montant_total, fichier_pdf)
VALUES (@cmd2, 45.50, 'factures/facture_user1_45.pdf');

-- Pour l'utilisateur 2, commande payée à 60.75€
INSERT INTO commande (id_utilisateur, statut, total)
VALUES (2, 'payée', 60.75);
SET @cmd3 = LAST_INSERT_ID();
INSERT INTO facture (id_commande, montant_total, fichier_pdf)
VALUES (@cmd3, 60.75, 'factures/facture_user2_60.pdf');

INSERT INTO payment_methods (user_id, type, card_number, card_holder, expiry_date, is_default)
VALUES
    (4, 'Carte Bancaire',   '4111111111111111', 'Test User4', '2026-12-31', TRUE),
    (4, 'PayPal',           'pp_user4@example.com', 'Test User4', '2030-01-01', FALSE),
    (4, 'Carte Bancaire',   '5555555555554444', 'Test User4', '2027-11-30', FALSE);
