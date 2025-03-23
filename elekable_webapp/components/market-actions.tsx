"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { buyElectricity, sellElectricity } from "@/lib/api"

export function MarketActions() {
  const [buyAmount, setBuyAmount] = useState("50")
  const [sellAmount, setSellAmount] = useState("25")
  const [isLoading, setIsLoading] = useState(false)

  const currentPrice = 0.1842 // Prix actuel du kWh en euros

  // Modifier la fonction handleBuy
  const handleBuy = async () => {
    setIsLoading(true)
    try {
      // Appeler d'abord l'API d'initialisation pour s'assurer que la BD est prête
      await fetch("/api/init")

      const result = await buyElectricity(Number.parseFloat(buyAmount))
      toast({
        title: "Achat effectué avec succès!",
        description: `Vous avez acheté ${buyAmount} kWh pour un montant de ${(Number.parseFloat(buyAmount) * currentPrice).toFixed(2)} €.`,
      })
      setBuyAmount("50")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'achat.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Modifier la fonction handleSell
  const handleSell = async () => {
    setIsLoading(true)
    try {
      // Appeler d'abord l'API d'initialisation pour s'assurer que la BD est prête
      await fetch("/api/init")

      const result = await sellElectricity(Number.parseFloat(sellAmount))
      toast({
        title: "Vente effectuée avec succès!",
        description: `Vous avez vendu ${sellAmount} kWh pour un montant de ${(Number.parseFloat(sellAmount) * currentPrice * 0.95).toFixed(2)} €.`,
      })
      setSellAmount("25")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la vente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="buy" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="buy">Acheter</TabsTrigger>
        <TabsTrigger value="sell">Vendre</TabsTrigger>
      </TabsList>
      <TabsContent value="buy">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy-amount">Quantité (kWh)</Label>
              <Input
                id="buy-amount"
                type="number"
                min="1"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Prix unitaire:</span>
                <span className="font-medium">{currentPrice} € / kWh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-lg font-bold">
                  {(Number.parseFloat(buyAmount || "0") * currentPrice).toFixed(2)} €
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleBuy}
                disabled={isLoading || !buyAmount || Number.parseFloat(buyAmount) <= 0}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDown className="mr-2 h-4 w-4" />}
                Acheter
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/dashboard/buy">Plus d'options</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sell">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Quantité (kWh)</Label>
              <Input
                id="sell-amount"
                type="number"
                min="1"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Prix unitaire:</span>
                <span className="font-medium">{currentPrice} € / kWh</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Commission (5%):</span>
                <span className="text-red-500">
                  -{(Number.parseFloat(sellAmount || "0") * currentPrice * 0.05).toFixed(2)} €
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total à recevoir:</span>
                <span className="text-lg font-bold text-green-600">
                  {(Number.parseFloat(sellAmount || "0") * currentPrice * 0.95).toFixed(2)} €
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleSell}
                disabled={isLoading || !sellAmount || Number.parseFloat(sellAmount) <= 0}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUp className="mr-2 h-4 w-4" />}
                Vendre
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/dashboard/sell">Plus d'options</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

