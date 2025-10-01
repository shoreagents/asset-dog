"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { status: "in-use", count: 1156, fill: "var(--color-in-use)" },
  { status: "available", count: 68, fill: "var(--color-available)" },
  { status: "maintenance", count: 23, fill: "var(--color-maintenance)" },
  { status: "disposed", count: 12, fill: "var(--color-disposed)" },
  { status: "reserved", count: 45, fill: "var(--color-reserved)" },
]

const chartConfig = {
  count: {
    label: "Assets",
  },
  "in-use": {
    label: "In Use",
    color: "var(--chart-1)",
  },
  available: {
    label: "Available",
    color: "var(--chart-2)",
  },
  maintenance: {
    label: "Maintenance",
    color: "var(--chart-3)",
  },
  disposed: {
    label: "Disposed",
    color: "var(--chart-4)",
  },
  reserved: {
    label: "Reserved",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function AssetStatusPieWidget() {
  const totalAssets = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <Card className="flex flex-col hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader className="items-center pb-0">
        <CardTitle>Asset Status</CardTitle>
        <CardDescription>Asset inventory status overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalAssets.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Assets
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Asset utilization up by 2.1% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Current asset status distribution across all categories
        </div>
      </CardFooter>
    </Card>
  )
}
