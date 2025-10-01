"use client"

import { useState } from "react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { DataManager, Asset } from "@/lib/lists-data"
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

// Get available assets from DataManager
const getAvailableAssets = () => {
  const dataManager = DataManager.getInstance()
  return dataManager.getAssets().filter(asset => asset.status === "Available")
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
  sendEmail: z.boolean(),
  emailAddress: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [assetIdInput, setAssetIdInput] = useState("")
  const [assignToInput, setAssignToInput] = useState("")
  const [showAssignToSuggestions, setShowAssignToSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, { name: string; email: string; department: string }>>({})
  const [showSelectAssets, setShowSelectAssets] = useState(false)

  // Load available assets on component mount
  React.useEffect(() => {
    const assets = getAvailableAssets()
    setAvailableAssets(assets)
  }, [])

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      assignedTo: "",
      checkoutType: "person",
      site: "",
      location: "",
      department: "",
      checkoutNotes: "",
      sendEmail: false,
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

  const addAssetById = () => {
    if (!assetIdInput.trim()) return

    const asset = availableAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (!asset) {
      toast.error("Asset not found", {
        description: `No available asset found with ID: ${assetIdInput}`,
      })
      return
    }

    if (selectedAssets.find(a => a.id === asset.id)) {
      toast.error("Asset already added", {
        description: `Asset ${asset.id} is already in the list`,
      })
      return
    }

    setSelectedAssets(prev => [...prev, asset])
    setAssetIdInput("")
    toast.success("Asset added", {
      description: `${asset.name} has been added to the checkout list`,
    })
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
      const dataManager = DataManager.getInstance()
      let successCount = 0
      let failedCount = 0
      
      // Update each selected asset
      for (const asset of selectedAssets) {
        const updated = dataManager.updateAsset(asset.id, {
          status: "In Use",
          assignedTo: data.assignedTo,
          location: data.location || asset.location,
          department: data.department || asset.department,
          notes: data.checkoutNotes
        })
        
        if (updated) {
          successCount++
        } else {
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
          description: "No assets could be updated. They may be read-only imported assets.",
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
                    <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                    <h1 className="text-3xl font-bold tracking-tight">Check Out Asset</h1>
                  </div>
                </div>
                <p className="text-muted-foreground ml-6">
                  Assign an available asset to an employee, customer, or department
                </p>
              </div>
            </div>

            {/* Check Out Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Total Checked Out</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">156</div>
                  <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Assets currently checked out
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-110 transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Available</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">89</div>
                  <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">
                    Assets ready for checkout
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 group-hover:scale-110 transition-all duration-300">
                    <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">This Month</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">23</div>
                  <p className="text-xs text-muted-foreground group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">
                    Checkouts this month
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
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">₱2.4M</div>
                  <p className="text-xs text-muted-foreground group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Value of checked out assets
                  </p>
                </CardContent>
              </Card>
            </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Asset Checkout Form
          </CardTitle>
          <CardDescription>
            Fill out the form below to check out an asset to someone
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
                    Select the assets you want to check out
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Add Assets to Checkout</FormLabel>
                      <FormDescription>
                        Type asset ID and press Enter or click Add to add assets to the checkout list
                      </FormDescription>
                    </div>
                    
                    {/* Asset ID Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter Asset ID (e.g., AST-001)"
                        value={assetIdInput}
                        onChange={(e) => setAssetIdInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addAssetById()
                          }
                        }}
                      />
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
                        <ScrollArea className="max-h-40">
                          <div className="space-y-2 pr-4">
                            {selectedAssets.map((asset) => (
                              <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div className="flex-1">
                                  <div className="font-medium">{asset.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {asset.id} • {asset.category} • ₱{asset.value.toLocaleString()}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAsset(asset.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Information */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Assignment Information
                  </CardTitle>
                  <CardDescription>
                    Specify who the assets will be assigned to
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
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
                                className="text-yellow-500"
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
                                className="text-yellow-500"
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
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                                  <ScrollArea className="max-h-60">
                                    <div className="p-1">
                                      {Object.entries(filteredPersons).map(([name, person]) => (
                                        <button
                                          key={name}
                                          type="button"
                                          onClick={() => selectPerson(name)}
                                          className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                                        >
                                          <div className="font-medium">{person.name}</div>
                                          <div className="text-sm text-muted-foreground">
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
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
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
                </CardContent>
              </Card>

              {/* Checkout Details */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Checkout Details
                  </CardTitle>
                  <CardDescription>
                    Set the checkout and return dates
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
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
                          <FormDescription>
                            When the asset is expected to be returned
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Additional Information
                  </CardTitle>
                  <CardDescription>
                    Optionally change site, location and department of assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
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

                      {/* Send Email */}
                      <FormField
                        control={form.control}
                        name="sendEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Send Email</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                </CardContent>
              </Card>


              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting || selectedAssets.length === 0} className="flex-1">
                  {isSubmitting ? "Checking Out..." : `Check Out ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/assets")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
