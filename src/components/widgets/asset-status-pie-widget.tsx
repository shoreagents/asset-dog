"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PieChart } from "lucide-react"

const data = [
  { name: 'In Use', value: 1156, color: '#22c55e', percentage: 92.6 },
  { name: 'Available', value: 68, color: '#3b82f6', percentage: 5.4 },
  { name: 'Maintenance', value: 23, color: '#f59e0b', percentage: 1.8 },
];

export function AssetStatusPieWidget() {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Asset Status
        </CardTitle>
        <CardDescription>
          Current status distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple Progress Bar Chart */}
          <div className="h-32 flex items-center justify-center">
            <div className="w-32 h-32 relative">
              <div className="w-full h-full rounded-full border-4 border-muted relative overflow-hidden">
                {data.map((item, index) => {
                  const cumulativePercentage = data.slice(0, index).reduce((sum, d) => sum + d.percentage, 0)
                  return (
                    <div
                      key={index}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from ${cumulativePercentage * 3.6}deg, ${item.color} 0deg ${item.percentage * 3.6}deg, transparent ${item.percentage * 3.6}deg)`
                      }}
                    />
                  )
                })}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold">{total.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.value}</Badge>
                    <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                  </div>
                </div>
                {index < data.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
