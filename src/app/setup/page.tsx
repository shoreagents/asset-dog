"use client"

import { useState } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  Cog, 
  Building2, 
  MapPin, 
  FolderOpen, 
  Building, 
  Users, 
  Database, 
  Activity, 
  Table, 
  Archive, 
  Settings2, 
  LayoutDashboard, 
  FileEdit, 
  Mail,
  ArrowRight 
} from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Cog className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Setup</h1>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 sm:p-6 md:p-8 pt-0">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Setup</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Setup</h1>
                <p className="text-muted-foreground">
                  Configuration and customization settings for your asset management system
                </p>
              </div>
            </div>

            {/* Setup Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company Info */}
              <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Company Info</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 mb-4">
                    Store company profile details (name, contact, address)
                  </p>
                  <Button asChild className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/company-info">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Sites */}
              <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-110 transition-all duration-300">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Sites</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300 mb-4">
                    Define main company sites/branches
                  </p>
                  <Button asChild className="w-full group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/sites">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Locations */}
              <Card className="group hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 group-hover:scale-110 transition-all duration-300">
                    <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Locations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300 mb-4">
                    Define specific areas within sites (floors, rooms, storage)
                  </p>
                  <Button asChild className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/locations">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="group hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 group-hover:scale-110 transition-all duration-300">
                    <Building className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">Categories</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 mb-4">
                    Group assets into categories (IT equipment, furniture, vehicles)
                  </p>
                  <Button asChild className="w-full group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/categories">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Departments */}
              <Card className="group hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900 mr-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 group-hover:scale-110 transition-all duration-300">
                    <Users className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">Departments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-300 mb-4">
                    Organize assets by company department
                  </p>
                  <Button asChild className="w-full group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/departments">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Databases */}
              <Card className="group hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 mr-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 group-hover:scale-110 transition-all duration-300">
                    <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">Databases</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-300 mb-4">
                    Advanced database configuration and storage options
                  </p>
                  <Button asChild className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/databases">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Events */}
              <Card className="group hover:shadow-lg hover:shadow-pink-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900 mr-3 group-hover:bg-pink-200 dark:group-hover:bg-pink-800 group-hover:scale-110 transition-all duration-300">
                    <Activity className="h-5 w-5 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">Events</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors duration-300 mb-4">
                    Logs key system events and notifications
                  </p>
                  <Button asChild className="w-full group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/events">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Table Options */}
              <Card className="group hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900 mr-3 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 group-hover:scale-110 transition-all duration-300">
                    <Table className="h-5 w-5 text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">Table Options</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mb-4">
                    Customize data table views, fields, and columns
                  </p>
                  <Button asChild className="w-full group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/table-options">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card className="group hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800 group-hover:scale-110 transition-all duration-300">
                    <Archive className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Inventory</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300 mb-4">
                    Manages stock-type items (consumables, spare parts)
                  </p>
                  <Button asChild className="w-full group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/inventory">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Options */}
              <Card className="group hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 mr-3 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 group-hover:scale-110 transition-all duration-300">
                    <Settings2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">Options</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors duration-300 mb-4">
                    General configuration settings (currency, time zone, numbering)
                  </p>
                  <Button asChild className="w-full group-hover:bg-yellow-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/options">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Manage Dashboard */}
              <Card className="group hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 mr-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 group-hover:scale-110 transition-all duration-300">
                    <LayoutDashboard className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">Manage Dashboard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300 mb-4">
                    Customizes the dashboard layout and widgets
                  </p>
                  <Button asChild className="w-full group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/manage-dashboard">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Customize Forms */}
              <Card className="group hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900 mr-3 group-hover:bg-violet-200 dark:group-hover:bg-violet-800 group-hover:scale-110 transition-all duration-300">
                    <FileEdit className="h-5 w-5 text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">Customize Forms</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-300 mb-4">
                    Modify forms for data entry to suit business needs
                  </p>
                  <Button asChild className="w-full group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/customize-forms">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Customize Emails */}
              <Card className="group hover:shadow-lg hover:shadow-rose-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900 mr-3 group-hover:bg-rose-200 dark:group-hover:bg-rose-800 group-hover:scale-110 transition-all duration-300">
                    <Mail className="h-5 w-5 text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-300">Customize Emails</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors duration-300 mb-4">
                    Personalize automated system emails and notifications
                  </p>
                  <Button asChild className="w-full group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                    <Link href="/setup/customize-emails">
                      Configure
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}



