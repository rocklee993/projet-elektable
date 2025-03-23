import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = getDatabase()

    // Récupérer les prix de l'électricité des 7 derniers jours
    const prices = db
      .prepare(`
      SELECT date, price
      FROM electricity_prices
      ORDER BY date DESC
      LIMIT 7
    `)
      .all()

    // Inverser l'ordre pour avoir les dates dans l'ordre chronologique
    prices.reverse()

    return NextResponse.json(prices)
  } catch (error) {
    console.error("Erreur lors de la récupération des prix:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des prix" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, price } = body

    // Validation de base
    if (!date || !price) {
      return NextResponse.json({ error: "Date et prix requis" }, { status: 400 })
    }

    const db = getDatabase()

    // Vérifier si un prix existe déjà pour cette date
    const existingPrice = db.prepare("SELECT * FROM electricity_prices WHERE date = ?").get(date)

    if (existingPrice) {
      // Mettre à jour le prix existant
      db.prepare("UPDATE electricity_prices SET price = ? WHERE date = ?").run(price, date)
    } else {
      // Insérer un nouveau prix
      db.prepare("INSERT INTO electricity_prices (date, price) VALUES (?, ?)").run(date, price)
    }

    return NextResponse.json({
      success: true,
      message: "Prix mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du prix:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du prix" }, { status: 500 })
  }
}

