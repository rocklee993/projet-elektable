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
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateInvoiceNumber(): string {
  return `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
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

export async function buyElectricity(amount: number, useCard = false) {
  await delay(1200);

  const price = mockState.currentPrice;
  const total = amount * price;

  let fromBalance = 0;
  let fromCard = 0;
  let paymentMethod = "solde";

  if (mockState.user.balance >= total && !useCard) {
    fromBalance = total;
    mockState.user.balance -= total;
  } else {
    fromBalance = Math.min(mockState.user.balance, total);
    fromCard = total - fromBalance;
    mockState.user.balance -= fromBalance;
    paymentMethod = fromCard > 0 ? "carte" : "solde";
  }

  const { transaction, invoice } = createTransaction("Achat", amount, paymentMethod, price);

  return {
    success: true,
    message: "Achat effectué avec succès",
    transaction: {
      ...transaction,
      amountFromBalance: fromBalance,
      amountFromCard: fromCard,
    },
    invoiceNumber: invoice.invoiceNumber,
    balance: mockState.user.balance,
  };
}

export async function sellElectricity(amount: number) {
  await delay(1200);

  const price = mockState.currentPrice;
  const subtotal = amount * price;
  const commission = subtotal * 0.05;
  const totalReceived = subtotal - commission;

  mockState.user.balance += totalReceived;

  const { transaction, invoice } = createTransaction("Vente", amount, "solde", price, commission);

  return {
    success: true,
    message: "Vente effectuée avec succès",
    transaction: {
      ...transaction,
      commission,
    },
    invoiceNumber: invoice.invoiceNumber,
    balance: mockState.user.balance,
  };
}
