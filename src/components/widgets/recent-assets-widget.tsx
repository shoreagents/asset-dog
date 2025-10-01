"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockRecentAssets } from "@/lib/dashboard-data"
import { Package, Eye } from "lucide-react"
import Link from "next/link"

export function RecentAssetsWidget() {
  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Assets
        </CardTitle>
        <CardDescription>
          Latest assets in your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] sm:h-[200px]">
          <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
            {mockRecentAssets.slice(0, 3).map((asset, index) => (
              <div key={asset.id}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{asset.name}</div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {asset.id} • {asset.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge 
                      variant={asset.status === 'In Use' ? 'default' : asset.status === 'Available' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {asset.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0 sm:h-8 sm:w-8">
                      <Link href={`/assets/${asset.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
                {index < 2 && <Separator className="my-1 sm:my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="my-3 sm:my-4" />
        <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
          <Link href="/assets">View All Assets</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
