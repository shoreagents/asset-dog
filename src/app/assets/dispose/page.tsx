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
import { CalendarIcon, ArrowLeft, Trash2, Plus, X, Package, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Get available assets for disposal (exclude already disposed assets)
const getAvailableAssets = (assets: any[]) => {
  return assets.filter(asset => 
    asset.status !== "Dispose" && 
    asset.status !== "Maintenance"
  )
}

// Form validation schema
const disposeFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  disposalDate: z.date({
    message: "Disposal date is required",
  }),
  disposalMethod: z.enum(["sold", "donated", "scrapped", "recycled", "destroyed", "other"], {
    message: "Please select disposal method",
  }),
  disposalReason: z.string().min(1, "Disposal reason is required"),
  disposalValue: z.number().min(0, "Disposal value must be positive"),
  buyerRecipient: z.string().optional(),
  disposalLocation: z.string().optional(),
  disposalCertificate: z.string().optional(),
  notes: z.string().optional(),
})

type DisposeFormValues = z.infer<typeof disposeFormSchema>

export default function DisposeAssetPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")

  // Get real data
  const availableAssets = getAvailableAssets(assets)

  const form = useForm<DisposeFormValues>({
    resolver: zodResolver(disposeFormSchema),
    defaultValues: {
      assetIds: [],
      disposalDate: new Date(),
      disposalMethod: "sold",
      disposalReason: "",
      disposalValue: 0,
      buyerRecipient: "",
      disposalLocation: "",
      disposalCertificate: "",
      notes: "",
    },
  })

  const disposalMethod = form.watch("disposalMethod")

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

  // Calculate total asset value
  const getTotalAssetValue = () => {
    return getSelectedAssetDetails().reduce((sum, asset) => sum + (asset!.value || 0), 0)
  }

  const onSubmit = async (data: DisposeFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please add at least one asset to dispose",
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
          const disposalNote = `[DISPOSE ${format(data.disposalDate, "yyyy-MM-dd")}] Method: ${data.disposalMethod} | Reason: ${data.disposalReason} | Value: $${data.disposalValue}${data.buyerRecipient ? ` | ${disposalMethod === "sold" ? "Buyer" : "Recipient"}: ${data.buyerRecipient}` : ''}${data.disposalLocation ? ` | Location: ${data.disposalLocation}` : ''}${data.disposalCertificate ? ` | Certificate: ${data.disposalCertificate}` : ''}${data.notes ? ` | Notes: ${data.notes}` : ''}`
          
          const updateData = {
            status: "Dispose" as const,
            notes: disposalNote
          }
          
          const result = await updateAssetMutation.mutateAsync({ id: assetId, updates: updateData })
          if (result.success) {
            successCount++
          } else {
            failedCount++
          }
        } catch (error) {
          console.error(`Failed to dispose asset ${assetId}:`, error)
          failedCount++
        }
      }

      if (successCount > 0) {
        const totalValue = getSelectedAssetDetails().reduce((sum, asset) => sum + (asset!.value || 0), 0)
        toast.success(`Successfully disposed ${successCount} asset${successCount !== 1 ? 's' : ''}`, {
          description: `Total value: ₱${totalValue.toLocaleString()}${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
        })
        
        // Redirect to assets page after successful disposal
        setTimeout(() => {
          router.push("/assets")
        }, 1500)
      } else {
        toast.error("Failed to dispose assets", {
          description: "No assets could be disposed. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error disposing assets:", error)
      toast.error("Failed to dispose assets", {
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
                  <BreadcrumbPage>Dispose Asset</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Dispose Asset */}
        <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>

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
                  <div className="h-8 w-1 bg-red-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Dispose Asset</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Mark assets as disposed (sold, donated, scrapped, etc.) and remove from active inventory
              </p>
            </div>
          </div>

          {/* Dispose Asset Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="group hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors duration-200">
                  <Package className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">Available Assets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200">
                  {availableAssets.length}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200">
                  Assets available for disposal
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors duration-200">
                  <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">Total Asset Value</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-200">
                  ₱{(availableAssets.reduce((sum, asset) => sum + (asset.value || 0), 0)).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-200">
                  Combined value of available assets
                </p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assets from database...</p>
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
              {/* Asset Selection */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Asset Selection
                  </CardTitle>
                  <CardDescription>
                    Select the assets you want to dispose of
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Assets</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search by Asset ID or Name..."
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
                                    {asset.category || 'Uncategorized'} • {asset.location || 'No location'} • ₱{asset.value?.toLocaleString() || '0'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {asset.purchaseDate ? `Purchased: ${format(new Date(asset.purchaseDate), "MMM dd, yyyy")}` : 'No purchase date'}
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
                      <Label>Selected Assets for Disposal</Label>
                      <div className="flex items-center gap-2">
                        {selectedAssets.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
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
                      <p className="text-muted-foreground text-sm">No assets selected - search and click to add assets</p>
                    ) : (
                      <div className="space-y-2">
                        {getSelectedAssetDetails().map((asset) => (
                          <div key={asset!.id} className="flex items-center justify-between p-3 border rounded-md border-destructive/20 bg-destructive/5">
                            <div>
                              <div className="font-medium">{asset!.id} - {asset!.name || 'Unnamed Asset'}</div>
                              <div className="text-sm text-muted-foreground">
                                {asset!.category || 'Uncategorized'} • {asset!.location || 'No location'} • ₱{asset!.value?.toLocaleString() || '0'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {asset!.purchaseDate ? `Purchased: ${format(new Date(asset!.purchaseDate), "MMM dd, yyyy")}` : 'No purchase date'}
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
                        <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                          <div className="font-medium text-destructive">Total Asset Value: ₱{getTotalAssetValue().toLocaleString()}</div>
                          <div className="text-sm text-destructive/70">These assets will be removed from inventory</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Disposal Information */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Disposal Information
                  </CardTitle>
                  <CardDescription>
                    Record the disposal method, date, and reason
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="disposalDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Disposal Date</FormLabel>
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
                      name="disposalMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disposal Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select disposal method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sold">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-500" />
                                  Sold - Asset was sold to a buyer
                                </div>
                              </SelectItem>
                              <SelectItem value="donated">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                  Donated - Asset was donated to charity/organization
                                </div>
                              </SelectItem>
                              <SelectItem value="scrapped">
                                <div className="flex items-center gap-2">
                                  <Trash2 className="h-4 w-4 text-orange-500" />
                                  Scrapped - Asset was scrapped for parts/materials
                                </div>
                              </SelectItem>
                              <SelectItem value="recycled">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Recycled - Asset was recycled for materials
                                </div>
                              </SelectItem>
                              <SelectItem value="destroyed">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  Destroyed - Asset was destroyed (security reasons)
                                </div>
                              </SelectItem>
                              <SelectItem value="other">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                                  Other - Other disposal method
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="disposalReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disposal Reason</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain why these assets are being disposed of..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed reason for disposing of these assets
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Disposal Details */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Disposal Details
                  </CardTitle>
                  <CardDescription>
                    Record financial and recipient information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="disposalValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disposal Value ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Amount received or value of disposal
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buyerRecipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {disposalMethod === "sold" ? "Buyer" : 
                             disposalMethod === "donated" ? "Recipient Organization" : 
                             "Recipient/Contact"}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={
                                disposalMethod === "sold" ? "Enter buyer name" :
                                disposalMethod === "donated" ? "Enter organization name" :
                                "Enter recipient/contact name"
                              } 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="disposalLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disposal Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Where was the asset disposed?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Location where disposal took place
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="disposalCertificate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disposal Certificate/Reference</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Certificate number or reference" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Official certificate or reference number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                  <CardDescription>
                    Any additional information about the disposal
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
                            placeholder="Add any additional notes about the disposal..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any additional information about this disposal
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
                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Disposing Assets...
                    </>
                  ) : (
                    "Dispose Assets"
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
