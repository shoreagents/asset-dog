"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { getAllAssets } from "@/lib/centralized-assets"
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
import { CalendarIcon, ArrowLeft, Wrench, Plus, X, Package, DollarSign, Clock, CheckCircle, AlertTriangle, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Use centralized asset data
const mockAvailableAssets = getAllAssets()

// Mock maintenance providers
const mockProviders = {
  "TechFix Solutions": { 
    name: "TechFix Solutions", 
    contact: "John Smith", 
    email: "john@techfix.com", 
    phone: "+1-555-0123",
    specialty: "IT Equipment"
  },
  "AutoCare Center": { 
    name: "AutoCare Center", 
    contact: "Sarah Johnson", 
    email: "sarah@autocare.com", 
    phone: "+1-555-0456",
    specialty: "Vehicles"
  },
  "Office Maintenance Co": { 
    name: "Office Maintenance Co", 
    contact: "Mike Wilson", 
    email: "mike@officeco.com", 
    phone: "+1-555-0789",
    specialty: "Furniture & General"
  },
  "Internal IT Team": { 
    name: "Internal IT Team", 
    contact: "Lisa Brown", 
    email: "lisa@company.com", 
    phone: "+1-555-0321",
    specialty: "Internal IT Support"
  },
}

// Form validation schema
const maintenanceFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  maintenanceType: z.enum(["preventive", "corrective", "emergency", "upgrade", "inspection"], {
    message: "Please select maintenance type",
  }),
  maintenanceStatus: z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
    message: "Please select maintenance status",
  }),
  scheduledDate: z.date({
    message: "Scheduled date is required",
  }),
  completedDate: z.date().optional(),
  maintenanceProvider: z.string().min(1, "Maintenance provider is required"),
  maintenanceProviderContact: z.string().min(1, "Provider contact is required"),
  maintenanceProviderEmail: z.string().email("Valid email is required"),
  maintenanceProviderPhone: z.string().min(1, "Provider phone is required"),
  maintenanceDescription: z.string().min(1, "Maintenance description is required"),
  maintenanceCost: z.number().min(0, "Maintenance cost must be positive"),
  partsCost: z.number().min(0, "Parts cost must be positive"),
  laborCost: z.number().min(0, "Labor cost must be positive"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    message: "Please select priority",
  }),
  estimatedDuration: z.string().optional(),
  maintenanceNotes: z.string().optional(),
})

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>

