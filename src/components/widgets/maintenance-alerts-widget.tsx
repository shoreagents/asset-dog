"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
        <div className="space-y-3">
          {mockMaintenanceAlerts.map((alert, index) => (
            <div key={alert.id}>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-sm">{alert.asset}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {alert.dueDate}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={alert.priority === 'High' ? 'destructive' : alert.priority === 'Medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {alert.type}
                  </Badge>
                </div>
              </div>
              {index < mockMaintenanceAlerts.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
          <Separator className="my-4" />
          <Button variant="outline" className="w-full">
            View All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
