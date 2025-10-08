"use client"

import { useState } from "react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Asset } from "@/lib/lists-data"
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
import { CalendarIcon, ArrowLeft, UserCheck, Plus, X, Package, DollarSign, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Get available assets from useAssets hook (exclude maintenance and disposed assets)
const getAvailableAssets = (assets: Asset[]) => {
  return assets.filter(asset => 
    asset.status === "Available" || 
    asset.status === "Check Out" || 
    asset.status === "Reserve"
  ).filter(asset => 
    asset.status !== "Maintenance" && 
    asset.status !== "Dispose"
  )
}

// Mock persons data
const mockPersons = {
  "John Smith": { name: "John Smith", email: "john@company.com", department: "IT" },
  "Sarah Johnson": { name: "Sarah Johnson", email: "sarah@company.com", department: "Marketing" },
  "Mike Wilson": { name: "Mike Wilson", email: "mike@company.com", department: "Sales" },
  "Lisa Brown": { name: "Lisa Brown", email: "lisa@company.com", department: "HR" },
  "David Lee": { name: "David Lee", email: "david@company.com", department: "Finance" },
}

const checkoutSchema = z.object({
  assignedTo: z.string().min(1, "Please select who to assign to"),
  checkoutDate: z.date({
    message: "Checkout date is required",
  }),
  dueDate: z.date({
    message: "Due date is required",
  }),
  checkoutType: z.enum(["person", "site"]),
  site: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  checkoutNotes: z.string().optional(),
  emailAddress: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [assetIdInput, setAssetIdInput] = useState("")
  const [assignToInput, setAssignToInput] = useState("")
  const [showAssignToSuggestions, setShowAssignToSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, { name: string; email: string; department: string }>>({})
  const [showSelectAssets, setShowSelectAssets] = useState(false)
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])

  // Get available assets from the loaded assets
  const availableAssets = getAvailableAssets(assets)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      assignedTo: "",
      checkoutType: "person",
      site: "",
      location: "",
      department: "",
      checkoutNotes: "",
      emailAddress: "",
    },
  })

  // Filter persons based on search input
  const handleAssignToSearch = (value: string) => {
    setAssignToInput(value)
    form.setValue("assignedTo", value)
    
    if (value.length > 0) {
      const filtered = Object.entries(mockPersons).filter(([name, person]) =>
        name.toLowerCase().includes(value.toLowerCase()) ||
        person.email.toLowerCase().includes(value.toLowerCase()) ||
        person.department.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredPersons(Object.fromEntries(filtered))
      setShowAssignToSuggestions(true)
    } else {
      setFilteredPersons({})
      setShowAssignToSuggestions(false)
    }
  }

  const selectPerson = (personName: string) => {
    setAssignToInput(personName)
    form.setValue("assignedTo", personName)
    setShowAssignToSuggestions(false)
  }

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

  const selectAsset = (asset: Asset) => {
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
      description: `${asset.name} has been added to the checkout list`,
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

  const toggleAssetSelection = (asset: Asset) => {
    setSelectedAssets(prev => {
      const isSelected = prev.find(a => a.id === asset.id)
      if (isSelected) {
        return prev.filter(a => a.id !== asset.id)
      } else {
        return [...prev, asset]
      }
    })
  }

  const removeAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId))
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please add at least one asset to checkout",
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
          await updateAssetMutation.mutateAsync({ id: asset.id, updates: {
            status: "Check Out",
            assignedTo: data.assignedTo,
            location: data.location || asset.location,
            department: data.department || asset.department,
            notes: data.checkoutNotes
          }})
          successCount++
        } catch (error) {
          console.error(`Failed to update asset ${asset.id}:`, error)
          failedCount++
        }
      }
      
      if (successCount > 0) {
        toast.success("Assets checked out successfully!", {
          description: `${successCount} asset(s) assigned to ${data.assignedTo}.${failedCount > 0 ? ` ${failedCount} asset(s) could not be updated.` : ''}`,
        })
        
        // Redirect back to assets list
        router.push("/assets")
      } else {
        toast.error("Failed to check out assets", {
          description: "No assets could be updated. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error checking out assets:", error)
      toast.error("Failed to checkout assets", {
        description: "Please try again or contact support if the issue persists.",
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
                  <BreadcrumbPage>Check Out Asset</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Check Out */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>

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
                  <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Check Out Asset</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Assign an available asset to a user
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

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Available Assets</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{availableAssets.length}</div>
                  <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Ready for checkout
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-110 transition-all duration-300">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Check Out</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">{assets.filter(a => a.status === "Check Out").length}</div>
                  <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">
                    Currently in use
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 group-hover:scale-110 transition-all duration-300">
                    <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Total Value</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">₱{assets.filter(a => a.status === "Check Out").reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Value of checked out assets
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Asset Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Asset Selection</CardTitle>
                    <CardDescription>
                      Select the assets you want to check out
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Add Assets to Checkout</FormLabel>
                        <FormDescription>
                          Type asset ID and press Enter or click Add to add assets to the checkout list
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
                          <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg">
                            <ScrollArea className="h-60">
                              <div className="p-1">
                                {filteredAssets.map((asset) => (
                                  <button
                                    key={asset.id}
                                    type="button"
                                    onClick={() => selectAsset(asset)}
                                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm border-b border-border/30 last:border-b-0 bg-card"
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
                          <div className="border rounded-lg bg-muted/20 p-2">
                            <ScrollArea className="h-48">
                              <div className="space-y-2 pr-4">
                                {selectedAssets.map((asset) => (
                                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-background shadow-sm">
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

                {/* Assignment & Checkout Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assignment & Checkout Details</CardTitle>
                    <CardDescription>
                      Specify who the assets will be assigned to and set the checkout dates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Assignment Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-medium">Assignment</h3>
                        </div>
                        
                        {/* Check-out to Radio Buttons */}
                        <FormField
                          control={form.control}
                          name="checkoutType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Check-out to</FormLabel>
                              <div className="flex gap-6">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="person"
                                    value="person"
                                    checked={field.value === "person"}
                                    onChange={() => field.onChange("person")}
                                    className="text-blue-500"
                                  />
                                  <label htmlFor="person" className="text-sm font-medium">Person</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="site"
                                    value="site"
                                    checked={field.value === "site"}
                                    onChange={() => field.onChange("site")}
                                    className="text-blue-500"
                                  />
                                  <label htmlFor="site" className="text-sm font-medium">Site / Location</label>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Assign to */}
                        <FormField
                          control={form.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assign to *</FormLabel>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    placeholder="Search by name, email, or department..."
                                    value={assignToInput}
                                    onChange={(e) => handleAssignToSearch(e.target.value)}
                                    onFocus={() => {
                                      if (assignToInput.length > 0) {
                                        setShowAssignToSuggestions(true)
                                      }
                                    }}
                                    onBlur={() => {
                                      setTimeout(() => setShowAssignToSuggestions(false), 200)
                                    }}
                                  />
                                  
                                  {/* Suggestions Dropdown */}
                                  {showAssignToSuggestions && Object.keys(filteredPersons).length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                                      <ScrollArea className="h-60">
                                        <div className="p-1">
                                          {Object.entries(filteredPersons).map(([name, person]) => (
                                            <button
                                              key={name}
                                              type="button"
                                              onClick={() => selectPerson(name)}
                                              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm border-b border-border/30 last:border-b-0"
                                            >
                                              <div className="font-medium text-sm">{person.name}</div>
                                              <div className="text-xs text-muted-foreground">
                                                {person.department} • {person.email}
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  )}
                                  
                                  {/* No results message */}
                                  {showAssignToSuggestions && Object.keys(filteredPersons).length === 0 && assignToInput.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                                      No results found for &quot;{assignToInput}&quot;
                                    </div>
                                  )}
                                </div>
                                <Button type="button" variant="outline" size="sm">
                                  <Plus className="h-4 w-4 mr-1" />
                                  New
                                </Button>
                              </div>
                              {form.formState.errors.assignedTo && (
                                <p className="text-sm text-destructive">{form.formState.errors.assignedTo.message}</p>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Divider */}
                      <Separator />

                      {/* Checkout Dates Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-medium">Checkout Dates</h3>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Checkout Date */}
                          <FormField
                            control={form.control}
                            name="checkoutDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Check-out Date</FormLabel>
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
                                          format(field.value, "dd/MM/yyyy")
                                        ) : (
                                          <span>01/10/2025</span>
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
                                  When the asset is being checked out
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Due Date */}
                          <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Due Date</FormLabel>
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
                                      disabled={(date) =>
                                        date < new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>


                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                    <CardDescription>
                      Optionally change site, location and department of assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Site */}
                      <FormField
                        control={form.control}
                        name="site"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Site" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="HAULER">HAULER</SelectItem>
                                <SelectItem value="MAIN OFFICE">MAIN OFFICE</SelectItem>
                                <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Location */}
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="HAULER">HAULER</SelectItem>
                                <SelectItem value="OFFICE FLOOR 1">OFFICE FLOOR 1</SelectItem>
                                <SelectItem value="OFFICE FLOOR 2">OFFICE FLOOR 2</SelectItem>
                                <SelectItem value="WAREHOUSE A">WAREHOUSE A</SelectItem>
                                <SelectItem value="WAREHOUSE B">WAREHOUSE B</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Department */}
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="IT Department">IT Department</SelectItem>
                                <SelectItem value="Human Resources">Human Resources</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Facilities">Facilities</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email Address */}
                      <FormField
                        control={form.control}
                        name="emailAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Email Address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                      {/* Check-out Notes */}
                      <FormField
                        control={form.control}
                        name="checkoutNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-out Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter notes about this checkout..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </div>
                </CardContent>
              </Card>


                {/* Submit Button */}
                <div className="flex justify-center gap-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => router.push("/assets")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || selectedAssets.length === 0} className="min-w-[140px]">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Checking Out...
                      </>
                    ) : (
                      `Check Out ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`
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
