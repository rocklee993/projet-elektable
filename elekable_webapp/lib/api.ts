// Fonctions d'API client simulées avec des données mockées

// État global simulé pour l'application
const mockState = {
  user: {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@exemple.fr",
    phone: "0612345678",
    address: "123 Rue de l'Exemple, 75000 Paris",
    birthDate: "1985-05-15",
    balance: 500.0,
  },
  electricityPrices: [
    { date: "2025-03-10", price: 0.1756 },
    { date: "2025-03-11", price: 0.1823 },
    { date: "2025-03-12", price: 0.1795 },
    { date: "2025-03-13", price: 0.1812 },
    { date: "2025-03-14", price: 0.1867 },
    { date: "2025-03-15", price: 0.1834 },
    { date: "2025-03-16", price: 0.1842 },
  ],
  currentPrice: 0.1842,
  transactions: [
    {
      id: "5",
      date: "2025-03-16T10:30:00Z",
      type: "Achat",
      amount: "92.10",
      quantity: "500",
      price: "0.1842",
      paymentMethod: "solde",
    },
    {
      id: "4",
      date: "2025-03-15T14:45:00Z",
      type: "Vente",
      amount: "87.50",
      quantity: "500",
      price: "0.1834",
      paymentMethod: "solde",
    },
    {
      id: "3",
      date: "2025-03-14T09:15:00Z",
      type: "Achat",
      amount: "46.68",
      quantity: "250",
      price: "0.1867",
      paymentMethod: "carte",
    },
    {
      id: "2",
      date: "2025-03-12T16:20:00Z",
      type: "Vente",
      amount: "42.64",
      quantity: "250",
      price: "0.1795",
      paymentMethod: "solde",
    },
    {
      id: "1",
      date: "2025-03-10T11:05:00Z",
      type: "Achat",
      amount: "87.80",
      quantity: "500",
      price: "0.1756",
      paymentMethod: "carte",
    },
  ],
  invoices: [
    {
      id: "5",
      invoiceNumber: "INV-4872",
      date: "2025-03-16T10:30:00Z",
      amount: "92.10",
      status: "Payée",
      type: "Achat",
      quantity: "500",
    },
    {
      id: "4",
      invoiceNumber: "INV-3561",
      date: "2025-03-15T14:45:00Z",
      amount: "87.50",
      status: "Payée",
      type: "Vente",
      quantity: "500",
    },
    {
      id: "3",
      invoiceNumber: "INV-2984",
      date: "2025-03-14T09:15:00Z",
      amount: "46.68",
      status: "Payée",
      type: "Achat",
      quantity: "250",
    },
    {
      id: "2",
      invoiceNumber: "INV-1753",
      date: "2025-03-12T16:20:00Z",
      amount: "42.64",
      status: "Payée",
      type: "Vente",
      quantity: "250",
    },
    {
      id: "1",
      invoiceNumber: "INV-0921",
      date: "2025-03-10T11:05:00Z",
      amount: "87.80",
      status: "Payée",
      type: "Achat",
      quantity: "500",
    },
  ],
  paymentMethods: [
    {
      id: "1",
      type: "Visa",
      cardNumber: "4111 XXXX XXXX 1111",
      cardHolder: "Jean Dupont",
      expiryDate: "12/25",
      isDefault: true,
    },
  ],
}

// Fonction utilitaire pour simuler un délai réseau
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Authentification
export async function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  birthDate: Date;
}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l’inscription.');
  }

  return response.json();
}

export async function loginUser(credentials: { email: string; password: string }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur de connexion.');
  }

  return response.json();
}

export async function logoutUser() {
  await delay(500) // Simuler un délai réseau

  // Simuler une déconnexion réussie
  return {
    success: true,
    message: "Déconnexion réussie",
  }
}

// Profil utilisateur
export async function getUserProfile() {
  await delay(700) // Simuler un délai réseau

  // Retourner les données de l'utilisateur mockées
  return mockState.user
}

export async function updateUserProfile(userData: {
  firstName: string
  lastName: string
  phone: string
  address: string
  birthDate: Date
}) {
  await delay(1000) // Simuler un délai réseau

  // Mettre à jour les données mockées
  mockState.user = {
    ...mockState.user,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    address: userData.address,
    birthDate: userData.birthDate.toISOString().split("T")[0],
  }

  return {
    success: true,
    message: "Profil mis à jour avec succès",
  }
}

