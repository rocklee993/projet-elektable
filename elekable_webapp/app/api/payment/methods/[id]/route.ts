import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

// Fonction simplifiée pour vérifier l'authentification
function getUserFromSession() {
  // Pour cette démonstration, nous allons toujours retourner l'utilisateur avec l'ID 1
  return { id: 1 }
}

// Supprimer une méthode de paiement
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const methodId = params.id

    if (!methodId) {
      return NextResponse.json({ error: "ID de méthode de paiement requis" }, { status: 400 })
    }

    const db = getDatabase()

    // Vérifier si la méthode de paiement appartient à l'utilisateur
    const paymentMethod = db
      .prepare(`
      SELECT id, isDefault
      FROM payment_methods
      WHERE id = ? AND userId = ?
    `)
      .get(methodId, user.id)

    if (!paymentMethod) {
      return NextResponse.json({ error: "Méthode de paiement non trouvée" }, { status: 404 })
    }

    // Supprimer la méthode de paiement
    db.prepare("DELETE FROM payment_methods WHERE id = ?").run(methodId)

    // Si c'était la méthode par défaut, définir une autre méthode comme par défaut
    if (paymentMethod.isDefault) {
      const anotherMethod = db
        .prepare(`
        SELECT id
        FROM payment_methods
        WHERE userId = ?
        LIMIT 1
      `)
        .get(user.id)

      if (anotherMethod) {
        db.prepare("UPDATE payment_methods SET isDefault = 1 WHERE id = ?").run(anotherMethod.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Méthode de paiement supprimée avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de la méthode de paiement:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la méthode de paiement" }, { status: 500 })
  }
}

// Définir une méthode de paiement par défaut
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const methodId = params.id

    if (!methodId) {
      return NextResponse.json({ error: "ID de méthode de paiement requis" }, { status: 400 })
    }

    const db = getDatabase()

    // Vérifier si la méthode de paiement appartient à l'utilisateur
    const paymentMethod = db
      .prepare(`
      SELECT id
      FROM payment_methods
      WHERE id = ? AND userId = ?
    `)
      .get(methodId, user.id)

    if (!paymentMethod) {
      return NextResponse.json({ error: "Méthode de paiement non trouvée" }, { status: 404 })
    }

    // Désactiver toutes les méthodes par défaut
    db.prepare("UPDATE payment_methods SET isDefault = 0 WHERE userId = ?").run(user.id)

    // Définir cette méthode comme par défaut
    db.prepare("UPDATE payment_methods SET isDefault = 1 WHERE id = ?").run(methodId)

    return NextResponse.json({
      success: true,
      message: "Méthode de paiement définie par défaut avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la méthode de paiement:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la méthode de paiement" }, { status: 500 })
  }
}

