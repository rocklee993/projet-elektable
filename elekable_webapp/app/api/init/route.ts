import { NextResponse } from "next/server"
import { initializeDatabase, ensureDefaultUser } from "@/lib/db"

// Route pour initialiser la base de données
export async function GET() {
  try {
    initializeDatabase()
    ensureDefaultUser() // Ajouter cette ligne pour créer l'utilisateur par défaut

    return NextResponse.json({
      success: true,
      message: "Base de données initialisée avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    return NextResponse.json({ error: "Erreur lors de l'initialisation de la base de données" }, { status: 500 })
  }
}

