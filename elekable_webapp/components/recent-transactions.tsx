"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTransactionHistory } from "@/lib/api"

// Type pour les transactions
interface Transaction {
  id: string
  date: string
  type: "Achat" | "Vente"
  amount: string
  quantity: string
  price: string
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Appeler d'abord l'API d'initialisation pour s'assurer que la BD est prête
        await fetch("/api/init")

        const data = await getTransactionHistory(5)
        setTransactions(data)
        setError(null)
      } catch (error) {
        console.error("Erreur lors de la récupération des transactions:", error)
        setError("Impossible de charger les transactions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>
  }

  if (transactions.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">Aucune transaction récente</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantité</TableHead>
          <TableHead>Prix unitaire</TableHead>
          <TableHead>Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{`TX-${transaction.id.toString().padStart(3, "0")}`}</TableCell>
            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex items-center">
                {transaction.type === "Achat" ? (
                  <>
                    <ArrowDown className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-blue-500">Achat</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-green-500">Vente</span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell>{transaction.quantity} kWh</TableCell>
            <TableCell>{transaction.price} €</TableCell>
            <TableCell className="font-medium">{transaction.amount} €</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

