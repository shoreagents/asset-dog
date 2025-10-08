"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { useUpdateAsset } from "@/hooks/use-assets-query"
import { setupDataManager } from "@/lib/setup-data"
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
import { CalendarIcon, ArrowLeft, ArrowLeftRight, Plus, X, Package, Building2, CheckCircle, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Get leased assets from real data
const getLeasedAssets = (assets: any[]) => {
  return assets.filter(asset => asset.status === "Lease")
}

// Get return locations from setup data
const getReturnLocations = () => {
  const locations = setupDataManager.getLocations()
  const sites = setupDataManager.getSites()
  
  // Convert to strings and combine locations and sites
  const allLocations: string[] = [
    ...locations.map(loc => loc.name),
    ...sites.map(site => site.name)
  ]
  
  // Add common return locations (only if they don't already exist)
  const commonLocations = [
    "IT Storage Room",
    "Main Office Reception",
    "Conference Room A",
    "Conference Room B",
    "Storage Room",
    "Warehouse",
    "Parking Garage",
    "Reception Area",
    "Break Room",
    "Server Room"
  ]
  
  // Only add locations that don't already exist
  commonLocations.forEach(location => {
    if (!allLocations.includes(location)) {
      allLocations.push(location)
    }
  })
  
  // Remove duplicates and return unique locations
  return [...new Set(allLocations)]
}

// Form validation schema
const leaseReturnFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  returnDate: z.date({
    message: "Return date is required",
  }),
  returnLocation: z.string().min(1, "Return location is required"),
  returnCondition: z.enum(["excellent", "good", "fair", "poor", "damaged"], {
    message: "Please select return condition",
  }),
  damageDescription: z.string().optional(),
  securityDepositRefund: z.number().min(0, "Security deposit refund must be positive"),
  finalPayment: z.number().min(0, "Final payment must be positive"),
  notes: z.string().optional(),
})

type LeaseReturnFormValues = z.infer<typeof leaseReturnFormSchema>

