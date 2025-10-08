"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { Building } from "lucide-react"

export function DepartmentOverviewWidget() {
  const { data: assets = [], isLoading } = useInstantAssets()
  
  const departmentData = React.useMemo(() => {
    if (isLoading) return []
    
    const deptCounts = assets.reduce((acc, asset) => {
      const dept = asset.department || 'Unassigned'
      if (!acc[dept]) {
        acc[dept] = { name: dept, assetCount: 0, value: 0 }
      }
      acc[dept].assetCount++
      acc[dept].value += asset.value || 0
      return acc
    }, {} as Record<string, { name: string; assetCount: number; value: number }>)
    
    return Object.values(deptCounts)
      .sort((a, b) => b.assetCount - a.assetCount)
      .slice(0, 8) // Show top 8 departments
  }, [assets, isLoading])

  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Department Overview
        </CardTitle>
        <CardDescription>
          Asset distribution by department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] sm:h-[200px]">
          <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
            {departmentData.map((dept, index) => (
              <div key={index}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <div className="font-medium text-sm">{dept.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-5">
                      {dept.assetCount} assets • ${dept.value.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {dept.assetCount}
                  </Badge>
                </div>
                {index < departmentData.length - 1 && <Separator className="my-1 sm:my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
