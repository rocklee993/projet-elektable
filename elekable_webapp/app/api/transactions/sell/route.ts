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
    const { amount } = body

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

    // Calculer le montant total (avec commission de 5%)
    const subtotal = amount * currentPrice.price
    const commission = subtotal * 0.05
    const totalAmount = subtotal - commission

    // Commencer une transaction
    db.exec("BEGIN TRANSACTION")

    try {
      // Mettre à jour le solde de l'utilisateur
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(totalAmount, user.id)

      // Enregistrer la transaction
      const insertTransaction = db.prepare(`
        INSERT INTO transactions (userId, type, amount, quantity, price, paymentMethod)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      const transactionResult = insertTransaction.run(
        user.id,
        "Vente",
        totalAmount,
        amount,
        currentPrice.price,
        "solde", // La vente est toujours créditée sur le solde
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
        message: "Vente effectuée avec succès",
        transaction: {
          id: transactionResult.lastInsertRowid,
          type: "Vente",
          amount: totalAmount,
          quantity: amount,
          price: currentPrice.price,
          commission,
          date: new Date().toISOString(),
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
    console.error("Erreur lors de la vente:", error)
    return NextResponse.json({ error: "Erreur lors de la vente" }, { status: 500 })
  }
}

