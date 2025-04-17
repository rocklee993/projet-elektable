"use client"

import { useState } from "react"
import { CreditCard, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentMethodForm } from "@/components/payment-method-form"
import { PaymentMethodsList } from "@/components/payment-methods-list"

export default function PaymentPage() {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setOpen(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Moyens de paiement</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une carte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter une carte de paiement</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle carte de paiement pour vos achats d'électricité.
              </DialogDescription>
            </DialogHeader>
            <PaymentMethodForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cards">Cartes de paiement</TabsTrigger>
          <TabsTrigger value="history">Historique des paiements</TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vos cartes enregistrées</CardTitle>
              <CardDescription>
                Gérez vos cartes de paiement pour l'achat d'électricité sur la plateforme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodsList key={refreshKey} onUpdate={() => setRefreshKey((prev) => prev + 1)} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>Consultez l'historique de vos paiements par carte.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col items-center justify-center text-center">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Historique des paiements</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Cette fonctionnalité sera bientôt disponible. Vous pourrez consulter l'historique détaillé de vos
                paiements par carte.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
