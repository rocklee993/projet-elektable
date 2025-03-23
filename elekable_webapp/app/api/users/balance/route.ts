import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

// Fonction simplifiée pour vérifier l'authentification
function getUserFromSession() {
  // Pour cette démonstration, nous allons toujours retourner l'utilisateur avec l'ID 1
  return { id: 1 }
}

// Obtenir le solde de l'utilisateur
export async function GET() {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const db = getDatabase()

    // Récupérer le solde de l'utilisateur
    const userData = db.prepare("SELECT balance FROM users WHERE id = ?").get(user.id)

    if (!userData) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ balance: userData.balance })
  } catch (error) {
    console.error("Erreur lors de la récupération du solde:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du solde" }, { status: 500 })
  }
}

// Mettre à jour le solde de l'utilisateur
export async function PUT(request: Request) {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (typeof amount !== "number") {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 })
    }

    const db = getDatabase()

    // Mettre à jour le solde de l'utilisateur
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, user.id)

    // Récupérer le nouveau solde
    const userData = db.prepare("SELECT balance FROM users WHERE id = ?").get(user.id)

    return NextResponse.json({
      success: true,
      balance: userData.balance,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du solde:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du solde" }, { status: 500 })
  }
}

