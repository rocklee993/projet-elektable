"use client"

import { Line } from "@/components/ui/chart"

const data = [
  {
    date: "Lun",
    price: 0.1756,
  },
  {
    date: "Mar",
    price: 0.1823,
  },
  {
    date: "Mer",
    price: 0.1795,
  },
  {
    date: "Jeu",
    price: 0.1812,
  },
  {
    date: "Ven",
    price: 0.1867,
  },
  {
    date: "Sam",
    price: 0.1834,
  },
  {
    date: "Dim",
    price: 0.1842,
  },
]

export default function PriceChart() {
  return (
    <div className="h-[200px] w-full">
      <Line
        data={data}
        index="date"
        categories={["price"]}
        colors={["#16a34a"]}
        valueFormatter={(value) => `${value.toFixed(4)} €`}
        yAxisWidth={60}
        showAnimation
      />
    </div>
  )
}

