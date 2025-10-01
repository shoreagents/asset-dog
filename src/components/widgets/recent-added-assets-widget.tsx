"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllAssets } from "@/lib/centralized-assets"
import { Package, Eye, UserCheck, UserMinus, Calendar } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function RecentAddedAssetsWidget() {
  const [checkInOutLoading, setCheckInOutLoading] = useState<string | null>(null)

  // Get recent assets (last 5 added)
  const recentAssets = getAllAssets()
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 3)

  const handleCheckIn = async (assetId: string) => {
    setCheckInOutLoading(assetId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCheckInOutLoading(null)
    // In a real app, this would update the asset status
    console.log(`Checked in asset: ${assetId}`)
  }

  const handleCheckOut = async (assetId: string) => {
    setCheckInOutLoading(assetId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCheckInOutLoading(null)
    // In a real app, this would update the asset status
    console.log(`Checked out asset: ${assetId}`)
  }

  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Added Assets
        </CardTitle>
        <CardDescription>
          Recently added assets with check in/out functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] sm:h-[200px]">
          <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
            {recentAssets.map((asset, index) => (
              <div key={asset.id}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{asset.name}</div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {asset.id} • {asset.category}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      Added: {new Date(asset.purchaseDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge 
                      variant={asset.status === 'In Use' ? 'default' : asset.status === 'Available' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {asset.status}
                    </Badge>
                    <div className="flex gap-1">
                      {asset.status === 'Available' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 w-6 p-0 sm:h-8 sm:w-8 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                          onClick={() => handleCheckOut(asset.id)}
                          disabled={checkInOutLoading === asset.id}
                          title="Check Out"
                        >
                          <UserCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 w-6 p-0 sm:h-8 sm:w-8 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200"
                          onClick={() => handleCheckIn(asset.id)}
                          disabled={checkInOutLoading === asset.id}
                          title="Check In"
                        >
                          <UserMinus className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0 sm:h-8 sm:w-8">
                        <Link href={`/assets/${asset.id}`}>
                          <Eye className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                {index < recentAssets.length - 1 && <Separator className="my-1 sm:my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="my-3 sm:my-4" />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-xs sm:text-sm" asChild>
            <Link href="/assets">View All Assets</Link>
          </Button>
          <Button variant="outline" className="flex-1 text-xs sm:text-sm" asChild>
            <Link href="/assets/add">Add New Asset</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

