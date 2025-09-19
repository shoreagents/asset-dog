"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockDepartments } from "@/lib/dashboard-data"
import { Building } from "lucide-react"

export function DepartmentOverviewWidget() {
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
        <div className="space-y-3">
          {mockDepartments.map((dept, index) => (
            <div key={index}>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-sm">{dept.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {dept.assetCount} assets • ${dept.value.toLocaleString()}
                  </div>
                </div>
                <Badge variant="outline">
                  {dept.assetCount}
                </Badge>
              </div>
              {index < mockDepartments.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
