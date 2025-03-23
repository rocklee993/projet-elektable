"use client"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line as ReactChartJSLine } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface LineChartProps {
  data: { [key: string]: string | number }[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  xAxisFormatter?: (value: string) => string
  yAxisWidth?: number
  showAnimation?: boolean
  showLegend?: boolean
  showGridLines?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  startEndOnly?: boolean
}

export function Line({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  xAxisFormatter,
  yAxisWidth = 40,
  showAnimation = false,
  showLegend = true,
  showGridLines = false,
  showXAxis = true,
  showYAxis = true,
  startEndOnly = true,
}: LineChartProps) {
  const chartData = {
    labels: data.map((item) => item[index]?.toString() || ""),
    datasets: categories.map((category, i) => ({
      label: category,
      data: data.map((item) => item[category] as number),
      borderColor: colors[i],
      backgroundColor: colors[i],
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      fill: false,
    })),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: showXAxis,
        grid: {
          display: showGridLines,
        },
        ticks: {
          callback: xAxisFormatter,
          autoSkip: true,
          maxRotation: 0,
          padding: 10,
          align: "center",
          minRotation: 0,
          sampleSize: 5,
          showLabelBackdrop: false,
          source: "auto",
          stepSize: 1,
        },
      },
      y: {
        display: showYAxis,
        position: "left",
        ticks: {
          callback: valueFormatter,
          count: 5,
        },
        grid: {
          display: showGridLines,
        },
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: "top" as const,
        align: "end" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ""

            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += valueFormatter ? valueFormatter(context.parsed.y) : context.parsed.y
            }
            return label
          },
        },
      },
    },
  }

  return <ReactChartJSLine data={chartData} options={options} />
}