// Prix de l'électricité
export async function getElectricityPrices() {
  await delay(600) // Simuler un délai réseau

  // Retourner les prix mockés
  return mockState.electricityPrices
}

export async function getCurrentPrice() {
  await delay(300) // Simuler un délai réseau

  // Retourner le prix actuel mocké
  return { price: mockState.currentPrice }
}

// Transactions
export async function buyElectricity(amount: number, useCard = false) {
  await delay(1200) // Simuler un délai réseau

  const price = mockState.currentPrice
  const totalAmount = amount * price

  // Vérifier si l'utilisateur a assez de solde
  if (mockState.user.balance < totalAmount && !useCard) {
    throw new Error("Solde insuffisant. Veuillez utiliser une carte de paiement.")
  }

  // Déterminer la méthode de paiement
  let paymentMethod = "solde"
  let amountFromBalance = 0
  let amountFromCard = 0

  if (mockState.user.balance >= totalAmount && !useCard) {
    // Utiliser uniquement le solde
    amountFromBalance = totalAmount
    mockState.user.balance -= totalAmount
  } else {
    // Utiliser d'abord le solde puis la carte
    amountFromBalance = Math.min(mockState.user.balance, totalAmount)
    amountFromCard = totalAmount - amountFromBalance
    mockState.user.balance -= amountFromBalance
    paymentMethod = amountFromCard > 0 ? "carte" : "solde"
  }

  // Créer une nouvelle transaction
  const newTransaction = {
    id: (Number.parseInt(mockState.transactions[0]?.id || "0") + 1).toString(),
    date: new Date().toISOString(),
    type: "Achat",
    amount: totalAmount.toFixed(2),
    quantity: amount.toString(),
    price: price.toString(),
    paymentMethod,
  }

  // Ajouter la transaction à l'historique
  mockState.transactions.unshift(newTransaction)

  // Créer une nouvelle facture
  const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
  const newInvoice = {
    id: newTransaction.id,
    invoiceNumber,
    date: newTransaction.date,
    amount: newTransaction.amount,
    status: "Payée",
    type: "Achat",
    quantity: amount.toString(),
  }

  // Ajouter la facture à l'historique
  mockState.invoices.unshift(newInvoice)

  return {
    success: true,
    message: "Achat effectué avec succès",
    transaction: {
      ...newTransaction,
      amountFromBalance,
      amountFromCard,
    },
    invoiceNumber,
    balance: mockState.user.balance,
  }
}

export async function sellElectricity(amount: number) {
  await delay(1200) // Simuler un délai réseau

  const price = mockState.currentPrice
  const subtotal = amount * price
  const commission = subtotal * 0.05
  const totalAmount = subtotal - commission

  // Mettre à jour le solde de l'utilisateur
  mockState.user.balance += totalAmount

  // Créer une nouvelle transaction
  const newTransaction = {
    id: (Number.parseInt(mockState.transactions[0]?.id || "0") + 1).toString(),
    date: new Date().toISOString(),
    type: "Vente",
    amount: totalAmount.toFixed(2),
    quantity: amount.toString(),
    price: price.toString(),
    paymentMethod: "solde",
  }

  // Ajouter la transaction à l'historique
  mockState.transactions.unshift(newTransaction)

  // Créer une nouvelle facture
  const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
  const newInvoice = {
    id: newTransaction.id,
    invoiceNumber,
    date: newTransaction.date,
    amount: newTransaction.amount,
    status: "Payée",
    type: "Vente",
    quantity: amount.toString(),
  }

  // Ajouter la facture à l'historique
  mockState.invoices.unshift(newInvoice)

  return {
    success: true,
    message: "Vente effectuée avec succès",
    transaction: {
      ...newTransaction,
      commission,
    },
    invoiceNumber,
    balance: mockState.user.balance,
  }
}

export async function getTransactionHistory(limit = 10) {
  await delay(800) // Simuler un délai réseau

  // Retourner les transactions mockées limitées
  return mockState.transactions.slice(0, limit)
}

// Factures
export async function getInvoices() {
  const token = localStorage.getItem("token"); // Retrieve the token
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des factures");
  }

  return response.json(); // Return the fetched invoices
}

