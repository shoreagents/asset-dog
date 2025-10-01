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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { CalendarIcon, ArrowLeft, Calendar as CalendarIconLucide, Plus, X, Package, Filter } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Use centralized asset data
const mockAvailableAssets = getAllAssets()

// Mock persons data
const mockPersons = {
  "John Smith": { name: "John Smith", email: "john@company.com", department: "IT" },
  "Sarah Johnson": { name: "Sarah Johnson", email: "sarah@company.com", department: "Marketing" },
  "Mike Wilson": { name: "Mike Wilson", email: "mike@company.com", department: "Sales" },
  "Lisa Brown": { name: "Lisa Brown", email: "lisa@company.com", department: "HR" },
  "David Lee": { name: "David Lee", email: "david@company.com", department: "Finance" },
  "Emma Davis": { name: "Emma Davis", email: "emma@company.com", department: "Operations" },
}

// Mock departments
const mockDepartments = [
  "IT Department",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Customer Service",
  "Legal",
]

// Form validation schema
const reserveFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  reservedFor: z.string().min(1, "Reserved for is required"),
  reservedForType: z.enum(["employee", "department"], {
    message: "Please select reservation type",
  }),
  reservationDate: z.date({
    message: "Reservation date is required",
  }),
  expectedReturnDate: z.date({
    message: "Expected return date is required",
  }),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
})

type ReserveFormValues = z.infer<typeof reserveFormSchema>

