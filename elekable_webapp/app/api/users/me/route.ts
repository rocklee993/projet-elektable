import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

// Fonction simplifiée pour vérifier l'authentification
// Dans une application réelle, utilisez un système de JWT ou une session plus robuste
function getUserFromSession() {
  // Pour cette démonstration, nous allons toujours retourner l'utilisateur avec l'ID 1
  // Dans une application réelle, vous vérifieriez le token de session
  return { id: 1 }
}

export async function GET() {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const db = getDatabase()

    // Récupérer les informations de l'utilisateur
    const userData = db
      .prepare("SELECT id, firstName, lastName, email, phone, address, birthDate, balance FROM users WHERE id = ?")
      .get(user.id)

    if (!userData) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phone, address, birthDate } = body

    // Validation de base
    if (!firstName || !lastName || !phone || !address || !birthDate) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const db = getDatabase()

    // Mettre à jour les informations de l'utilisateur
    const updateUser = db.prepare(`
      UPDATE users
      SET firstName = ?, lastName = ?, phone = ?, address = ?, birthDate = ?
      WHERE id = ?
    `)

    updateUser.run(firstName, lastName, phone, address, birthDate, user.id)

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 })
  }
}

