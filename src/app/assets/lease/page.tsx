"use client"

import { useState } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CalendarIcon, ArrowLeft, Calendar as CalendarIconComponent, Plus, X, Package, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { setupDataManager } from "@/lib/setup-data"

// Get available assets from useAssets hook (exclude maintenance and disposed assets)
const getAvailableAssets = (assets: any[]) => {
  return assets.filter(asset => 
    asset.status === "Available" || 
    asset.status === "Check Out" || 
    asset.status === "Reserve"
  ).filter(asset => 
    asset.status !== "Maintenance" && 
    asset.status !== "Dispose"
  )
}

// Lease form schema
const leaseFormSchema = z.object({
  leaseBegins: z.date(),
  lessee: z.string().min(1, "Please select a customer"),
  leaseExpires: z.date().optional(),
  leaseNotes: z.string().optional(),
})

type LeaseFormValues = z.infer<typeof leaseFormSchema>

export default function LeaseAssetPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Asset selection states
  const [selectedAssets, setSelectedAssets] = useState<any[]>([])
  const [assetIdInput, setAssetIdInput] = useState("")
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)
  
  // Customer selection states
  const [customerInput, setCustomerInput] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  
  // Get real customer data with fallback
  const customers = setupDataManager.getCustomers() || []

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseFormSchema),
    defaultValues: {
      leaseBegins: undefined,
      lessee: "",
      leaseExpires: undefined,
      leaseNotes: "",
    },
  })

  const availableAssets = getAvailableAssets(assets)
  
  // Calculate assets leased today (based on notes containing today's date)
  const today = format(new Date(), "yyyy-MM-dd")
  const assetsLeasedToday = assets.filter(asset => 
    asset.notes?.includes(`[LEASE ${today}]`)
  ).length

  // Handle asset ID input with autocomplete
  const handleAssetIdInput = (value: string) => {
    setAssetIdInput(value)
    
    if (value.length > 0) {
      const filtered = availableAssets.filter(asset =>
        asset.id.toLowerCase().includes(value.toLowerCase()) ||
        (asset.name || '').toLowerCase().includes(value.toLowerCase())
      )
      setFilteredAssets(filtered)
      setShowAssetSuggestions(true)
    } else {
      setFilteredAssets([])
      setShowAssetSuggestions(false)
    }
  }

  const selectAsset = (asset: any) => {
    if (selectedAssets.find(a => a.id === asset.id)) {
      toast.error("Asset already added", {
        description: `Asset ${asset.id} is already in the list`,
      })
      return
    }

    setSelectedAssets(prev => [...prev, asset])
    setAssetIdInput("")
    setShowAssetSuggestions(false)
    setFilteredAssets([])
    toast.success("Asset added", {
      description: `${asset.name || asset.id} has been added to the lease list`,
    })
  }

  const addAssetById = () => {
    if (!assetIdInput.trim()) return

    const asset = availableAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (!asset) {
      toast.error("Asset not found", {
        description: `No available asset found with ID: ${assetIdInput}`,
      })
      return
    }

    selectAsset(asset)
  }

  const removeAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId))
  }

  // Handle customer search with autocomplete
  const handleCustomerSearch = (value: string) => {
    setCustomerInput(value)
    form.setValue("lessee", value)
    
    if (value.length > 0) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.email?.toLowerCase().includes(value.toLowerCase()) ||
        customer.contactPerson?.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredCustomers(filtered)
      setShowCustomerSuggestions(true)
    } else {
      setFilteredCustomers([])
      setShowCustomerSuggestions(false)
    }
  }

  const selectCustomer = (customer: any) => {
    setCustomerInput(customer.name)
    form.setValue("lessee", customer.name)
    setShowCustomerSuggestions(false)
  }

  const onSubmit = async (data: LeaseFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please add at least one asset to lease",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      let successCount = 0
      let failedCount = 0
      
      // Update each selected asset
      for (const asset of selectedAssets) {
        try {
          const leaseNote = `[LEASE ${format(data.leaseBegins, "yyyy-MM-dd")}] Customer: ${data.lessee}${data.leaseExpires ? ` | Expires: ${format(data.leaseExpires, "yyyy-MM-dd")}` : ''}${data.leaseNotes ? ` | Notes: ${data.leaseNotes}` : ''}`
          
          const updateData = {
            status: "Lease" as const,
            notes: leaseNote
          }
          
          const result = await updateAssetMutation.mutateAsync({ id: asset.id, updates: updateData })
          if (result.success) {
            successCount++
          } else {
            failedCount++
          }
        } catch (error) {
          console.error(`Failed to lease asset ${asset.id}:`, error)
          failedCount++
        }
      }

      if (successCount > 0) {
        const totalValue = selectedAssets.reduce((sum, asset) => sum + (asset.value || 0), 0)
        toast.success(`Successfully leased ${successCount} asset${successCount !== 1 ? 's' : ''}`, {
          description: `Total value: ₱${totalValue.toLocaleString()}${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
        })
        
        // Redirect to assets page after successful lease
        setTimeout(() => {
    router.push("/assets")
        }, 1500)
      } else {
        toast.error("Failed to lease assets", {
          description: "No assets could be leased. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error leasing assets:", error)
      toast.error("Failed to lease assets", {
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
                  <BreadcrumbPage>Lease Asset</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Lease Asset */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>

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
                  <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Lease Asset</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Lease assets to external customers or third parties
              </p>
            </div>
          </div>

          {/* Lease Asset Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Available Assets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                  {availableAssets.length}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                  Assets ready for leasing
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-200">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">Leased Today</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">
                  {assetsLeasedToday}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-200">
                  Assets leased today
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
            <>
            {/* Lease Asset Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIconComponent className="h-5 w-5" />
                  Lease Asset Form
                </CardTitle>
                <CardDescription>
                  Fill out the form below to lease assets to external customers
                </CardDescription>
              </CardHeader>
              <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
              {/* Asset Selection */}
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                    Asset Selection
                  </CardTitle>
                  <CardDescription>
                          Select the assets you want to lease
                  </CardDescription>
                </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <FormLabel>Add Assets to Lease</FormLabel>
                            <FormDescription>
                              Type asset ID and press Enter or click Add to add assets to the lease list
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
                                  No available assets found for &quot;{assetIdInput}&quot;
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
                                          <div className="font-medium truncate">{asset.name || asset.id}</div>
                                          <div className="text-sm text-muted-foreground truncate">
                                            {asset.id} • {asset.category || 'Uncategorized'} • ₱{asset.value.toLocaleString()}
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

                    {/* Lease Configuration */}
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                          Lease Configuration
                  </CardTitle>
                  <CardDescription>
                          Configure lease terms and customer details
                  </CardDescription>
                </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Left Column */}
                          <div className="space-y-4">
                    <FormField
                      control={form.control}
                              name="leaseBegins"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                                  <FormLabel>Lease Begins</FormLabel>
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
                              name="lessee"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Leasing Customer</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        placeholder="Search for a customer..."
                                        value={customerInput}
                                        onChange={(e) => handleCustomerSearch(e.target.value)}
                                        onFocus={() => {
                                          if (customerInput.length > 0) {
                                            setShowCustomerSuggestions(true)
                                          }
                                        }}
                                        onBlur={() => {
                                          setTimeout(() => setShowCustomerSuggestions(false), 200)
                                        }}
                                      />
                                    </FormControl>
                                    
                                    {/* Customer Suggestions Dropdown */}
                                    {showCustomerSuggestions && filteredCustomers.length > 0 && (
                                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                                        <ScrollArea className="h-60">
                                          <div className="p-1">
                                            {filteredCustomers.map((customer) => (
                                              <button
                                                key={customer.id}
                                                type="button"
                                                onClick={() => selectCustomer(customer)}
                                                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm border-b border-border/30 last:border-b-0"
                                              >
                                                <div className="font-medium text-sm">{customer.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  {customer.type} • {customer.email} • {customer.contactPerson || 'No contact person'}
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        </ScrollArea>
                                      </div>
                                    )}
                                    
                                    {/* No results message */}
                                    {showCustomerSuggestions && filteredCustomers.length === 0 && customerInput.length > 0 && (
                                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                                        No customers found for &quot;{customerInput}&quot;
                                      </div>
                                    )}
                                  </div>
                                  <FormDescription>Search and select a customer for the lease</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="leaseExpires"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                                  <FormLabel>Lease Expires (Optional)</FormLabel>
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
                                            <span>Pick a date (optional)</span>
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
                              name="leaseNotes"
                      render={({ field }) => (
                        <FormItem>
                                  <FormLabel>Lease Notes</FormLabel>
                          <FormControl>
                                    <Textarea placeholder="Describe lease conditions, terms, or special notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                            <div className="space-y-2">
                              <FormLabel>Send Email</FormLabel>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="sendEmail"
                                  disabled
                                  className="h-4 w-4"
                                />
                                <label htmlFor="sendEmail" className="text-sm text-muted-foreground">
                                  Send lease confirmation email to lessee
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-center gap-4 pt-6">
                          <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                          <Button type="submit" disabled={isSubmitting || selectedAssets.length === 0}>
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Leasing...
                              </>
                            ) : (
                              <>
                                <CalendarIconComponent className="h-4 w-4 mr-2" />
                                Lease {selectedAssets.length} Asset{selectedAssets.length !== 1 ? 's' : ''}
                              </>
                            )}
                </Button>
              </div>
                      </CardContent>
                    </Card>
            </form>
          </Form>
              </CardContent>
            </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}