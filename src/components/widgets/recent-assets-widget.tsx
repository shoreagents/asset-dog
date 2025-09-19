"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
        <div className="space-y-3">
          {mockRecentAssets.slice(0, 4).map((asset, index) => (
            <div key={asset.id}>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-sm">{asset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {asset.id} • {asset.category}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={asset.status === 'In Use' ? 'default' : asset.status === 'Available' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {asset.status}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/assets/${asset.id}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
              {index < mockRecentAssets.slice(0, 4).length - 1 && <Separator className="my-2" />}
            </div>
          ))}
          <Separator className="my-4" />
          <Button variant="outline" className="w-full" asChild>
            <Link href="/assets">View All Assets</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