export async function getInvoiceDetails(invoiceId: string) {
  await delay(700) // Simuler un délai réseau

  // Trouver la facture correspondante
  const invoice = mockState.invoices.find((inv) => inv.id === invoiceId)

  if (!invoice) {
    throw new Error("Facture non trouvée")
  }

  return {
    invoice,
    user: {
      firstName: mockState.user.firstName,
      lastName: mockState.user.lastName,
      email: mockState.user.email,
      address: mockState.user.address,
    },
  }
}

// Solde utilisateur
export async function getUserBalance() {
  await delay(400) // Simuler un délai réseau

  // Retourner le solde mocké
  return { balance: mockState.user.balance }
}

export async function updateUserBalance(amount: number) {
  await delay(600) // Simuler un délai réseau

  // Mettre à jour le solde mocké
  mockState.user.balance += amount

  return {
    success: true,
    balance: mockState.user.balance,
  }
}

// Méthodes de paiement
export async function getPaymentMethods() {
  await delay(700) // Simuler un délai réseau

  // Retourner les méthodes de paiement mockées
  return mockState.paymentMethods
}

export async function addPaymentMethod(paymentMethod: {
  type: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  isDefault: boolean
}) {
  await delay(1000) // Simuler un délai réseau

  // Si cette carte est définie par défaut, désactiver les autres cartes par défaut
  if (paymentMethod.isDefault) {
    mockState.paymentMethods = mockState.paymentMethods.map((method) => ({
      ...method,
      isDefault: false,
    }))
  }

  // Masquer le numéro de carte
  const cardNumber = maskCardNumber(paymentMethod.cardNumber)

  // Créer une nouvelle méthode de paiement
  const newMethod = {
    id: (mockState.paymentMethods.length + 1).toString(),
    ...paymentMethod,
    cardNumber,
  }

  // Ajouter la méthode de paiement
  mockState.paymentMethods.push(newMethod)

  return {
    success: true,
    id: newMethod.id,
    message: "Méthode de paiement ajoutée avec succès",
  }
}

export async function deletePaymentMethod(id: string) {
  await delay(800) // Simuler un délai réseau

  // Trouver la méthode de paiement
  const methodIndex = mockState.paymentMethods.findIndex((method) => method.id === id)

  if (methodIndex === -1) {
    throw new Error("Méthode de paiement non trouvée")
  }

  const wasDefault = mockState.paymentMethods[methodIndex].isDefault

  // Supprimer la méthode de paiement
  mockState.paymentMethods.splice(methodIndex, 1)

  // Si c'était la méthode par défaut, définir une autre méthode comme par défaut
  if (wasDefault && mockState.paymentMethods.length > 0) {
    mockState.paymentMethods[0].isDefault = true
  }

  return {
    success: true,
    message: "Méthode de paiement supprimée avec succès",
  }
}

export async function setDefaultPaymentMethod(id: string) {
  await delay(600) // Simuler un délai réseau

  // Trouver la méthode de paiement
  const methodIndex = mockState.paymentMethods.findIndex((method) => method.id === id)

  if (methodIndex === -1) {
    throw new Error("Méthode de paiement non trouvée")
  }

  // Désactiver toutes les méthodes par défaut
  mockState.paymentMethods = mockState.paymentMethods.map((method) => ({
    ...method,
    isDefault: false,
  }))

  // Définir cette méthode comme par défaut
  mockState.paymentMethods[methodIndex].isDefault = true

  return {
    success: true,
    message: "Méthode de paiement définie par défaut avec succès",
  }
}

// Fonction utilitaire pour masquer le numéro de carte
function maskCardNumber(cardNumber: string): string {
  // Garder les 4 premiers et les 4 derniers chiffres, masquer le reste
  const cleaned = cardNumber.replace(/\s+/g, "")
  if (cleaned.length <= 8) return cleaned

  const firstFour = cleaned.substring(0, 4)
  const lastFour = cleaned.substring(cleaned.length - 4)
  const masked = "X".repeat(cleaned.length - 8)

  // Formater avec des espaces tous les 4 chiffres
  return `${firstFour} ${masked.substring(0, 4)} ${masked.substring(4, 8)} ${lastFour}`
}
