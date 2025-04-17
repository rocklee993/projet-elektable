"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCard, Loader2, Wallet, Zap } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { buyElectricity, getCurrentPrice, getUserBalance } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"
import ElectricityPriceChart from "@/components/electricity-price-chart"
import { UserBalance } from "@/components/user-balance"

const formSchema = z.object({
  amount: z
    .number()
    .min(1, {
      message: "Vous devez acheter au moins 1 kWh",
    })
    .max(1000, {
      message: "Vous ne pouvez pas acheter plus de 1000 kWh à la fois",
    }),
  paymentMethod: z.enum(["solde", "carte"]),
})

export default function BuyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(0.1842) // Prix par défaut
  const [isPriceFetching, setIsPriceFetching] = useState(true)
  const [balance, setBalance] = useState(0)
  const [refreshBalance, setRefreshBalance] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 50,
      paymentMethod: "solde",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le prix actuel
        const priceData = await getCurrentPrice()
        if (priceData && priceData.price) {
          setCurrentPrice(priceData.price)
        }

        // Récupérer le solde
        const balanceData = await getUserBalance()
        if (balanceData && balanceData.balance !== undefined) {
          setBalance(balanceData.balance)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
      } finally {
        setIsPriceFetching(false)
      }
    }

    fetchData()
  }, [refreshBalance])

  const amount = form.watch("amount")
  const paymentMethod = form.watch("paymentMethod")
  const totalPrice = (amount * currentPrice).toFixed(2)
  const hasEnoughBalance = balance >= Number.parseFloat(totalPrice)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await buyElectricity(values.amount, values.paymentMethod === "carte")

      // Mettre à jour le solde après l'achat
      setRefreshBalance((prev) => prev + 1)

      let successMessage = `Vous avez acheté ${values.amount} kWh pour un montant de ${totalPrice} €.`

      if (result.amountFromBalance > 0 && result.amountFromCard > 0) {
        successMessage += ` (${result.amountFromBalance.toFixed(2)} € depuis votre solde et ${result.amountFromCard.toFixed(2)} € par carte)`
      }

      toast({
        title: "Achat effectué avec succès!",
        description: successMessage,
      })

      form.reset({ amount: 50, paymentMethod: "solde" })
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Acheter de l'électricité</h1>
        <UserBalance className="text-lg" />
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
            <CardTitle>Acheter maintenant</CardTitle>
            <CardDescription>Sélectionnez la quantité d'électricité que vous souhaitez acheter</CardDescription>
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
                            max={1000}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              max={1000}
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <span className="text-sm font-medium">kWh</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>Vous pouvez acheter entre 1 et 1000 kWh à la fois.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Méthode de paiement</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="solde" id="solde" disabled={!hasEnoughBalance} />
                            </FormControl>
                            <FormLabel htmlFor="solde" className="font-normal cursor-pointer flex items-center">
                              <Wallet className="mr-2 h-4 w-4" />
                              Solde disponible ({balance.toFixed(2)} €)
                              {!hasEnoughBalance && (
                                <span className="ml-2 text-xs text-destructive">(Solde insuffisant)</span>
                              )}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="carte" id="carte" />
                            </FormControl>
                            <FormLabel htmlFor="carte" className="font-normal cursor-pointer flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Carte bancaire
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
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
                  <div className="border-t my-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Total:</div>
                    <div className="text-lg font-bold">{totalPrice} €</div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Achat en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Acheter maintenant
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
