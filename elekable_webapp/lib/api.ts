// Fonctions d'API client pour interagir avec le backend

// Authentification
export async function registerUser(userData: {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  address: string
  birthDate: Date
}) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...userData,
      birthDate: userData.birthDate.toISOString().split("T")[0],
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de l'inscription")
  }

  return response.json()
}

export async function loginUser(credentials: { email: string; password: string }) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la connexion")
  }

  return response.json()
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la déconnexion")
  }

  return response.json()
}

// Profil utilisateur
export async function getUserProfile() {
  const response = await fetch("/api/users/me")

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération du profil")
  }

  return response.json()
}

export async function updateUserProfile(userData: {
  firstName: string
  lastName: string
  phone: string
  address: string
  birthDate: Date
}) {
  const response = await fetch("/api/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...userData,
      birthDate: userData.birthDate.toISOString().split("T")[0],
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la mise à jour du profil")
  }

  return response.json()
}

// Prix de l'électricité
export async function getElectricityPrices() {
  const response = await fetch("/api/electricity/prices")

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération des prix")
  }

  return response.json()
}

export async function getCurrentPrice() {
  const response = await fetch("/api/electricity/current-price")

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération du prix actuel")
  }

  return response.json()
}

// Transactions
export async function buyElectricity(amount: number, useCard = false) {
  const response = await fetch("/api/transactions/buy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, useCard }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de l'achat")
  }

  return response.json()
}

export async function sellElectricity(amount: number) {
  const response = await fetch("/api/transactions/sell", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la vente")
  }

  return response.json()
}

export async function getTransactionHistory(limit = 10) {
  const response = await fetch(`/api/transactions/history?limit=${limit}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération de l'historique")
  }

  return response.json()
}

// Factures
export async function getInvoices(limit = 10) {
  const response = await fetch(`/api/invoices?limit=${limit}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération des factures")
  }

  return response.json()
}

export async function getInvoiceDetails(invoiceId: string) {
  const response = await fetch(`/api/invoices/${invoiceId}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération de la facture")
  }

  return response.json()
}

// Solde utilisateur
export async function getUserBalance() {
  const response = await fetch("/api/users/balance")

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération du solde")
  }

  return response.json()
}

export async function updateUserBalance(amount: number) {
  const response = await fetch("/api/users/balance", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la mise à jour du solde")
  }

  return response.json()
}

// Méthodes de paiement
export async function getPaymentMethods() {
  const response = await fetch("/api/payment/methods")

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la récupération des méthodes de paiement")
  }

  return response.json()
}

export async function addPaymentMethod(paymentMethod: {
  type: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  isDefault: boolean
}) {
  const response = await fetch("/api/payment/methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentMethod),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de l'ajout de la méthode de paiement")
  }

  return response.json()
}

export async function deletePaymentMethod(id: string) {
  const response = await fetch(`/api/payment/methods/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la suppression de la méthode de paiement")
  }

  return response.json()
}

export async function setDefaultPaymentMethod(id: string) {
  const response = await fetch(`/api/payment/methods/${id}`, {
    method: "PUT",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Erreur lors de la définition de la méthode de paiement par défaut")
  }

  return response.json()
}

