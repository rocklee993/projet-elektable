"use client"

import { useEffect, useState } from "react"
import { Line } from "@/components/ui/chart"
import { getElectricityPrices } from "@/lib/api"

export default function ElectricityPriceChart() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await getElectricityPrices()
        setPrices(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des prix:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  if (loading) return <div>Chargement...</div>

  return (
    <div className="h-[300px] w-full">
      <Line
        data={prices}
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
    </div>
  )
}
