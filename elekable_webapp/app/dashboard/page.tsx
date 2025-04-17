"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Battery, BatteryCharging, CreditCard, TrendingDown, TrendingUp } from "lucide-react"

import { getUserBalance } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ElectricityPriceChart from "@/components/electricity-price-chart"
import { MarketActions } from "@/components/market-actions"
import { RecentTransactions } from "@/components/recent-transactions"
import { UserBalance } from "@/components/user-balance"

export default function DashboardPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getUserBalance()
        setBalance(data.balance)
      } catch (error) {
        console.error("Erreur lors de la récupération du solde:", error)
      }
    }

    fetchBalance()
  }, [refreshKey])

  const handleTransactionComplete = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <UserBalance className="text-lg" key={refreshKey} />
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde actuel</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balance !== null ? `${balance.toFixed(2)} €` : "Chargement..."}
                </div>
                <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prix actuel du kWh</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0,1842 €</div>
                <p className="text-xs text-muted-foreground">-3% par rapport à hier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Énergie achetée</CardTitle>
                <Battery className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">324 kWh</div>
                <p className="text-xs text-muted-foreground">Ce mois-ci</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Énergie vendue</CardTitle>
                <BatteryCharging className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156 kWh</div>
                <p className="text-xs text-muted-foreground">Ce mois-ci</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Prix de l'électricité</CardTitle>
                <CardDescription>Évolution du prix du kWh sur les 7 derniers jours</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ElectricityPriceChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Actions du marché</CardTitle>
                <CardDescription>Achetez ou vendez de l'électricité au prix actuel</CardDescription>
              </CardHeader>
              <CardContent>
                <MarketActions onTransactionComplete={handleTransactionComplete} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Transactions récentes</CardTitle>
                <CardDescription>Vos 5 dernières transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytique</CardTitle>
              <CardDescription>Analyse détaillée de votre consommation et production d'électricité</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Fonctionnalité à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Moyens de paiement</CardTitle>
            <CardDescription>Gérez vos cartes de paiement pour l'achat d'électricité</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
            <CreditCard className="h-12 w-12 text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Gérez vos moyens de paiement</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez ou supprimez des cartes de paiement pour vos achats d'électricité
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/payment">Gérer mes cartes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recharger mon solde</CardTitle>
            <CardDescription>Ajoutez des fonds à votre compte pour acheter de l'électricité</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">
                Solde actuel: {balance !== null ? `${balance.toFixed(2)} €` : "Chargement..."}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Rechargez votre solde pour faciliter vos achats d'électricité
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/buy">Acheter de l'électricité</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