export default function MaintenancePage() {
  const router = useRouter()
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [providerSearch, setProviderSearch] = useState("")
  const [filteredProviders, setFilteredProviders] = useState<Record<string, { name: string; contact: string; email: string; phone: string; specialties: string[] }>>({})

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      assetIds: [],
      maintenanceType: "preventive",
      maintenanceStatus: "scheduled",
      scheduledDate: new Date(),
      completedDate: undefined,
      maintenanceProvider: "",
      maintenanceProviderContact: "",
      maintenanceProviderEmail: "",
      maintenanceProviderPhone: "",
      maintenanceDescription: "",
      maintenanceCost: 0,
      partsCost: 0,
      laborCost: 0,
      priority: "medium",
      estimatedDuration: "",
      maintenanceNotes: "",
    },
  })

  const maintenanceStatus = form.watch("maintenanceStatus")
  const maintenanceType = form.watch("maintenanceType")

  // Filter assets based on search
  const filteredAssets = mockAvailableAssets.filter(asset =>
    asset.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.name.toLowerCase().includes(assetSearch.toLowerCase())
  )

  // Filter providers based on search
  const handleProviderSearch = (value: string) => {
    setProviderSearch(value)
    if (value.length > 0) {
      const filtered = Object.entries(mockProviders).filter(([name, provider]) =>
        name.toLowerCase().includes(value.toLowerCase()) ||
        provider.contact.toLowerCase().includes(value.toLowerCase()) ||
        provider.email.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredProviders(Object.fromEntries(filtered) as unknown as Record<string, { name: string; contact: string; email: string; phone: string; specialties: string[] }>)
    } else {
      setFilteredProviders({})
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
    return selectedAssets.map(id => mockAvailableAssets.find(asset => asset.id === id)).filter(Boolean)
  }

  const onSubmit = (data: MaintenanceFormValues) => {
    console.log("Maintenance Data:", data)
    toast.success("Maintenance record created successfully!")
    router.push("/assets")
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
                  <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Record scheduled or completed maintenance on assets. Track costs and service history.
              </p>
            </div>
          </div>

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
                    Select the assets requiring maintenance
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
                                  <div className="font-medium">{asset.id} - {asset.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {asset.category} • {asset.location} • ₱{asset.value.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Last Maintenance: {asset.lastMaintenance ? format(new Date(asset.lastMaintenance), "MMM dd, yyyy") : "Never"}
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
                      <Label>Selected Assets for Maintenance</Label>
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
                      <p className="text-muted-foreground text-sm">No assets selected - search and click to add assets</p>
                    ) : (
                      <div className="space-y-2">
                        {getSelectedAssetDetails().map((asset) => (
                          <div key={asset!.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <div className="font-medium">{asset!.id} - {asset!.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {asset!.category} • {asset!.location} • ₱{asset!.value.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last Maintenance: {asset!.lastMaintenance ? format(new Date(asset!.lastMaintenance), "MMM dd, yyyy") : "Never"}
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

              {/* Maintenance Information */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance Information
                  </CardTitle>
                  <CardDescription>
                    Define the type, status, and scheduling of maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="maintenanceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select maintenance type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="preventive">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  Preventive - Scheduled maintenance
                                </div>
                              </SelectItem>
                              <SelectItem value="corrective">
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-orange-500" />
                                  Corrective - Fix existing issues
                                </div>
                              </SelectItem>
                              <SelectItem value="emergency">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  Emergency - Urgent repairs
                                </div>
                              </SelectItem>
                              <SelectItem value="upgrade">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Upgrade - Enhance functionality
                                </div>
                              </SelectItem>
                              <SelectItem value="inspection">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-purple-500" />
                                  Inspection - Assessment only
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maintenanceStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="scheduled">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  Scheduled
                                </div>
                              </SelectItem>
                              <SelectItem value="in_progress">
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-orange-500" />
                                  In Progress
                                </div>
                              </SelectItem>
                              <SelectItem value="completed">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Completed
                                </div>
                              </SelectItem>
                              <SelectItem value="cancelled">
                                <div className="flex items-center gap-2">
                                  <X className="h-4 w-4 text-red-500" />
                                  Cancelled
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Scheduled Date</FormLabel>
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

                    {maintenanceStatus === "completed" && (
                      <FormField
                        control={form.control}
                        name="completedDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Completed Date</FormLabel>
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
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 2 hours, 1 day, 3 days" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated time to complete the maintenance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Maintenance Provider */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Maintenance Provider
                  </CardTitle>
                  <CardDescription>
                    Information about the maintenance service provider
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Provider</Label>
                    <Input
                      placeholder="Search by provider name, contact person, or email..."
                      value={providerSearch}
                      onChange={(e) => handleProviderSearch(e.target.value)}
                    />
                    {providerSearch && Object.keys(filteredProviders).length > 0 && (
                      <div className="border rounded-md">
                        <ScrollArea className="max-h-32">
                          <div className="p-2">
                            {Object.entries(filteredProviders).map(([name, provider]) => (
                              <div
                                key={name}
                                className="p-2 hover:bg-muted cursor-pointer"
                                onClick={() => {
                                  form.setValue("maintenanceProvider", provider.name)
                                  form.setValue("maintenanceProviderContact", provider.contact)
                                  form.setValue("maintenanceProviderEmail", provider.email)
                                  form.setValue("maintenanceProviderPhone", provider.phone)
                                  setProviderSearch("")
                                }}
                              >
                                <div className="font-medium">{provider.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {provider.contact} • {Array.isArray(provider.specialties) ? provider.specialties.join(', ') : provider.specialties}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maintenanceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter provider name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maintenanceProviderContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact person name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maintenanceProviderEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maintenanceProviderPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Details */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Maintenance Details & Costs
                  </CardTitle>
                  <CardDescription>
                    Describe the maintenance work and track costs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="maintenanceDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the maintenance work to be performed..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the maintenance work
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="maintenanceCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Total maintenance cost
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="partsCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parts Cost ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Cost of parts/materials
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="laborCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Labor Cost ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Cost of labor/service
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="maintenanceNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes about the maintenance..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any additional information about this maintenance
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
                <Button type="submit">
                  Create Maintenance Record
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
