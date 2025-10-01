"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DataManager } from "@/lib/lists-data"
import { Package, CheckCircle, Clock, DollarSign } from "lucide-react"

export function AssetStatsWidget() {
  const assetStats = React.useMemo(() => {
    const dataManager = DataManager.getInstance()
    const assets = dataManager.getAssets()
    
    return {
      totalAssets: assets.length,
      activeAssets: assets.filter(asset => asset.status === 'In Use').length,
      maintenanceDue: assets.filter(asset => asset.status === 'Maintenance').length,
      totalValue: assets.reduce((sum, asset) => sum + (asset.value || 0), 0)
    }
  }, [])

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
        <div className="space-y-2 sm:space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="h-auto p-3 flex flex-col gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200">
              <div className="flex items-center justify-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100">Total Assets</div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{assetStats.totalAssets}</div>
              </div>
            </div>
            <div className="h-auto p-3 flex flex-col gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200">
              <div className="flex items-center justify-center">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-green-900 dark:text-green-100">Active Assets</div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">{assetStats.activeAssets}</div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="h-auto p-3 flex flex-col gap-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200">
              <div className="flex items-center justify-center">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-orange-900 dark:text-orange-100">Maintenance Due</div>
                <div className="text-lg font-bold text-orange-900 dark:text-orange-100">{assetStats.maintenanceDue}</div>
              </div>
            </div>
            <div className="h-auto p-3 flex flex-col gap-2 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200">
              <div className="flex items-center justify-center">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-purple-900 dark:text-purple-100">Total Value</div>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">₱{assetStats.totalValue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
