import { NextResponse } from "next/server"
import { getDatabase, maskCardNumber } from "@/lib/db"

// Fonction simplifiée pour vérifier l'authentification
function getUserFromSession() {
  // Pour cette démonstration, nous allons toujours retourner l'utilisateur avec l'ID 1
  return { id: 1 }
}

// Obtenir les méthodes de paiement de l'utilisateur
export async function GET() {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const db = getDatabase()

    // Récupérer les méthodes de paiement de l'utilisateur
    const paymentMethods = db
      .prepare(`
      SELECT id, type, cardNumber, cardHolder, expiryDate, isDefault
      FROM payment_methods
      WHERE userId = ?
      ORDER BY isDefault DESC, id ASC
    `)
      .all(user.id)

    // Masquer les numéros de carte
    const maskedPaymentMethods = paymentMethods.map((method) => ({
      ...method,
      cardNumber: maskCardNumber(method.cardNumber),
    }))

    return NextResponse.json(maskedPaymentMethods)
  } catch (error) {
    console.error("Erreur lors de la récupération des méthodes de paiement:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des méthodes de paiement" }, { status: 500 })
  }
}

// Ajouter une nouvelle méthode de paiement
export async function POST(request: Request) {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { type, cardNumber, cardHolder, expiryDate, isDefault } = body

    // Validation de base
    if (!type || !cardNumber || !cardHolder || !expiryDate) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const db = getDatabase()

    // Si cette carte est définie par défaut, désactiver les autres cartes par défaut
    if (isDefault) {
      db.prepare(`
        UPDATE payment_methods
        SET isDefault = 0
        WHERE userId = ?
      `).run(user.id)
    }

    // Insérer la nouvelle méthode de paiement
    const insertMethod = db.prepare(`
      INSERT INTO payment_methods (userId, type, cardNumber, cardHolder, expiryDate, isDefault)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = insertMethod.run(user.id, type, cardNumber, cardHolder, expiryDate, isDefault ? 1 : 0)

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: "Méthode de paiement ajoutée avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout de la méthode de paiement:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout de la méthode de paiement" }, { status: 500 })
  }
}

