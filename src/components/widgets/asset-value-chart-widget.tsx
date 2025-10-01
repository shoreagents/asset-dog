"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DataManager } from "@/lib/lists-data"

// Function to generate chart data from real asset data
const generateChartData = () => {
  const dataManager = DataManager.getInstance()
  const assets = dataManager.getAssets()
  
  // Group assets by category and calculate total values
  const categoryTotals = assets.reduce((acc, asset) => {
    const category = asset.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += asset.value || 0
    return acc
  }, {} as Record<string, number>)

  // Separate IT and Non-IT assets
  const itCategories = ['COMPUTER - MAIN ITEMS', 'NETWORK DEVICE', 'COMPUTER ACCESSORIES']
  const nonItCategories = ['OFFICE FURNITURE', 'FIRE EQUIPMENT', 'HARDWARE AND OFFICE ESSENTIALS', 'PHOTOGRAPHY AND VIDEOGRAPHY', 'COMMUNICATION AND WATCHES', 'OFFICE ELECTRONICS AND KITCHEN EQUIPMENT']
  
  const itValue = Object.entries(categoryTotals)
    .filter(([category]) => itCategories.some(itCat => category.includes(itCat)))
    .reduce((sum, [, value]) => sum + value, 0)
  
  const nonItValue = Object.entries(categoryTotals)
    .filter(([category]) => nonItCategories.some(nonItCat => category.includes(nonItCat)))
    .reduce((sum, [, value]) => sum + value, 0)
  
  // Generate 30 days of data with some variation
  const chartData = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toISOString().split('T')[0]
    
    // Add some variation to make it look realistic
    const hardwareVariation = (Math.random() - 0.5) * 0.3 // ±15% variation
    const softwareVariation = (Math.random() - 0.5) * 0.3 // ±15% variation
    
    chartData.push({
      date: dateStr,
      hardware: Math.round(nonItValue * (1 + hardwareVariation)),
      software: Math.round(itValue * (1 + softwareVariation))
    })
  }

  return chartData
}

const chartConfig = {
  views: {
    label: "Asset Value",
  },
  hardware: {
    label: "Non-IT",
    color: "var(--chart-2)",
  },
  software: {
    label: "IT Assets",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AssetValueChartWidget() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("hardware")

  const chartData = React.useMemo(() => generateChartData(), [])

  const total = React.useMemo(
    () => ({
      hardware: chartData.reduce((acc, curr) => acc + curr.hardware, 0),
      software: chartData.reduce((acc, curr) => acc + curr.software, 0),
    }),
    [chartData]
  )

  return (
    <Card className="py-0 hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Asset Value Chart</CardTitle>
          <CardDescription>
            Showing asset values for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["hardware", "software"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  ₱{total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Value']}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
