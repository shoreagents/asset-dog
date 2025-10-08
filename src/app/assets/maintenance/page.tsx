"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { useInstantMaintenance } from "@/hooks/use-instant-maintenance"
import { useCreateMaintenance } from "@/hooks/use-maintenance-query"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CalendarIcon, ArrowLeft, Wrench, Plus, X, Package, DollarSign, Clock, CheckCircle, AlertTriangle, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Get available assets for maintenance (exclude disposed assets)
const getAvailableAssets = (assets: any[]) => {
  return assets.filter(asset => asset.status !== "Dispose")
}

// Simplified form validation schema matching the image
const maintenanceFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  maintenanceTitle: z.string().min(1, "Maintenance title is required"),
  maintenanceDetails: z.string().optional(),
  maintenanceDueDate: z.date({
    message: "Maintenance due date is required",
  }),
  maintenanceBy: z.string().min(1, "Maintenance by is required"),
  maintenanceStatus: z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
    message: "Please select maintenance status",
  }),
  dateCompleted: z.date().optional(),
  maintenanceCost: z.number().min(0, "Maintenance cost must be positive"),
  isRepeating: z.enum(["yes", "no"], {
    message: "Please select if repeating",
  }),
})

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>

export default function MaintenancePage() {
  const router = useRouter()
  const { data: assets = [], isLoading: assetsLoading, error: assetsError } = useInstantAssets()
  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useInstantMaintenance()
  const createMaintenanceMutation = useCreateMaintenance()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")

  // Get real data
  const availableAssets = getAvailableAssets(assets)
  const isLoading = assetsLoading || maintenanceLoading
  const error = assetsError

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      assetIds: [],
      maintenanceTitle: "",
      maintenanceDetails: "",
      maintenanceDueDate: new Date(),
      maintenanceBy: "",
      maintenanceStatus: "scheduled",
      dateCompleted: undefined,
      maintenanceCost: 0,
      isRepeating: "no",
    },
  })

  const maintenanceStatus = form.watch("maintenanceStatus")

  // Filter assets based on search
  const filteredAssets = availableAssets.filter(asset =>
    asset.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    (asset.name || '').toLowerCase().includes(assetSearch.toLowerCase())
  )

  // Add asset to selection
  const addAsset = (assetId: string) => {
    if (!selectedAssets.includes(assetId)) {
      const newSelection = [...selectedAssets, assetId]
      setSelectedAssets(newSelection)
      form.setValue("assetIds", newSelection)
      setAssetSearch("")
    }
  }

  // Remove asset from selection
  const removeAsset = (assetId: string) => {
    const newSelection = selectedAssets.filter(id => id !== assetId)
    setSelectedAssets(newSelection)
    form.setValue("assetIds", newSelection)
  }

  // Get selected asset details
  const getSelectedAssetDetails = () => {
    return selectedAssets.map(id => availableAssets.find(asset => asset.id === id)).filter(Boolean)
  }

  const onSubmit = async (data: MaintenanceFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please add at least one asset for maintenance",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare maintenance data for the API
      const maintenanceData = {
        asset_ids: selectedAssets,
        maintenance_title: data.maintenanceTitle,
        maintenance_details: data.maintenanceDetails || "",
        maintenance_due_date: format(data.maintenanceDueDate, "yyyy-MM-dd"),
        maintenance_by: data.maintenanceBy,
        maintenance_status: data.maintenanceStatus,
        date_completed: data.dateCompleted ? format(data.dateCompleted, "yyyy-MM-dd") : undefined,
        maintenance_cost: data.maintenanceCost,
        is_repeating: data.isRepeating
      }

      console.log("Creating maintenance records:", maintenanceData)
      
      await createMaintenanceMutation.mutateAsync(maintenanceData)
      
      // Reset form
      form.reset()
      setSelectedAssets([])
      
      // Redirect to assets page after successful maintenance scheduling
      setTimeout(() => {
        router.push("/assets")
      }, 1500)
    } catch (error) {
      console.error("Error scheduling maintenance:", error)
      toast.error("Failed to schedule maintenance", {
        description: error instanceof Error ? error.message : "Please try again or contact support if the issue persists.",
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
                  <BreadcrumbLink href="/assets">
                    Assets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Maintenance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Maintenance */}
        <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Assets Pending Maintenance</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Record scheduled or completed maintenance on assets
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <p className="text-red-600 font-medium">Failed to load assets</p>
                <p className="text-muted-foreground text-sm mt-2">{error instanceof Error ? error.message : "Failed to load assets"}</p>
              </div>
            </div>
          )}

          {/* Loading State - Only show if no error */}
          {isLoading && !error && (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assets from database...</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!error && (
            <>
              {/* Maintenance Summary Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-yellow-500" />
                    Maintenance Overview
                  </CardTitle>
                  <CardDescription>
                    Summary of maintenance records and asset status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Maintenance Records */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Records</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {maintenanceRecords.length}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>

                    {/* Scheduled Maintenance */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                      <div>
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Scheduled</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                          {maintenanceRecords.filter(r => r.status === 'scheduled').length}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>

                    {/* In Progress Maintenance */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">In Progress</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                          {maintenanceRecords.filter(r => r.status === 'in_progress').length}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>

                    {/* Completed Maintenance */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Completed</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {maintenanceRecords.filter(r => r.status === 'completed').length}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Assets Under Maintenance */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">Assets Under Maintenance</p>
                        <p className="text-lg font-semibold">
                          {assets.filter(a => a.status === 'Maintenance').length}
                        </p>
                      </div>
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Total Maintenance Cost */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">Total Cost</p>
                        <p className="text-lg font-semibold">
                          ₱{maintenanceRecords.reduce((sum, r) => sum + (r.maintenance_cost || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Upcoming Maintenance */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">Due This Week</p>
                        <p className="text-lg font-semibold">
                          {maintenanceRecords.filter(r => {
                            const dueDate = new Date(r.maintenance_due_date)
                            const now = new Date()
                            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                            return dueDate >= now && dueDate <= nextWeek && r.status === 'scheduled'
                          }).length}
                        </p>
                      </div>
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Asset Selection Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Asset Selection
                    </CardTitle>
                    <CardDescription>
                      Select the assets requiring maintenance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Search Assets</Label>
                        <div className="relative">
                          <Input
                            placeholder="Search by Asset ID or Name..."
                            value={assetSearch}
                            onChange={(e) => setAssetSearch(e.target.value)}
                            className="pr-10"
                          />
                          {assetSearch && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setAssetSearch("")}
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {assetSearch && (
                        <div className="border rounded-md bg-card shadow-sm max-h-48 overflow-hidden mb-4">
                          <ScrollArea className="max-h-48">
                            <div className="p-2">
                              {filteredAssets.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                  No assets found matching "{assetSearch}"
                                </div>
                              ) : (
                                filteredAssets.map((asset) => (
                                  <div
                                    key={asset.id}
                                    className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer rounded-md transition-colors"
                                    onClick={() => addAsset(asset.id)}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium">{asset.id} - {asset.name || 'Unnamed Asset'}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {asset.category || 'Uncategorized'} • {asset.location || 'No location'} • ₱{asset.value?.toLocaleString() || '0'}
                                      </div>
                                    </div>
                                    <Plus className="h-4 w-4 text-primary" />
                                  </div>
                                ))
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      )}

                      {/* Selected Assets Table */}
                      {selectedAssets.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Selected Assets for Maintenance</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAssets([])
                                form.setValue("assetIds", [])
                              }}
                              className="h-7 px-3 text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                          <div className="border rounded-md bg-card">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Asset Tag ID</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Description</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Assigned to</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Site</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Location</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Lease to</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getSelectedAssetDetails().map((asset) => (
                                    <tr key={asset!.id} className="border-b hover:bg-muted/30 transition-colors">
                                      <td className="p-3 font-medium text-sm">{asset!.id}</td>
                                      <td className="p-3 text-sm text-orange-600">{asset!.description || 'SEE SUB-CATEGORY'}</td>
                                      <td className="p-3">
                                        <Badge variant="secondary" className="text-xs">{asset!.status}</Badge>
                                      </td>
                                      <td className="p-3 text-sm">{asset!.assignedTo || ''}</td>
                                      <td className="p-3 text-sm text-orange-600">{asset!.site || 'HAULER'}</td>
                                      <td className="p-3 text-sm">{asset!.location || 'HAULER'}</td>
                                      <td className="p-3 text-sm">{asset!.notes?.includes('[LEASE') ? 'Leased' : ''}</td>
                                      <td className="p-3">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeAsset(asset!.id)}
                                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Separator */}
                <div className="my-6">
                  <Separator />
                </div>

                {/* Maintenance Details Form */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wrench className="h-5 w-5 text-yellow-500" />
                      Maintenance Details
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Record the maintenance information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-5">
                        <FormField
                          control={form.control}
                          name="maintenanceTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Maintenance Title *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter maintenance title" 
                                  className="h-10"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maintenanceDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Maintenance Details</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the maintenance work..."
                                  className="resize-none min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maintenanceDueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-medium">Maint. Due Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full h-10 pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "dd/MM/yyyy")
                                      ) : (
                                        <span>dd/MM/yyyy</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maintenanceBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Maintenance By</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter maintenance provider" 
                                  className="h-10"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Right Column */}
                      <div className="space-y-5">
                        <FormField
                          control={form.control}
                          name="maintenanceStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Maintenance Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select ..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {maintenanceStatus === "completed" && (
                          <FormField
                            control={form.control}
                            name="dateCompleted"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-sm font-medium">Date completed</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full h-10 pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "dd/MM/yyyy")
                                        ) : (
                                          <span>dd/MM/yyyy</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date("1900-01-01")}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="maintenanceCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Maintenance Cost</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">₱</span>
                                  <Input
                                    type="number"
                                    placeholder="Philippines Peso"
                                    className="pl-8 h-10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isRepeating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Repeating</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-6 pt-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="repeating-yes"
                                      value="yes"
                                      checked={field.value === "yes"}
                                      onChange={() => field.onChange("yes")}
                                      className="h-4 w-4 text-primary"
                                    />
                                    <Label htmlFor="repeating-yes" className="text-sm">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="repeating-no"
                                      value="no"
                                      checked={field.value === "no"}
                                      onChange={() => field.onChange("no")}
                                      className="h-4 w-4 text-primary"
                                    />
                                    <Label htmlFor="repeating-no" className="text-sm">No</Label>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-10 px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || selectedAssets.length === 0}
                    className="h-10 px-6 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Wrench className="h-4 w-4 mr-2" />
                        Add Maintenance
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
