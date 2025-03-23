import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = getDatabase()

    // Récupérer le prix le plus récent
    const currentPrice = db
      .prepare(`
      SELECT price
      FROM electricity_prices
      ORDER BY date DESC
      LIMIT 1
    `)
      .get()

    if (!currentPrice) {
      return NextResponse.json({ error: "Aucun prix disponible" }, { status: 404 })
    }

    return NextResponse.json({ price: currentPrice.price })
  } catch (error) {
    console.error("Erreur lors de la récupération du prix actuel:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du prix actuel" }, { status: 500 })
  }
}

