"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { mockAssetStats } from "@/lib/dashboard-data"
import { Package, Users, AlertTriangle, DollarSign } from "lucide-react"

export function AssetStatsWidget() {
  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Asset Statistics
        </CardTitle>
        <CardDescription>
          Overview of your asset inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Assets</span>
              <Badge variant="secondary">{mockAssetStats.totalAssets}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Assets</span>
              <Badge variant="default">{mockAssetStats.activeAssets}</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintenance Due</span>
              <Badge variant="destructive">{mockAssetStats.maintenanceDue}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Value</span>
              <Badge variant="outline">${mockAssetStats.totalValue.toLocaleString()}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
