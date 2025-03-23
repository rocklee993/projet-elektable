"use client"

import { useEffect, useState } from "react"
import { Line } from "@/components/ui/chart"
import { getElectricityPrices } from "@/lib/api"

export default function ElectricityPriceChart() {
  const [priceData, setPriceData] = useState([
    {
      date: "2025-03-10",
      price: 0.1756,
    },
    {
      date: "2025-03-11",
      price: 0.1823,
    },
    {
      date: "2025-03-12",
      price: 0.1795,
    },
    {
      date: "2025-03-13",
      price: 0.1812,
    },
    {
      date: "2025-03-14",
      price: 0.1867,
    },
    {
      date: "2025-03-15",
      price: 0.1834,
    },
    {
      date: "2025-03-16",
      price: 0.1842,
    },
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Appeler d'abord l'API d'initialisation pour s'assurer que la BD est prête
        await fetch("/api/init")

        const prices = await getElectricityPrices()
        if (prices && prices.length > 0) {
          setPriceData(prices)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des prix:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
  }, [])

  return (
    <div className="h-[300px] w-full">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Line
          data={priceData}
          index="date"
          categories={["price"]}
          colors={["#16a34a"]}
          valueFormatter={(value) => `${value.toFixed(4)} €`}
          yAxisWidth={60}
          showAnimation
          showLegend={false}
          showGridLines={true}
          showXAxis={true}
          showYAxis={true}
          startEndOnly={false}
          xAxisFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })
          }}
        />
      )}
    </div>
  )
}

