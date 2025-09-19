"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, UserCheck, UserMinus, Move, Package } from "lucide-react"
import Link from "next/link"

export function QuickActionsWidget() {
  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common asset management tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-1">
              <Link href="/assets/add">
                <Plus className="h-4 w-4" />
                <span className="text-xs">Add Asset</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-1">
              <Link href="/assets/checkout">
                <UserCheck className="h-4 w-4" />
                <span className="text-xs">Check Out</span>
              </Link>
            </Button>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-1">
              <Link href="/assets/checkin">
                <UserMinus className="h-4 w-4" />
                <span className="text-xs">Check In</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-1">
              <Link href="/assets/move">
                <Move className="h-4 w-4" />
                <span className="text-xs">Move Asset</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
