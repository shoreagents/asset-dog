"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockMaintenanceAlerts } from "@/lib/dashboard-data"
import { AlertTriangle, Calendar } from "lucide-react"

export function MaintenanceAlertsWidget() {
  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Maintenance Alerts
        </CardTitle>
        <CardDescription>
          Upcoming maintenance schedules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] sm:h-[200px]">
          <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
            {mockMaintenanceAlerts.map((alert, index) => (
              <div key={alert.id}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{alert.asset}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Due: {alert.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge 
                      variant={alert.priority === 'High' ? 'destructive' : alert.priority === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {alert.type}
                    </Badge>
                  </div>
                </div>
                {index < mockMaintenanceAlerts.length - 1 && <Separator className="my-1 sm:my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="my-3 sm:my-4" />
        <Button variant="outline" className="w-full text-xs sm:text-sm">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  )
}
