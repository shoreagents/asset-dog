"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { List, Package, Wrench, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ListsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Asset Dog
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Lists</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Lists */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Lists</h1>
              </div>
              <p className="text-muted-foreground ml-6">
                Centralized lists for easy tracking and management
              </p>
            </div>
          </div>

          {/* Lists Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List of Assets */}
            <Card className="hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  List of Assets
                </CardTitle>
                <CardDescription>
                  Full record of all assets (same as in Assets menu)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage all assets in your inventory with detailed information including status, location, and value.
                </p>
                <Button asChild className="w-full">
                  <Link href="/lists/assets">
                    View Asset List
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* List of Maintenances */}
            <Card className="hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  List of Maintenances
                </CardTitle>
                <CardDescription>
                  Complete record of maintenance activities for tracking service history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track all maintenance activities, schedules, costs, and service history for your assets.
                </p>
                <Button asChild className="w-full">
                  <Link href="/lists/maintenances">
                    View Maintenance List
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* List of Warranties */}
            <Card className="hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  List of Warranties
                </CardTitle>
                <CardDescription>
                  Tracks warranties tied to assets, including start/end dates, coverage, and vendor information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Monitor warranty coverage, expiration dates, and vendor information for all your assets.
                </p>
                <Button asChild className="w-full">
                  <Link href="/lists/warranties">
                    View Warranty List
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Quick Overview
              </CardTitle>
              <CardDescription>
                Summary of all lists and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">247</div>
                  <div className="text-sm text-muted-foreground">Total Assets</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">89</div>
                  <div className="text-sm text-muted-foreground">Maintenance Records</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">156</div>
                  <div className="text-sm text-muted-foreground">Active Warranties</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
