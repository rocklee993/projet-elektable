"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Zap } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { getCurrentPrice, sellElectricity } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"
import ElectricityPriceChart from "@/components/electricity-price-chart"
import { UserBalance } from "@/components/user-balance"

const formSchema = z.object({
  amount: z
    .number()
    .min(1, {
      message: "Vous devez vendre au moins 1 kWh",
    })
    .max(500, {
      message: "Vous ne pouvez pas vendre plus de 500 kWh à la fois",
    }),
})

export default function SellPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(0.1842) // Prix par défaut
  const [isPriceFetching, setIsPriceFetching] = useState(true)
  const [refreshBalance, setRefreshBalance] = useState(0)
  const commissionRate = 0.05 // 5% de commission

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 25,
    },
  })

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const data = await getCurrentPrice()
        if (data && data.price) {
          setCurrentPrice(data.price)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du prix actuel:", error)
      } finally {
        setIsPriceFetching(false)
      }
    }

    fetchCurrentPrice()
  }, [])

  const amount = form.watch("amount")
  const subtotal = amount * currentPrice
  const commission = subtotal * commissionRate
  const totalEarnings = (subtotal - commission).toFixed(2)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await sellElectricity(values.amount)

      // Mettre à jour le solde après la vente
      setRefreshBalance((prev) => prev + 1)

      toast({
        title: "Vente effectuée avec succès!",
        description: `Vous avez vendu ${values.amount} kWh pour un montant de ${totalEarnings} €.`,
      })

      form.reset({ amount: 25 })
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Vendre de l'électricité</h1>
        <UserBalance className="text-lg" key={refreshBalance} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prix actuel du marché</CardTitle>
            <CardDescription>Évolution du prix du kWh sur les 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ElectricityPriceChart />
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Prix actuel:</div>
              <div className="text-lg font-bold">{currentPrice} € / kWh</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendre maintenant</CardTitle>
            <CardDescription>Sélectionnez la quantité d'électricité que vous souhaitez vendre</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité (kWh)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={1}
                            max={500}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              max={500}
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <span className="text-sm font-medium">kWh</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>Vous pouvez vendre entre 1 et 500 kWh à la fois.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">Quantité:</div>
                    <div className="font-medium">{amount} kWh</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">Prix unitaire:</div>
                    <div className="font-medium">{currentPrice} € / kWh</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">Sous-total:</div>
                    <div className="font-medium">{subtotal.toFixed(2)} €</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">Commission (5%):</div>
                    <div className="font-medium text-red-500">-{commission.toFixed(2)} €</div>
                  </div>
                  <div className="border-t my-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Total à recevoir:</div>
                    <div className="text-lg font-bold text-green-600">{totalEarnings} €</div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vente en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Vendre maintenant
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between text-xs text-muted-foreground">
            <p>Dernière mise à jour: {new Date().toLocaleString()}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
