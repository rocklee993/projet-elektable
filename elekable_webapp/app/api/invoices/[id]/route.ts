import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import { cookies } from "next/headers"

// Fonction simplifiée pour vérifier l'authentification
function getUserFromSession() {
  const sessionToken = cookies().get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  // Pour cet exemple, nous simulons un utilisateur connecté avec l'ID 1
  return { id: 1 }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const invoiceId = params.id

    if (!invoiceId) {
      return NextResponse.json({ error: "ID de facture requis" }, { status: 400 })
    }

    const db = getDatabase()

    // Récupérer les détails de la facture
    const invoice = db
      .prepare(`
      SELECT 
        i.id, 
        i.invoiceNumber, 
        i.amount, 
        i.status, 
        i.date,
        t.type,
        t.quantity,
        t.price
      FROM invoices i
      JOIN transactions t ON i.transactionId = t.id
      WHERE i.id = ? AND i.userId = ?
    `)
      .get(invoiceId, user.id)

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    // Récupérer les informations de l'utilisateur pour la facture
    const userData = db
      .prepare(`
      SELECT firstName, lastName, email, address
      FROM users
      WHERE id = ?
    `)
      .get(user.id)

    return NextResponse.json({
      invoice,
      user: userData,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de la facture" }, { status: 500 })
  }
}

