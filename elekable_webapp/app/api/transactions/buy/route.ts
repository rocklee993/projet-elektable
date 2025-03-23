import { NextResponse } from "next/server"
import { getDatabase, generateInvoiceNumber } from "@/lib/db"

// Fonction simplifiée pour vérifier l'authentification
function getUserFromSession() {
  // Pour cette démonstration, nous allons toujours retourner l'utilisateur avec l'ID 1
  return { id: 1 }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, useCard = false } = body

    // Validation de base
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Quantité invalide" }, { status: 400 })
    }

    const db = getDatabase()

    // Récupérer le prix actuel
    const currentPrice = db
      .prepare(`
      SELECT price
      FROM electricity_prices
      ORDER BY date DESC
      LIMIT 1
    `)
      .get()

    if (!currentPrice) {
      return NextResponse.json({ error: "Prix non disponible" }, { status: 404 })
    }

    // Calculer le montant total
    const totalAmount = amount * currentPrice.price

    // Récupérer le solde de l'utilisateur
    const userData = db.prepare("SELECT balance FROM users WHERE id = ?").get(user.id)

    // Vérifier si l'utilisateur a une carte de paiement par défaut
    const defaultCard = db
      .prepare(`
      SELECT id FROM payment_methods 
      WHERE userId = ? AND isDefault = 1
    `)
      .get(user.id)

    // Déterminer la méthode de paiement
    let paymentMethod = "solde"
    let amountFromBalance = 0
    let amountFromCard = 0

    if (userData.balance >= totalAmount && !useCard) {
      // Utiliser uniquement le solde
      amountFromBalance = totalAmount
    } else if (defaultCard) {
      // Utiliser d'abord le solde puis la carte
      amountFromBalance = Math.min(userData.balance, totalAmount)
      amountFromCard = totalAmount - amountFromBalance
      paymentMethod = amountFromCard > 0 ? "carte" : "solde"
    } else {
      // Pas assez de solde et pas de carte
      return NextResponse.json({ error: "Solde insuffisant et aucune carte de paiement disponible" }, { status: 400 })
    }

    // Commencer une transaction
    db.exec("BEGIN TRANSACTION")

    try {
      // Mettre à jour le solde de l'utilisateur
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amountFromBalance, user.id)

      // Enregistrer la transaction
      const insertTransaction = db.prepare(`
        INSERT INTO transactions (userId, type, amount, quantity, price, paymentMethod)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      const transactionResult = insertTransaction.run(
        user.id,
        "Achat",
        totalAmount,
        amount,
        currentPrice.price,
        paymentMethod,
      )

      // Générer une facture
      const invoiceNumber = generateInvoiceNumber()

      const insertInvoice = db.prepare(`
        INSERT INTO invoices (userId, transactionId, invoiceNumber, amount)
        VALUES (?, ?, ?, ?)
      `)

      insertInvoice.run(user.id, transactionResult.lastInsertRowid, invoiceNumber, totalAmount)

      // Valider la transaction
      db.exec("COMMIT")

      // Récupérer le nouveau solde
      const newBalance = db.prepare("SELECT balance FROM users WHERE id = ?").get(user.id)

      return NextResponse.json({
        success: true,
        message: "Achat effectué avec succès",
        transaction: {
          id: transactionResult.lastInsertRowid,
          type: "Achat",
          amount: totalAmount,
          quantity: amount,
          price: currentPrice.price,
          date: new Date().toISOString(),
          paymentMethod,
          amountFromBalance,
          amountFromCard,
        },
        invoiceNumber,
        balance: newBalance.balance,
      })
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      db.exec("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Erreur lors de l'achat:", error)
    return NextResponse.json({ error: "Erreur lors de l'achat" }, { status: 500 })
  }
}

