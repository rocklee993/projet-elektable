import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

// Fonction simplifiée pour vérifier l'authentification
function getUserFromSession() {
  // Pour cette démonstration, nous allons toujours retourner l'utilisateur avec l'ID 1
  // Dans une application réelle, vous vérifieriez le token de session
  return { id: 1 }
}

export async function GET(request: Request) {
  try {
    const user = getUserFromSession()

    // Même si nous retournons toujours un utilisateur, gardons cette vérification pour la forme
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const db = getDatabase()

    // Récupérer l'historique des transactions
    const transactions = db
      .prepare(`
      SELECT id, type, amount, quantity, price, date
      FROM transactions
      WHERE userId = ?
      ORDER BY date DESC
      LIMIT ?
    `)
      .all(user.id, limit)

    // Si aucune transaction n'existe, retourner un tableau vide
    if (!transactions || transactions.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de l'historique" }, { status: 500 })
  }
}

