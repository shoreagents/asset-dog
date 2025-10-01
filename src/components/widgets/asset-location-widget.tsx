"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockAssetLocations } from "@/lib/dashboard-data"
import { MapPin } from "lucide-react"

export function AssetLocationWidget() {
  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Asset Locations
        </CardTitle>
        <CardDescription>
          Distribution across locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] sm:h-[200px]">
          <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
            {mockAssetLocations.map((location, index) => (
              <div key={index}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <div className="font-medium text-sm">{location.location}</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(location.count / Math.max(...mockAssetLocations.map(l => l.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {location.count}
                  </Badge>
                </div>
                {index < mockAssetLocations.length - 1 && <Separator className="my-1 sm:my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
