"use client"

import { useEffect, useState } from "react"
import { Check, CreditCard, Loader2, MoreHorizontal, Trash } from "lucide-react"

import { deletePaymentMethod, getPaymentMethods, setDefaultPaymentMethod } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

interface PaymentMethod {
  id: string
  type: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  isDefault: boolean
}

interface PaymentMethodsListProps {
  onUpdate?: () => void
}

export function PaymentMethodsList({ onUpdate }: PaymentMethodsListProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null)

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const data = await getPaymentMethods()
      setPaymentMethods(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des méthodes de paiement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos méthodes de paiement.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      await deletePaymentMethod(id)

      toast({
        title: "Carte supprimée",
        description: "Votre carte a été supprimée avec succès.",
      })

      fetchPaymentMethods()

      if (onUpdate) {
        onUpdate()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de la carte.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      setIsSettingDefault(id)
      await setDefaultPaymentMethod(id)

      toast({
        title: "Carte par défaut mise à jour",
        description: "Votre carte par défaut a été mise à jour avec succès.",
      })

      fetchPaymentMethods()

      if (onUpdate) {
        onUpdate()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la carte par défaut.",
        variant: "destructive",
      })
    } finally {
      setIsSettingDefault(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center p-8">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Aucune carte enregistrée</h3>
        <p className="mt-2 text-sm text-muted-foreground">Vous n'avez pas encore ajouté de carte de paiement.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id} className={method.isDefault ? "border-primary" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{method.type}</CardTitle>
              {method.isDefault && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  <Check className="mr-1 h-3 w-3" /> Par défaut
                </span>
              )}
            </div>
            <CardDescription>{method.cardHolder}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-medium">{method.cardNumber}</div>
            <div className="text-sm text-muted-foreground">Expire le {method.expiryDate}</div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSetDefault(method.id)}
              disabled={method.isDefault || isSettingDefault === method.id}
            >
              {isSettingDefault === method.id ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Check className="mr-2 h-3 w-3" />
              )}
              Définir par défaut
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDelete(method.id)}
                  disabled={isDeleting === method.id}
                >
                  {isDeleting === method.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="mr-2 h-4 w-4" />
                  )}
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
