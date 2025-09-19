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
import { CalendarIcon, ArrowLeft, UserMinus, Plus, X, Package } from "lucide-react"
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
const mockCheckedOutAssets = [
  { 
    id: "AST-001", 
    name: "MacBook Pro 16\"", 
    category: "IT Equipment", 
    assignedTo: "John Smith",
    checkoutDate: "2024-01-15",
    expectedReturnDate: "2024-02-15",
    location: "John's Office",
    value: 2500 
  },
  { 
    id: "AST-002", 
    name: "Dell Monitor 27\"", 
    category: "IT Equipment", 
    assignedTo: "Sarah Johnson",
    checkoutDate: "2024-01-20",
    expectedReturnDate: "2024-02-20",
    location: "Sarah's Desk",
    value: 300 
  },
  { 
    id: "AST-003", 
    name: "Office Chair", 
    category: "Furniture", 
    assignedTo: "Mike Wilson",
    checkoutDate: "2024-01-10",
    expectedReturnDate: "2024-02-10",
    location: "Mike's Office",
    value: 200 
  },
]

const checkinSchema = z.object({
  checkinDate: z.date({
    required_error: "Check-in date is required",
  }),
  condition: z.string().min(1, "Please select the asset condition"),
  location: z.string().min(1, "Please specify the return location"),
  notes: z.string().optional(),
})

type CheckinFormValues = z.infer<typeof checkinSchema>

export default function CheckinPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<typeof mockCheckedOutAssets>([])
  const [assetIdInput, setAssetIdInput] = useState("")

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

  const addAssetById = () => {
    if (!assetIdInput.trim()) return

    const asset = mockCheckedOutAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (!asset) {
      toast.error("Asset not found", {
        description: `No checked out asset found with ID: ${assetIdInput}`,
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
      description: `${asset.name} has been added to the check-in list`,
    })
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Check-in data:", { ...data, assets: selectedAssets })
      
      // Show success toast notification
      toast.success("Assets checked in successfully!", {
        description: `${selectedAssets.length} asset(s) have been returned to inventory.`,
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
                <h1 className="text-3xl font-bold">Check In Asset</h1>
              </div>
              <p className="text-muted-foreground">
                Return a checked out asset back to inventory
              </p>
            </div>
          </div>

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
                                  {asset.id} • Assigned to: {asset.assignedTo} • Expected return: {asset.expectedReturnDate}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
