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

    // Récupérer les factures avec les détails de transaction
    const invoices = db
      .prepare(`
      SELECT 
        i.id, 
        i.invoiceNumber, 
        i.amount, 
        i.status, 
        i.date,
        t.type,
        t.quantity
      FROM invoices i
      JOIN transactions t ON i.transactionId = t.id
      WHERE i.userId = ?
      ORDER BY i.date DESC
      LIMIT ?
    `)
      .all(user.id, limit)

    // Si aucune facture n'existe, retourner un tableau vide
    if (!invoices || invoices.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des factures" }, { status: 500 })
  }
}

