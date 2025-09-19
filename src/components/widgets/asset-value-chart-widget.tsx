"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: 'Jan', value: 2400000 },
  { month: 'Feb', value: 2600000 },
  { month: 'Mar', value: 2500000 },
  { month: 'Apr', value: 2700000 },
  { month: 'May', value: 2800000 },
  { month: 'Jun', value: 2847500 },
];

export function AssetValueChartWidget() {
  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Asset Value Trend
        </CardTitle>
        <CardDescription>
          Asset portfolio value over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-center">
          <Badge variant="outline" className="text-sm">
            Current Value: $2,847,500
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