export default function LeaseReturnPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [locationSearch, setLocationSearch] = useState("")
  const [filteredLocations, setFilteredLocations] = useState<string[]>([])

  // Get real data
  const leasedAssets = getLeasedAssets(assets)
  const returnLocations = getReturnLocations()

  const form = useForm<LeaseReturnFormValues>({
    resolver: zodResolver(leaseReturnFormSchema),
    defaultValues: {
      assetIds: [],
      returnDate: new Date(),
      returnLocation: "",
      returnCondition: "excellent",
      damageDescription: "",
      securityDepositRefund: 0,
      finalPayment: 0,
      notes: "",
    },
  })

  const returnCondition = form.watch("returnCondition")

  // Filter assets based on search
  const filteredAssets = leasedAssets.filter(asset =>
    asset.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    (asset.name || '').toLowerCase().includes(assetSearch.toLowerCase()) ||
    (asset.notes || '').toLowerCase().includes(assetSearch.toLowerCase())
  )

  // Filter locations based on search
  const handleLocationSearch = (value: string) => {
    setLocationSearch(value)
    if (value.length > 0) {
      const filtered = returnLocations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredLocations(filtered)
    } else {
      setFilteredLocations([])
    }
  }

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
    return selectedAssets.map(id => leasedAssets.find(asset => asset.id === id)).filter(Boolean)
  }

  // Calculate total security deposit refund (based on asset value)
  const getTotalSecurityDepositRefund = () => {
    return getSelectedAssetDetails().reduce((sum, asset) => sum + ((asset!.value || 0) * 0.1), 0) // 10% of asset value as security deposit
  }

  const onSubmit = async (data: LeaseReturnFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please add at least one asset to return",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      let successCount = 0
      let failedCount = 0
      
      // Update each selected asset
      for (const assetId of selectedAssets) {
        try {
          const returnNote = `[LEASE RETURN ${format(data.returnDate, "yyyy-MM-dd")}] Returned to ${data.returnLocation} | Condition: ${data.returnCondition}${data.damageDescription ? ` | Damage: ${data.damageDescription}` : ''} | Security Deposit Refund: $${data.securityDepositRefund} | Final Payment: $${data.finalPayment}${data.notes ? ` | Notes: ${data.notes}` : ''}`
          
          const updateData = {
            status: "Available" as const,
            location: data.returnLocation,
            notes: returnNote
          }
          
          const result = await updateAssetMutation.mutateAsync({ id: assetId, updates: updateData })
          if (result.success) {
            successCount++
          } else {
            failedCount++
          }
        } catch (error) {
          console.error(`Failed to return asset ${assetId}:`, error)
          failedCount++
        }
      }

      if (successCount > 0) {
        const totalValue = getSelectedAssetDetails().reduce((sum, asset) => sum + (asset!.value || 0), 0)
        toast.success(`Successfully returned ${successCount} asset${successCount !== 1 ? 's' : ''}`, {
          description: `Total value: ₱${totalValue.toLocaleString()}${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
        })
        
        // Redirect to assets page after successful return
        setTimeout(() => {
          router.push("/assets")
        }, 1500)
      } else {
        toast.error("Failed to return assets", {
          description: "No assets could be returned. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error returning assets:", error)
      toast.error("Failed to return assets", {
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
                  <BreadcrumbPage>Lease Return</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Lease Return */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>

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
                  <div className="h-8 w-1 bg-cyan-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Lease Return</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Log the return of leased assets back into the system
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading leased assets from database...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <p className="text-red-600 font-medium">Failed to load assets</p>
                <p className="text-muted-foreground text-sm mt-2">{error instanceof Error ? error.message : "Failed to load assets"}</p>
              </div>
            </div>
          ) : (

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Leased Asset Selection */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Leased Asset Selection
                  </CardTitle>
                  <CardDescription>
                    Select the leased assets being returned
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Leased Assets</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search by Asset ID, Name, or Lessee..."
                        value={assetSearch}
                        onChange={(e) => setAssetSearch(e.target.value)}
                      />
                    </div>
                    {assetSearch && (
                      <div className="border rounded-md">
                        <ScrollArea className="max-h-48">
                          <div className="p-2">
                            {filteredAssets.map((asset) => (
                              <div
                                key={asset.id}
                                className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                                onClick={() => addAsset(asset.id)}
                              >
                                <div>
                                  <div className="font-medium">{asset.id} - {asset.name || 'Unnamed Asset'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {asset.category || 'Uncategorized'} • ₱{asset.value?.toLocaleString() || '0'} • {asset.location || 'No location'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {asset.notes ? `Lease details in notes` : 'No lease details available'}
                                  </div>
                                </div>
                                <Plus className="h-4 w-4" />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Selected Assets for Return</Label>
                      <div className="flex items-center gap-2">
                        {selectedAssets.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
                          </Badge>
                        )}
                        {selectedAssets.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssets([])
                              form.setValue("assetIds", [])
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>
                    {selectedAssets.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No assets selected - search and click to add leased assets</p>
                    ) : (
                      <div className="space-y-2">
                        {getSelectedAssetDetails().map((asset) => (
                          <div key={asset!.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <div className="font-medium">{asset!.id} - {asset!.name || 'Unnamed Asset'}</div>
                              <div className="text-sm text-muted-foreground">
                                {asset!.category || 'Uncategorized'} • ₱{asset!.value?.toLocaleString() || '0'} • {asset!.location || 'No location'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {asset!.notes ? `Lease details in notes` : 'No lease details available'}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAsset(asset!.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Return Information */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Return Information
                  </CardTitle>
                  <CardDescription>
                    Record the return date, location, and condition of assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="returnDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Return Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
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
                      name="returnLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Location</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                placeholder="Search return location..."
                                value={locationSearch}
                                onChange={(e) => handleLocationSearch(e.target.value)}
                              />
                              {locationSearch && filteredLocations.length > 0 && (
                                <div className="border rounded-md">
                                  <ScrollArea className="max-h-32">
                                    <div className="p-2">
                                      {filteredLocations.map((location) => (
                                        <div
                                          key={location}
                                          className="p-2 hover:bg-muted cursor-pointer"
                                          onClick={() => {
                                            field.onChange(location)
                                            setLocationSearch("")
                                          }}
                                        >
                                          {location}
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </div>
                              )}
                              {field.value && (
                                <div className="p-2 bg-muted rounded-md">
                                  {field.value}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="returnCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select return condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Excellent - Like new condition
                              </div>
                            </SelectItem>
                            <SelectItem value="good">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                Good - Minor wear, fully functional
                              </div>
                            </SelectItem>
                            <SelectItem value="fair">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                Fair - Some wear, functional
                              </div>
                            </SelectItem>
                            <SelectItem value="poor">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Poor - Significant wear, may need repair
                              </div>
                            </SelectItem>
                            <SelectItem value="damaged">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Damaged - Requires repair or replacement
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {returnCondition === "damaged" && (
                    <FormField
                      control={form.control}
                      name="damageDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Damage Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the damage in detail..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Detailed description of any damage found
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Financial Settlement */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Financial Settlement
                  </CardTitle>
                  <CardDescription>
                    Handle security deposit refunds and final payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="securityDepositRefund"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Deposit Refund ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Amount to refund from security deposit
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="finalPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Final Payment ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Any additional payment or charges
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {selectedAssets.length > 0 && (
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">Estimated Security Deposit Refund</div>
                      <div className="font-medium">${getTotalSecurityDepositRefund().toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Based on 2 months security deposit</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                  <CardDescription>
                    Any additional information about the return
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes about the return..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any additional information about this return
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Return...
                    </>
                  ) : (
                    "Process Return"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
