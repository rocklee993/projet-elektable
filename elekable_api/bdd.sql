-- Suppression des tables existantes si elles existent
DROP TABLE IF EXISTS paiement;
DROP TABLE IF EXISTS facture;
DROP TABLE IF EXISTS commande_produit;
DROP TABLE IF EXISTS commande;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS electricity_price;
DROP TABLE IF EXISTS produit;
DROP TABLE IF EXISTS utilisateur;

-- Table utilisateur
CREATE TABLE utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    date_naissance DATE,
    solde DECIMAL(10,2) DEFAULT 0,
    type_utilisateur ENUM('client', 'admin') DEFAULT 'client',
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table produit
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

-- Table commande
CREATE TABLE commande (
    id_commande INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en attente', 'payée', 'annulée') DEFAULT 'en attente',
    total DECIMAL(10,2),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);

-- Table commande_produit
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

-- Table facture
CREATE TABLE facture (
    id_facture INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT NOT NULL,
    date_emission DATETIME DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10,2),
    fichier_pdf VARCHAR(255),
    FOREIGN KEY (id_commande) REFERENCES commande(id_commande)
);

-- Table paiement
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

-- Table electricity_price
CREATE TABLE electricity_price (
    date DATE PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL
);

-- Table payment_methods
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

-- Création des index
CREATE INDEX idx_commande_utilisateur ON commande(id_utilisateur);
CREATE INDEX idx_commande_produit_commande ON commande_produit(id_commande);
CREATE INDEX idx_commande_produit_produit ON commande_produit(id_produit);
CREATE INDEX idx_facture_commande ON facture(id_commande);
CREATE INDEX idx_paiement_commande ON paiement(id_commande);
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);

-- Insertion des données de test

-- Utilisateurs
INSERT INTO utilisateur (prenom, nom, email, mot_de_passe, telephone, adresse, date_naissance, solde, type_utilisateur)
VALUES
    ('Jean', 'Dupont', 'jean.dupont@example.com', '$2a$10$X7J3K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9', '0601020304', '12 rue de Paris, 75000 Paris', '1985-05-15', 500.00, 'client'),
    ('Alice', 'Martin', 'alice.martin@example.com', '$2a$10$X7J3K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9', '0611223344', '25 avenue de Lyon, 69000 Lyon', '1990-08-22', 300.00, 'client'),
    ('Admin', 'Super', 'admin@elektable.com', '$2a$10$X7J3K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9', '0600000000', '1 place centrale, 75001 Paris', '1980-01-01', 0.00, 'admin');

-- Produits
INSERT INTO produit (nom, description, type_produit, prix_unitaire, unite)
VALUES
    ('Électricité - kWh', 'Énergie électrique facturée à l\'unité', 'kWh', 0.15, 'kWh'),
    ('Abonnement Mensuel 5 kWh/jour', 'Formule mensuelle pour 5 kWh par jour', 'abonnement', 45.00, 'mois'),
    ('Abonnement Mensuel 10 kWh/jour', 'Formule mensuelle pour 10 kWh par jour', 'abonnement', 80.00, 'mois');

-- Prix de l'électricité
INSERT INTO electricity_price (date, price)
VALUES
    ('2025-04-10', 0.14),
    ('2025-04-11', 0.15),
    ('2025-04-12', 0.16),
    ('2025-04-13', 0.15),
    ('2025-04-14', 0.14),
    ('2025-04-15', 0.13),
    ('2025-04-16', 0.15);

-- Méthodes de paiement
INSERT INTO payment_methods (user_id, type, card_number, card_holder, expiry_date, is_default)
VALUES
    (1, 'Carte Bancaire', '4111111111111111', 'Jean Dupont', '2026-12-31', TRUE),
    (1, 'PayPal', 'pp_jean@example.com', 'Jean Dupont', '2030-01-01', FALSE),
    (2, 'Carte Bancaire', '5555555555554444', 'Alice Martin', '2027-11-30', TRUE),
    (2, 'Carte Bancaire', '4012888888881881', 'Alice Martin', '2030-06-30', FALSE);

-- Commandes
INSERT INTO commande (id_utilisateur, statut, total)
VALUES
    (1, 'payée', 60.00),
    (2, 'en attente', 80.00),
    (1, 'en attente', 30.00),
    (2, 'annulée', 50.00);

-- Commandes produits
INSERT INTO commande_produit (id_commande, id_produit, quantite, prix_unitaire)
VALUES
    (1, 1, 100, 0.15),
    (1, 2, 1, 45.00),
    (2, 3, 1, 80.00),
    (3, 1, 200, 0.15),
    (4, 2, 1, 45.00);

-- Factures
INSERT INTO facture (id_commande, montant_total, fichier_pdf)
VALUES
    (1, 60.00, 'factures/facture_1.pdf'),
    (2, 80.00, NULL),
    (3, 30.00, NULL),
    (4, 50.00, NULL);

-- Paiements
INSERT INTO paiement (id_commande, moyen, montant, statut)
VALUES
    (1, 'Carte Bancaire', 60.00, 'réussi'),
    (2, 'PayPal', 80.00, 'en attente'),
    (3, 'Solde', 30.00, 'réussi'),
    (4, 'Carte Bancaire', 50.00, 'échoué');
