import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart2, Leaf, Shield, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PriceChart from "@/components/price-chart"
import { Testimonials } from "@/components/testimonials"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Elekable</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              Accueil
            </Link>
            <Link href="#mission" className="text-sm font-medium">
              Notre mission
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium">
              Comment ça marche
            </Link>
            <Link href="#testimonials" className="text-sm font-medium">
              Témoignages
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Échangez de l'électricité entre particuliers
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Achetez et vendez de l'électricité directement entre particuliers. Économisez sur vos factures et
                    contribuez à un avenir énergétique plus durable.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button className="px-8">
                      Commencer maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button variant="outline">En savoir plus</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=550&width=550"
                  width={550}
                  height={550}
                  alt="Échange d'électricité"
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="mission" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Notre mission
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Démocratiser l'échange d'énergie
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Elekable a pour mission de créer un marché de l'électricité plus équitable, plus transparent et plus
                  durable. Nous permettons aux particuliers de devenir acteurs de la transition énergétique.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Leaf className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Écologique</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Favorisez les énergies renouvelables en achetant directement auprès de producteurs locaux.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <BarChart2 className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Économique</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Réduisez vos factures d'électricité en achetant au meilleur prix selon le marché.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Sécurisé</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Transactions sécurisées et transparentes grâce à notre plateforme certifiée.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Comment ça marche
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, rapide et transparent
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Notre plateforme vous permet d'acheter et de vendre de l'électricité en quelques clics, en fonction du
                  prix du marché en temps réel.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <div className="rounded-lg border bg-background p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Prix de l'électricité en temps réel</h3>
                <PriceChart />
                <div className="mt-4 text-sm text-gray-500">
                  Exemple de visualisation des prix disponible sur votre dashboard personnel
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>1. Inscrivez-vous</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">
                    Créez votre compte en quelques minutes et complétez votre profil.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>2. Consultez les prix</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">
                    Suivez l'évolution des prix de l'électricité en temps réel sur votre dashboard.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>3. Achetez ou vendez</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choisissez le moment idéal pour acheter ou vendre selon les tendances du marché.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Témoignages
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ce que disent nos utilisateurs
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Découvrez les expériences de nos utilisateurs qui ont déjà adopté Elekable pour leurs besoins
                  énergétiques.
                </p>
              </div>
            </div>
            <Testimonials />
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background py-6 md:py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Elekable</span>
          </div>
          <p className="text-center text-sm text-gray-500 md:text-left dark:text-gray-400">
            &copy; {new Date().getFullYear()} Elekable. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Conditions d'utilisation
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

