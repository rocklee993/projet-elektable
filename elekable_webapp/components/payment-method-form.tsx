"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { addPaymentMethod } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  type: z.string({
    required_error: "Veuillez sélectionner un type de carte",
  }),
  cardNumber: z
    .string()
    .min(16, {
      message: "Le numéro de carte doit contenir au moins 16 chiffres",
    })
    .max(19, {
      message: "Le numéro de carte ne peut pas dépasser 19 chiffres",
    })
    .regex(/^[0-9\s]+$/, {
      message: "Le numéro de carte doit contenir uniquement des chiffres",
    }),
  cardHolder: z.string().min(3, {
    message: "Le nom du titulaire doit contenir au moins 3 caractères",
  }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
    message: "La date d'expiration doit être au format MM/YY",
  }),
  isDefault: z.boolean().default(false),
})

interface PaymentMethodFormProps {
  onSuccess?: () => void
}

export function PaymentMethodForm({ onSuccess }: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      isDefault: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await addPaymentMethod(values)

      toast({
        title: "Carte ajoutée avec succès",
        description: "Votre nouvelle carte de paiement a été ajoutée.",
      })

      form.reset()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la carte.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de carte</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de carte" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="Mastercard">Mastercard</SelectItem>
                  <SelectItem value="American Express">American Express</SelectItem>
                  <SelectItem value="Carte Bancaire">Carte Bancaire</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de carte</FormLabel>
              <FormControl>
                <Input placeholder="4111 2222 3333 4444" {...field} />
              </FormControl>
              <FormDescription>Entrez le numéro à 16 chiffres de votre carte</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titulaire de la carte</FormLabel>
              <FormControl>
                <Input placeholder="Jean Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d'expiration</FormLabel>
              <FormControl>
                <Input placeholder="MM/YY" {...field} />
              </FormControl>
              <FormDescription>Format: MM/YY (ex: 12/25)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Définir comme carte par défaut</FormLabel>
                <FormDescription>Cette carte sera utilisée par défaut pour vos achats</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ajout en cours...
            </>
          ) : (
            "Ajouter la carte"
          )}
        </Button>
      </form>
    </Form>
  )
}
