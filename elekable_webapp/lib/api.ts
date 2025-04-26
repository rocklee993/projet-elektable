// Fonctions d'API client simulées avec des données mockées

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
      quantity: "250",
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
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateInvoiceNumber(): string {
  return `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}

function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s+/g, "");
  if (cleaned.length <= 8) return cleaned;

  const firstFour = cleaned.substring(0, 4);
  const lastFour = cleaned.substring(cleaned.length - 4);
  const masked = "X".repeat(cleaned.length - 8);

  return `${firstFour} ${masked.substring(0, 4)} ${masked.substring(4, 8)} ${lastFour}`;
}

function createTransaction(type: "Achat" | "Vente", quantity: number, paymentMethod: string, price: number, commission = 0) {
  const amount = quantity * price;
  const netAmount = type === "Vente" ? amount - commission : amount;
  const id = (Number.parseInt(mockState.transactions[0]?.id || "0") + 1).toString();
  const date = new Date().toISOString();

  const transaction = {
    id,
    date,
    type,
    amount: netAmount.toFixed(2),
    quantity: quantity.toString(),
    price: price.toString(),
    paymentMethod,
  };

  const invoice = {
    id,
    invoiceNumber: generateInvoiceNumber(),
    date,
    amount: netAmount.toFixed(2),
    status: "Payée",
    type,
    quantity: quantity.toString(),
  };

  mockState.transactions.unshift(transaction);
  mockState.invoices.unshift(invoice);

  return { transaction, invoice };
}

const API_BASE_URL = 'http://localhost:5000/api';

// Fonction utilitaire pour les appels API
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const customHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const mergedHeaders = {
    ...customHeaders,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}


// Authentification
export async function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  birthDate: string;
}) {
  // Convertir la date en objet Date
  const formattedData = {
    ...userData,
    birthDate: new Date(userData.birthDate).toISOString().split('T')[0]
  };

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'inscription.');
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function loginUser(credentials: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erreur de connexion.');
  }

  
  if (data.token) {
    localStorage.setItem('accessToken', data.token);
  } else {
    console.warn('No token in login response');
  }
  
  return data;
}

export async function logoutUser() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  return {
    success: true,
    message: "Déconnexion réussie",
  };
}

// Profil utilisateur
export async function getUserProfile() {
  await delay(700);
  return mockState.user;
}

export async function updateUserProfile(userData: {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate: Date;
}) {
  await delay(1000);

  mockState.user = {
    ...mockState.user,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    address: userData.address,
    birthDate: userData.birthDate.toISOString().split("T")[0],
  };

  return {
    success: true,
    message: "Profil mis à jour avec succès",
  };
}

// Prix de l'électricité
export async function getElectricityPrices() {
  return fetchWithAuth('/electricity/prices');
}

export async function getCurrentPrice() {
  return fetchWithAuth('/electricity/current-price');
}

// Transactions
export async function buyElectricity(amount: number, useCard = false) {
  return fetchWithAuth('/transactions/buy', {
    method: 'POST',
    body: JSON.stringify({ amount, useCard }),
  });
}

export async function sellElectricity(amount: number) {
  return fetchWithAuth('/transactions/sell', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function getTransactionHistory(limit = 5) {
  return fetchWithAuth(`/transactions/history?limit=${limit}`);
}

// Factures
export async function getInvoices() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des factures");
  }

  return response.json();
}

export async function getInvoiceDetails(invoiceId: string) {
  await delay(700);
  const invoice = mockState.invoices.find((inv) => inv.id === invoiceId);

  if (!invoice) {
    throw new Error("Facture non trouvée");
  }

  return {
    invoice,
    user: {
      firstName: mockState.user.firstName,
      lastName: mockState.user.lastName,
      email: mockState.user.email,
      address: mockState.user.address,
    },
  };
}

// Solde utilisateur
export async function getUserBalance() {
  return fetchWithAuth('/users/balance');
}

export async function updateUserBalance(amount: number) {
  await delay(600);
  mockState.user.balance += amount;
  return {
    success: true,
    balance: mockState.user.balance,
  };
}

// Méthodes de paiement
export async function getPaymentMethods() {
  await delay(700);
  return mockState.paymentMethods;
}

export async function addPaymentMethod(paymentMethod: {
  type: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  isDefault: boolean;
}) {
  await delay(1000);

  if (paymentMethod.isDefault) {
    mockState.paymentMethods = mockState.paymentMethods.map((method) => ({
      ...method,
      isDefault: false,
    }));
  }

  const cardNumber = maskCardNumber(paymentMethod.cardNumber);
  const newMethod = {
    id: (mockState.paymentMethods.length + 1).toString(),
    ...paymentMethod,
    cardNumber,
  };

  mockState.paymentMethods.push(newMethod);

  return {
    success: true,
    id: newMethod.id,
    message: "Méthode de paiement ajoutée avec succès",
  };
}

export async function deletePaymentMethod(id: string) {
  await delay(800);
  const methodIndex = mockState.paymentMethods.findIndex((method) => method.id === id);

  if (methodIndex === -1) {
    throw new Error("Méthode de paiement non trouvée");
  }

  const wasDefault = mockState.paymentMethods[methodIndex].isDefault;
  mockState.paymentMethods.splice(methodIndex, 1);

  if (wasDefault && mockState.paymentMethods.length > 0) {
    mockState.paymentMethods[0].isDefault = true;
  }

  return {
    success: true,
    message: "Méthode de paiement supprimée avec succès",
  };
}

export async function setDefaultPaymentMethod(id: string) {
  await delay(600);
  const methodIndex = mockState.paymentMethods.findIndex((method) => method.id === id);

  if (methodIndex === -1) {
    throw new Error("Méthode de paiement non trouvée");
  }

  mockState.paymentMethods = mockState.paymentMethods.map((method) => ({
    ...method,
    isDefault: false,
  }));

  mockState.paymentMethods[methodIndex].isDefault = true;

  return {
    success: true,
    message: "Méthode de paiement définie par défaut avec succès",
  };
}