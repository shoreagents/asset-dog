"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
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
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CalendarIcon, ArrowLeft, UserCheck, Plus, X, Package } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Mock available assets data
const mockAvailableAssets = [
  { id: "AST-001", name: "MacBook Pro 16\"", category: "IT Equipment", location: "IT Storage Room", value: 2500 },
  { id: "AST-002", name: "Dell Monitor 27\"", category: "IT Equipment", location: "IT Storage Room", value: 300 },
  { id: "AST-003", name: "Office Chair", category: "Furniture", location: "Storage Room", value: 200 },
  { id: "AST-004", name: "Toyota Camry", category: "Vehicle", location: "Parking Garage", value: 28000 },
  { id: "AST-005", name: "Projector", category: "IT Equipment", location: "Conference Room", value: 800 },
]

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
    required_error: "Checkout date is required",
  }),
  expectedReturnDate: z.date({
    required_error: "Expected return date is required",
  }),
  checkoutReason: z.string().min(1, "Please provide a reason for checkout"),
  notes: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<typeof mockAvailableAssets>([])
  const [assetIdInput, setAssetIdInput] = useState("")
  const [assignToInput, setAssignToInput] = useState("")
  const [showAssignToSuggestions, setShowAssignToSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<typeof mockPersons>({})

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      assignedTo: "",
      checkoutReason: "",
      notes: "",
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

    const asset = mockAvailableAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Checkout data:", { ...data, assets: selectedAssets })
      
      // Show success toast notification
      toast.success("Assets checked out successfully!", {
        description: `${selectedAssets.length} asset(s) have been assigned to ${data.assignedTo}.`,
        duration: 4000,
      })
      
      // Redirect back to assets list
      router.push("/assets")
    } catch (error) {
      console.error("Error checking out assets:", error)
      toast.error("Failed to checkout assets", {
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
                  <BreadcrumbPage>Check Out Asset</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

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
                <h1 className="text-3xl font-bold">Check Out Asset</h1>
              </div>
              <p className="text-muted-foreground">
                Assign an available asset to an employee, customer, or department
              </p>
            </div>
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
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedAssets.map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                              <div className="flex-1">
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {asset.id} • {asset.category} • ${asset.value.toLocaleString()}
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
                  <div className="space-y-2">
                    <FormLabel>Assign To</FormLabel>
                    <FormDescription>
                      Search for an employee, customer, or department by name, email, or department
                    </FormDescription>
                    <div className="relative">
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
                          // Delay hiding suggestions to allow clicking on them
                          setTimeout(() => setShowAssignToSuggestions(false), 200)
                        }}
                      />
                      
                      {/* Suggestions Dropdown */}
                      {showAssignToSuggestions && Object.keys(filteredPersons).length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                      )}
                      
                      {/* No results message */}
                      {showAssignToSuggestions && Object.keys(filteredPersons).length === 0 && assignToInput.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                          No results found for "{assignToInput}"
                        </div>
                      )}
                    </div>
                    {form.formState.errors.assignedTo && (
                      <p className="text-sm text-destructive">{form.formState.errors.assignedTo.message}</p>
                    )}
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
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Checkout Date */}
                    <FormField
                      control={form.control}
                      name="checkoutDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Checkout Date</FormLabel>
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
                            When the asset is being checked out
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Expected Return Date */}
                    <FormField
                      control={form.control}
                      name="expectedReturnDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expected Return Date</FormLabel>
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
                    Provide reason and any additional notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Checkout Reason */}
                    <FormField
                      control={form.control}
                      name="checkoutReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Checkout</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Project work, Temporary assignment, Training purposes"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Explain why this asset is being checked out
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
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional information or special instructions"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Any extra details about this checkout
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
