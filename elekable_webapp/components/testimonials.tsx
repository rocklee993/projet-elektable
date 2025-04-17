import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Sophie Martin",
    role: "Propriétaire de panneaux solaires",
    content:
      "Grâce à Elekable, je peux vendre l'excédent d'électricité produit par mes panneaux solaires directement à mes voisins. C'est écologique et économique!",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Thomas Dubois",
    role: "Consommateur",
    content:
      "J'ai réduit ma facture d'électricité de 20% en achetant directement auprès de producteurs locaux. L'interface est simple et les prix sont transparents.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Marie Leroy",
    role: "Propriétaire d'éoliennes domestiques",
    content:
      "Elekable m'a permis de rentabiliser mon investissement dans des éoliennes domestiques beaucoup plus rapidement que prévu. Je recommande vivement!",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function Testimonials() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 py-8">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Image
                src={testimonial.avatar || "/placeholder.svg"}
                alt={testimonial.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h3 className="font-semibold">{testimonial.name}</h3>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground">{testimonial.content}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
