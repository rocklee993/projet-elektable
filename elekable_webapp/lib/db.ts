import path from "path"
import fs from "fs"

// Assurez-vous que le dossier db existe
const dbDir = path.join(process.cwd(), "db")
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, "elekable.db")

// Fonction pour initialiser la base de données
export function initializeDatabase() {
  const sqlite = require("better-sqlite3")
  const db = new sqlite(dbPath)

  // Activer les clés étrangères
  db.pragma("foreign_keys = ON")

  // Créer la table des utilisateurs si elle n'existe pas
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      balance REAL DEFAULT 100.0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Créer la table des prix de l'électricité
  db.exec(`
    CREATE TABLE IF NOT EXISTS electricity_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      price REAL NOT NULL
    );
  `)

  // Créer la table des transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      paymentMethod TEXT NOT NULL DEFAULT 'solde',
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `)

  // Créer la table des factures
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      transactionId INTEGER NOT NULL,
      invoiceNumber TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'Payée',
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (transactionId) REFERENCES transactions(id)
    );
  `)

  // Créer la table des méthodes de paiement
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      cardNumber TEXT NOT NULL,
      cardHolder TEXT NOT NULL,
      expiryDate TEXT NOT NULL,
      isDefault INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `)

  // Insérer des données de prix d'électricité si la table est vide
  const priceCount = db.prepare("SELECT COUNT(*) as count FROM electricity_prices").get()
  if (priceCount.count === 0) {
    const today = new Date()
    const prices = [
      { date: new Date(today.setDate(today.getDate() - 6)).toISOString().split("T")[0], price: 0.1756 },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0], price: 0.1823 },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0], price: 0.1795 },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0], price: 0.1812 },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0], price: 0.1867 },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0], price: 0.1834 },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0], price: 0.1842 },
    ]

    const insertPrice = db.prepare("INSERT INTO electricity_prices (date, price) VALUES (?, ?)")
    prices.forEach((price) => {
      insertPrice.run(price.date, price.price)
    })
  }

  return db
}

// Fonction pour obtenir une instance de la base de données
export function getDatabase() {
  const sqlite = require("better-sqlite3")
  return new sqlite(dbPath)
}

// Fonction pour générer un numéro de facture
export function generateInvoiceNumber() {
  return `INV-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
}

// Fonction pour hacher un mot de passe (simplifiée pour l'exemple)
export function hashPassword(password: string): string {
  // Dans une application réelle, utilisez bcrypt ou argon2
  return require("crypto").createHash("sha256").update(password).digest("hex")
}

// Fonction pour vérifier un mot de passe (simplifiée pour l'exemple)
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Ajouter cette fonction pour créer un utilisateur par défaut si nécessaire
export function ensureDefaultUser() {
  const db = getDatabase()

  // Vérifier si l'utilisateur par défaut existe
  const user = db.prepare("SELECT * FROM users WHERE id = 1").get()

  if (!user) {
    // Créer un utilisateur par défaut
    const insertUser = db.prepare(`
      INSERT INTO users (id, firstName, lastName, email, password, phone, address, birthDate, balance)
      VALUES (1, 'Jean', 'Dupont', 'jean.dupont@exemple.fr', ?, '0612345678', '123 Rue de l\'Exemple, 75000 Paris', '1985-05-15', 500.0)
    `)

    insertUser.run(hashPassword("password123"))

    console.log("Utilisateur par défaut créé")

    // Ajouter une carte de paiement par défaut
    const insertCard = db.prepare(`
      INSERT INTO payment_methods (userId, type, cardNumber, cardHolder, expiryDate, isDefault)
      VALUES (1, 'Visa', '4111 XXXX XXXX 1111', 'Jean Dupont', '12/25', 1)
    `)

    insertCard.run()
    console.log("Carte de paiement par défaut créée")
  }

  return db
}

// Fonction pour masquer le numéro de carte
export function maskCardNumber(cardNumber: string): string {
  // Garder les 4 premiers et les 4 derniers chiffres, masquer le reste
  const cleaned = cardNumber.replace(/\s+/g, "")
  if (cleaned.length <= 8) return cleaned

  const firstFour = cleaned.substring(0, 4)
  const lastFour = cleaned.substring(cleaned.length - 4)
  const masked = "X".repeat(cleaned.length - 8)

  // Formater avec des espaces tous les 4 chiffres
  return `${firstFour} ${masked.substring(0, 4)} ${masked.substring(4, 8)} ${lastFour}`
}

