"use client"

import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"

import { getUserBalance } from "@/lib/api"

interface UserBalanceProps {
  className?: string
  showIcon?: boolean
}

export function UserBalance({ className = "", showIcon = true }: UserBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getUserBalance()
        setBalance(data.balance)
      } catch (error) {
        console.error("Erreur lors de la récupération du solde:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && <Wallet className="h-4 w-4" />}
        <div className="h-5 w-20 animate-pulse rounded bg-muted"></div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && <Wallet className="h-4 w-4" />}
      <span className="font-medium">{balance?.toFixed(2)} €</span>
    </div>
  )
}