export default function ReserveAssetPage() {
  const router = useRouter()
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [personSearch, setPersonSearch] = useState("")
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [filteredPersons, setFilteredPersons] = useState<Record<string, { name: string; email: string; department: string }>>({})
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([])
  const [reservationFilter, setReservationFilter] = useState("All")

  // Mock recent reservations data
  const allReservations = [
    { id: "AST-001", name: "Laptop AST-001", person: "John Smith", department: "IT Dept", time: "2h ago" },
    { id: "AST-045", name: "Monitor AST-045", person: "Sarah Johnson", department: "HR Dept", time: "4h ago" },
    { id: "AST-078", name: "Printer AST-078", person: "Mike Wilson", department: "Finance", time: "6h ago" },
    { id: "AST-012", name: "Desktop AST-012", person: "Lisa Brown", department: "IT Dept", time: "8h ago" },
    { id: "AST-034", name: "Tablet AST-034", person: "David Lee", department: "Marketing", time: "1d ago" },
    { id: "AST-067", name: "Keyboard AST-067", person: "Emma Davis", department: "IT Dept", time: "1d ago" },
    { id: "AST-089", name: "Mouse AST-089", person: "Tom Wilson", department: "Finance", time: "2d ago" },
    { id: "AST-123", name: "Headset AST-123", person: "Anna Garcia", department: "HR Dept", time: "2d ago" },
    { id: "AST-156", name: "Webcam AST-156", person: "Chris Miller", department: "Marketing", time: "3d ago" },
    { id: "AST-189", name: "Speaker AST-189", person: "Maria Lopez", department: "IT Dept", time: "3d ago" },
  ]

  // Filter reservations based on selected filter
  const recentReservations = reservationFilter === "All" 
    ? allReservations 
    : allReservations.filter(reservation => reservation.department === reservationFilter)

  const form = useForm<ReserveFormValues>({
    resolver: zodResolver(reserveFormSchema),
    defaultValues: {
      assetIds: [],
      reservedFor: "",
      reservedForType: "employee",
      reservationDate: new Date(),
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      purpose: "",
      notes: "",
    },
  })

  const reservedForType = form.watch("reservedForType")

  // Filter assets based on search
  const filteredAssets = mockAvailableAssets.filter(asset =>
    asset.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.name.toLowerCase().includes(assetSearch.toLowerCase())
  )

  // Filter persons based on search
  const handlePersonSearch = (value: string) => {
    setPersonSearch(value)
    if (value.length > 0) {
      const filtered = Object.entries(mockPersons).filter(([name, person]) =>
        name.toLowerCase().includes(value.toLowerCase()) ||
        person.email.toLowerCase().includes(value.toLowerCase()) ||
        person.department.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredPersons(Object.fromEntries(filtered))
    } else {
      setFilteredPersons({})
    }
  }

  // Filter departments based on search
  const handleDepartmentSearch = (value: string) => {
    setDepartmentSearch(value)
    if (value.length > 0) {
      const filtered = mockDepartments.filter(dept =>
        dept.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredDepartments(filtered)
    } else {
      setFilteredDepartments([])
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

  const onSubmit = (data: ReserveFormValues) => {
    console.log("Reserve Asset Data:", data)
    toast.success("Assets reserved successfully!")
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
                  <BreadcrumbPage>Reserve Asset</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Reserve Asset */}
        <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600"></div>

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
                  <div className="h-8 w-1 bg-teal-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Reserve Asset</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Reserve assets for future use by specific employees or departments
              </p>
            </div>
          </div>

          {/* Reserve Asset Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="group hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900 mr-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors duration-200">
                  <CalendarIconLucide className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">Total Reserved</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-[80px] font-bold text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200">23</div>
                    <p className="text-xs text-muted-foreground group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-200 -mt-4">
                      Assets currently reserved
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="text-muted-foreground">This Week</span>
                      <span className="font-medium text-teal-600 dark:text-teal-400">8</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-medium text-teal-600 dark:text-teal-400">15</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="text-xs text-muted-foreground text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Most active: IT Department</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer h-[280px] flex flex-col">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2 flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Recent Reservations</CardTitle>
                </div>
                <div className="ml-2">
                  <Select value={reservationFilter} onValueChange={setReservationFilter}>
                    <SelectTrigger className="h-7 px-2 text-xs min-w-[80px]">
                      <Filter className="h-3 w-3 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All" className="text-xs">All</SelectItem>
                      <SelectItem value="IT Dept" className="text-xs">IT Dept</SelectItem>
                      <SelectItem value="HR Dept" className="text-xs">HR Dept</SelectItem>
                      <SelectItem value="Finance" className="text-xs">Finance</SelectItem>
                      <SelectItem value="Marketing" className="text-xs">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-4">
                    {recentReservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{reservation.name}</div>
                          <div className="text-xs text-muted-foreground">{reservation.person} • {reservation.department}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{reservation.time}</div>
                      </div>
                    ))}
                    {recentReservations.length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No reservations found for selected filter
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
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
                    Select multiple assets you want to reserve for future use
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
                      <div className="border rounded-md max-h-48 overflow-y-auto">
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
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reservation Information */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIconLucide className="h-5 w-5" />
                    Reservation Information
                  </CardTitle>
                  <CardDescription>
                    Specify who the assets are reserved for and when
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reservedForType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reservation Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reservation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="department">Department</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reservedFor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {reservedForType === "employee" ? "Reserved For Employee" : "Reserved For Department"}
                          </FormLabel>
                          <FormControl>
                            {reservedForType === "employee" ? (
                              <div className="space-y-2">
                                <Input
                                  placeholder="Search employee..."
                                  value={personSearch}
                                  onChange={(e) => handlePersonSearch(e.target.value)}
                                />
                                {personSearch && Object.keys(filteredPersons).length > 0 && (
                                  <div className="border rounded-md max-h-32 overflow-y-auto">
                                    {Object.entries(filteredPersons).map(([name, person]) => (
                                      <div
                                        key={name}
                                        className="p-2 hover:bg-muted cursor-pointer"
                                        onClick={() => {
                                          field.onChange(name)
                                          setPersonSearch("")
                                        }}
                                      >
                                        <div className="font-medium">{name}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {person.email} • {person.department}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {field.value && (
                                  <div className="p-2 bg-muted rounded-md">
                                    <div className="font-medium">{field.value}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {mockPersons[field.value as keyof typeof mockPersons]?.email} • {mockPersons[field.value as keyof typeof mockPersons]?.department}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Input
                                  placeholder="Search department..."
                                  value={departmentSearch}
                                  onChange={(e) => handleDepartmentSearch(e.target.value)}
                                />
                                {departmentSearch && filteredDepartments.length > 0 && (
                                  <div className="border rounded-md max-h-32 overflow-y-auto">
                                    {filteredDepartments.map((dept) => (
                                      <div
                                        key={dept}
                                        className="p-2 hover:bg-muted cursor-pointer"
                                        onClick={() => {
                                          field.onChange(dept)
                                          setDepartmentSearch("")
                                        }}
                                      >
                                        {dept}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {field.value && (
                                  <div className="p-2 bg-muted rounded-md">
                                    {field.value}
                                  </div>
                                )}
                              </div>
                            )}
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
                      name="reservationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Reservation Date</FormLabel>
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
                      name="expectedReturnDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expected Return Date</FormLabel>
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
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>
                    Provide additional details about the reservation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the purpose of this reservation..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain why these assets are being reserved
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
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any additional information about this reservation
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
                  Reserve Assets
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
