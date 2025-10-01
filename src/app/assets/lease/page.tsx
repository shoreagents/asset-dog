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
import { CalendarIcon, ArrowLeft, ArrowLeftRight, Plus, X, Package, Building2, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Use centralized asset data
const mockAvailableAssets = getAllAssets()

// Mock lessee companies
const mockLessees = {
  "TechCorp Solutions": { 
    name: "TechCorp Solutions", 
    contact: "John Smith", 
    email: "john@techcorp.com", 
    phone: "+1-555-0123",
    address: "123 Tech Street, Silicon Valley, CA"
  },
  "Global Enterprises": { 
    name: "Global Enterprises", 
    contact: "Sarah Johnson", 
    email: "sarah@global.com", 
    phone: "+1-555-0456",
    address: "456 Business Ave, New York, NY"
  },
  "StartupXYZ": { 
    name: "StartupXYZ", 
    contact: "Mike Wilson", 
    email: "mike@startupxyz.com", 
    phone: "+1-555-0789",
    address: "789 Innovation Blvd, Austin, TX"
  },
  "Corporate Partners": { 
    name: "Corporate Partners", 
    contact: "Lisa Brown", 
    email: "lisa@corporate.com", 
    phone: "+1-555-0321",
    address: "321 Corporate Plaza, Chicago, IL"
  },
}

// Form validation schema
const leaseFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  lesseeName: z.string().min(1, "Lessee name is required"),
  lesseeContact: z.string().min(1, "Lessee contact person is required"),
  lesseeEmail: z.string().email("Valid email is required"),
  lesseePhone: z.string().min(1, "Phone number is required"),
  lesseeAddress: z.string().min(1, "Address is required"),
  leaseStartDate: z.date({
    message: "Lease start date is required",
  }),
  leaseEndDate: z.date({
    message: "Lease end date is required",
  }),
  monthlyRate: z.number().min(0, "Monthly rate must be positive"),
  securityDeposit: z.number().min(0, "Security deposit must be positive"),
  leaseTerms: z.string().min(1, "Lease terms are required"),
  specialConditions: z.string().optional(),
  notes: z.string().optional(),
})

type LeaseFormValues = z.infer<typeof leaseFormSchema>

export default function LeaseAssetPage() {
  const router = useRouter()
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [lesseeSearch, setLesseeSearch] = useState("")
  const [filteredLessees, setFilteredLessees] = useState<Record<string, { name: string; contact: string; email: string; phone: string }>>({})

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseFormSchema),
    defaultValues: {
      assetIds: [],
      lesseeName: "",
      lesseeContact: "",
      lesseeEmail: "",
      lesseePhone: "",
      lesseeAddress: "",
      leaseStartDate: new Date(),
      leaseEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      monthlyRate: 0,
      securityDeposit: 0,
      leaseTerms: "",
      specialConditions: "",
      notes: "",
    },
  })

  // Filter assets based on search
  const filteredAssets = mockAvailableAssets.filter(asset =>
    asset.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.name.toLowerCase().includes(assetSearch.toLowerCase())
  )

  // Filter lessees based on search
  const handleLesseeSearch = (value: string) => {
    setLesseeSearch(value)
    if (value.length > 0) {
      const filtered = Object.entries(mockLessees).filter(([name, lessee]) =>
        name.toLowerCase().includes(value.toLowerCase()) ||
        lessee.contact.toLowerCase().includes(value.toLowerCase()) ||
        lessee.email.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredLessees(Object.fromEntries(filtered))
    } else {
      setFilteredLessees({})
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

  // Calculate total asset value
  const getTotalAssetValue = () => {
    return getSelectedAssetDetails().reduce((sum, asset) => sum + asset!.value, 0)
  }

  const onSubmit = (data: LeaseFormValues) => {
    console.log("Lease Asset Data:", data)
    toast.success("Assets leased successfully!")
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
                Lease assets to third parties with duration, lessee, and conditions tracking
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
                    Select multiple assets you want to lease to third parties
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
                      <Label>Selected Assets</Label>
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
                        <div className="p-3 bg-muted rounded-md">
                          <div className="font-medium">Total Asset Value: ₱{getTotalAssetValue().toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lessee Information */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Lessee Information
                  </CardTitle>
                  <CardDescription>
                    Information about the company or individual leasing the assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Lessee</Label>
                    <Input
                      placeholder="Search by company name, contact person, or email..."
                      value={lesseeSearch}
                      onChange={(e) => handleLesseeSearch(e.target.value)}
                    />
                    {lesseeSearch && Object.keys(filteredLessees).length > 0 && (
                      <div className="border rounded-md">
                        <ScrollArea className="max-h-32">
                          <div className="p-2">
                            {Object.entries(filteredLessees).map(([name, lessee]) => (
                              <div
                                key={name}
                                className="p-2 hover:bg-muted cursor-pointer"
                                onClick={() => {
                                  form.setValue("lesseeName", lessee.name)
                                  form.setValue("lesseeContact", lessee.contact)
                                  form.setValue("lesseeEmail", lessee.email)
                                  form.setValue("lesseePhone", lessee.phone)
                                  form.setValue("lesseeAddress", (lessee as unknown as { address: string }).address)
                                  setLesseeSearch("")
                                }}
                              >
                                <div className="font-medium">{lessee.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {lessee.contact} • {lessee.email}
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
                      name="lesseeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter lessee name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lesseeContact"
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
                      name="lesseeEmail"
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
                      name="lesseePhone"
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

                  <FormField
                    control={form.control}
                    name="lesseeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter complete address..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Lease Terms */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Lease Terms & Duration
                  </CardTitle>
                  <CardDescription>
                    Define the lease duration, rates, and financial terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leaseStartDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Lease Start Date</FormLabel>
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
                      name="leaseEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Lease End Date</FormLabel>
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
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rate ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Monthly rental fee for all selected assets
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="securityDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Deposit ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Refundable security deposit amount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Lease Conditions */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle>Lease Conditions & Terms</CardTitle>
                  <CardDescription>
                    Define the terms, conditions, and special requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="leaseTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lease Terms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the lease terms and conditions..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed terms and conditions of the lease agreement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="specialConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special conditions or requirements..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any special conditions, restrictions, or requirements
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any additional information about this lease
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
                  Create Lease Agreement
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
