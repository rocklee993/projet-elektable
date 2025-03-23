import { NextResponse } from "next/server"
import { getDatabase, hashPassword } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, phone, address, birthDate } = body

    // Validation de base
    if (!firstName || !lastName || !email || !password || !phone || !address || !birthDate) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const db = getDatabase()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email)
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
    }

    // Hacher le mot de passe
    const hashedPassword = hashPassword(password)

    // Insérer le nouvel utilisateur
    const insertUser = db.prepare(`
      INSERT INTO users (firstName, lastName, email, password, phone, address, birthDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insertUser.run(firstName, lastName, email, hashedPassword, phone, address, birthDate)

    return NextResponse.json(
      {
        success: true,
        message: "Utilisateur créé avec succès",
        userId: result.lastInsertRowid,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 })
  }
}

