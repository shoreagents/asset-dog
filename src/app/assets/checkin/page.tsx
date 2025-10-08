"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { useUpdateAsset } from "@/hooks/use-assets-query"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
import { CalendarIcon, ArrowLeft, UserMinus, Plus, X, Package, CheckCircle, DollarSign, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Mock locations
const mockLocations = [
  "IT Storage Room",
  "Main Office",
  "Conference Room A",
  "Conference Room B",
  "Storage Room",
  "Warehouse",
  "Parking Garage",
  "Reception Area",
  "Break Room",
  "Server Room"
]
// Asset interface for check-in
interface CheckinAsset {
  id: string
  name: string
  category: string
  assignedTo: string
  checkoutDate: string
  expectedReturnDate: string
  location: string
  value: number
  status: string
}

const checkinSchema = z.object({
  checkinDate: z.date({
    message: "Check-in date is required",
  }),
  condition: z.string().min(1, "Please select the asset condition"),
  location: z.string().min(1, "Please specify the return location"),
  notes: z.string().optional(),
})

type CheckinFormValues = z.infer<typeof checkinSchema>

export default function CheckinPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<CheckinAsset[]>([])
  const [assetIdInput, setAssetIdInput] = useState("")
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)

  // Use assets hook for Supabase integration
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()

  // Filter for checked out assets (including reserved and maintenance assets)
  const checkedOutAssets = useMemo(() => {
    return assets.filter(asset => 
      asset.status === "Check Out" || asset.status === "Reserve" || asset.status === "Maintenance"
    ).map(asset => ({
      id: asset.id,
      name: asset.name || "Unnamed Asset",
      category: asset.category,
      assignedTo: asset.assignedTo || "Unknown",
      checkoutDate: "2024-01-15", // TODO: Get from checkout history
      expectedReturnDate: "2024-02-15", // TODO: Get from checkout history
      location: asset.location,
      value: asset.value,
      status: asset.status
    }))
  }, [assets])

  // Filter assets based on input
  const filteredAssets = useMemo(() => {
    if (!assetIdInput.trim()) return []
    return checkedOutAssets.filter(asset => 
      asset.id.toLowerCase().includes(assetIdInput.toLowerCase()) ||
      (asset.name || '').toLowerCase().includes(assetIdInput.toLowerCase())
    )
  }, [checkedOutAssets, assetIdInput])

  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      condition: "",
      location: "",
      notes: "",
    },
  })

  // Get unique assigned persons from selected assets
  const getAssignedPersons = () => {
    const persons = selectedAssets.map(asset => asset.assignedTo)
    return [...new Set(persons)] // Remove duplicates
  }

  const assignedPersons = getAssignedPersons()

  const handleAssetIdInput = (value: string) => {
    setAssetIdInput(value)
    if (value.length > 0) {
      setShowAssetSuggestions(true)
    } else {
      setShowAssetSuggestions(false)
    }
  }

  const selectAsset = (asset: CheckinAsset) => {
    if (selectedAssets.find(a => a.id === asset.id)) {
      toast.error("Asset already added", {
        description: `Asset ${asset.id} is already in the list`,
      })
      return
    }

    setSelectedAssets(prev => [...prev, asset])
    setAssetIdInput("")
    setShowAssetSuggestions(false)
    toast.success("Asset added", {
      description: `${asset.name} has been added to the check-in list`,
    })
  }

  const addAssetById = () => {
    if (!assetIdInput.trim()) return

    const asset = checkedOutAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (!asset) {
      toast.error("Asset not found", {
        description: `No checked out asset found with ID: ${assetIdInput}`,
      })
      return
    }

    selectAsset(asset)
  }

  const removeAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId))
  }

  const onSubmit = async (data: CheckinFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please add at least one asset to check in",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Update each selected asset in Supabase
      const updatePromises = selectedAssets.map(async (asset) => {
        try {
          // Combine existing notes with check-in information
          const checkinInfo = `\n\n[CHECK-IN ${format(data.checkinDate, "yyyy-MM-dd")}] Condition: ${data.condition}${data.notes ? ` | Notes: ${data.notes}` : ''}`
          
          const assetData = {
            status: "Available" as const,
            assignedTo: "",
            location: data.location,
            notes: checkinInfo
          }
          
          console.log('Checking in asset:', { assetId: asset.id, assetData })
          await updateAssetMutation.mutateAsync({ id: asset.id, updates: assetData })
          console.log('Check-in result: success')
          
          // If this was a maintenance asset, also update the maintenance record
          if (asset.status === "Maintenance") {
            try {
              const maintenanceResponse = await fetch('/api/maintenance', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              })
              const maintenanceResult = await maintenanceResponse.json()
              
              if (maintenanceResult.success) {
                const maintenanceRecord = maintenanceResult.data.find((record: any) => 
                  record.asset_id === asset.id && record.status !== 'completed'
                )
                
                if (maintenanceRecord) {
                  await fetch(`/api/maintenance/${maintenanceRecord.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      maintenance_status: 'completed',
                      date_completed: format(data.checkinDate, "yyyy-MM-dd")
                    })
                  })
                  console.log('Maintenance record updated to completed')
                }
              }
            } catch (maintenanceError) {
              console.warn('Could not update maintenance record:', maintenanceError)
              // Don't fail the check-in if maintenance record update fails
            }
          }
          
          return { success: true, assetId: asset.id }
        } catch (error) {
          console.error(`Failed to check in asset ${asset.id}:`, error)
          return { success: false, assetId: asset.id, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      })

      const results = await Promise.all(updatePromises)
      
      // Check if all updates were successful
      const failedUpdates = results.filter(result => !result.success)
      
      if (failedUpdates.length > 0) {
        console.error("Some asset updates failed:", failedUpdates)
        const errorMessages = failedUpdates.map(f => f.error || "Unknown error").filter(Boolean)
        toast.error("Some assets could not be checked in", {
          description: `${failedUpdates.length} asset(s) failed to update. ${errorMessages.length > 0 ? `Errors: ${errorMessages.join(', ')}` : 'Please try again.'}`,
          duration: 4000,
        })
        return
      }
      
      console.log("Check-in data:", { ...data, assets: selectedAssets })
      
      // Show success toast notification
      const maintenanceCount = selectedAssets.filter(asset => asset.status === "Maintenance").length
      const regularCount = selectedAssets.length - maintenanceCount
      
      let description = `${selectedAssets.length} asset(s) have been returned to inventory.`
      if (maintenanceCount > 0) {
        description += ` ${maintenanceCount} maintenance asset(s) completed.`
      }
      
      toast.success("Assets checked in successfully!", {
        description,
        duration: 4000,
      })
      
      // Redirect back to assets list
      router.push("/assets")
    } catch (error) {
      console.error("Error checking in assets:", error)
      toast.error("Failed to check in assets", {
        description: "Please try again or contact support if the issue persists.",
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
                  <BreadcrumbPage>Check In Asset</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Check In */}
        <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">
          {/* Page Header - Always show immediately */}
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
                  <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Check In Asset</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Return a checked out asset back to inventory
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive">
                <X className="h-4 w-4" />
                <span className="font-medium">Error loading assets</span>
              </div>
              <p className="text-sm text-destructive/80 mt-1">{error instanceof Error ? error.message : "Failed to load assets"}</p>
            </div>
          )}

          {/* Loading State - Only for data-dependent content */}
          {isLoading && !error && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assets...</p>
              </div>
            </div>
          )}

          {/* Check In Overview */}
          {!error && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Available</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                    {assets.filter(asset => asset.status === "Available").length}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Assets ready in inventory
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-110 transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Check Out</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                    {checkedOutAssets.length}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">
                    Assets currently checked out
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 group-hover:scale-110 transition-all duration-300">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Total Value</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                    ₱{assets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Total value of all assets
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {!error && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserMinus className="h-5 w-5" />
                  Asset Check-in Form
                </CardTitle>
                <CardDescription>
                  Fill out the form below to check in an asset and return it to inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Asset Selection */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Asset Selection
                  </CardTitle>
                  <CardDescription>
                    Select the assets you want to check in
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Add Assets to Check In</FormLabel>
                      <FormDescription>
                        Type asset ID and press Enter or click Add to add assets to the check-in list
                      </FormDescription>
                    </div>
                    
                    {/* Asset ID Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Enter Asset ID (e.g., AST-001)"
                          value={assetIdInput}
                          onChange={(e) => handleAssetIdInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addAssetById()
                            }
                          }}
                          onFocus={() => {
                            if (assetIdInput.length > 0) {
                              setShowAssetSuggestions(true)
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowAssetSuggestions(false), 200)
                          }}
                        />
                        
                        {/* Asset Suggestions Dropdown */}
                        {showAssetSuggestions && filteredAssets.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                            <ScrollArea className="h-60">
                              <div className="p-1">
                                {filteredAssets.map((asset) => (
                                  <button
                                    key={asset.id}
                                    type="button"
                                    onClick={() => selectAsset(asset)}
                                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm border-b border-border/30 last:border-b-0"
                                  >
                                    <div className="font-medium text-sm">{asset.id}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {asset.name || 'Unnamed Asset'} • {asset.category || 'Uncategorized'} • ₱{asset.value.toLocaleString()}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                        
                        {/* No results message */}
                        {showAssetSuggestions && filteredAssets.length === 0 && assetIdInput.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                            No checked out assets found for &quot;{assetIdInput}&quot;
                          </div>
                        )}
                      </div>
                      <Button type="button" onClick={addAssetById} disabled={!assetIdInput.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Selected Assets List */}
                    {selectedAssets.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">Selected Assets ({selectedAssets.length})</span>
                        </div>
                        <div className="border rounded-lg bg-card p-2">
                          <ScrollArea className="h-48">
                            <div className="space-y-2 pr-4">
                              {selectedAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{asset.name}</div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      {asset.id} • Assigned to: {asset.assignedTo} • Expected return: {asset.expectedReturnDate}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAsset(asset.id)}
                                    className="text-destructive hover:text-destructive flex-shrink-0 ml-2"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Person Information */}
              {assignedPersons.length > 0 && (
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      Assigned Person Information
                    </CardTitle>
                    <CardDescription>
                      Assets currently assigned to these persons
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {assignedPersons.map((personName) => {
                        const personAssets = selectedAssets.filter(asset => asset.assignedTo === personName)
                        return (
                          <div key={personName} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <div className="font-medium text-blue-900 dark:text-blue-100">{personName}</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              {personAssets.length} asset{personAssets.length !== 1 ? 's' : ''} to be checked in
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Assets: {personAssets.map(asset => asset.id).join(', ')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Check-in Details */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Check-in Details
                  </CardTitle>
                  <CardDescription>
                    Set the check-in date and return location
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Check-in Date */}
                    <FormField
                      control={form.control}
                      name="checkinDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-in Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
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
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the asset is being returned
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Return Location */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select where the asset is being returned to" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockLocations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose where the asset is being returned to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Asset Assessment */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Asset Assessment
                  </CardTitle>
                  <CardDescription>
                    Assess the condition and provide additional notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Asset Condition */}
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select the condition of the returned asset" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent - No issues</SelectItem>
                              <SelectItem value="good">Good - Minor wear</SelectItem>
                              <SelectItem value="fair">Fair - Some wear but functional</SelectItem>
                              <SelectItem value="poor">Poor - Significant wear or damage</SelectItem>
                              <SelectItem value="damaged">Damaged - Needs repair</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Assess the condition of the returned asset
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any observations about the asset condition, issues found, or special notes"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Any additional information about the returned asset
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting || selectedAssets.length === 0} className="flex-1">
                  {isSubmitting ? "Checking In..." : `Check In ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/assets")}>
                  Cancel
                </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
