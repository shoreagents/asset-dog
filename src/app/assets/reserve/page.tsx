"use client"

import React, { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CalendarIcon, ArrowLeft, Calendar as CalendarIconComponent, Plus, X, Package, Filter, Eye } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Get available assets from useAssets hook (exclude maintenance and disposed assets)
const getAvailableAssets = (assets: any[]) => {
  return assets.filter(asset => 
    asset.status === "Available" || 
    asset.status === "Check Out"
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
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [availableAssets, setAvailableAssets] = useState<any[]>([])
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, any>>({})
  const [showPersonSuggestions, setShowPersonSuggestions] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([])
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false)

  // Recent Reservations functionality
  const [reservationFilter, setReservationFilter] = useState("All")
  const [viewAllDialogOpen, setViewAllDialogOpen] = useState(false)

  const form = useForm<ReserveFormValues>({
    resolver: zodResolver(reserveFormSchema),
    defaultValues: {
      assetIds: [],
      reservedFor: "",
      reservedForType: "employee",
      reservationDate: new Date(),
      expectedReturnDate: new Date(),
      purpose: "",
      notes: "",
    },
  })

  // Helper functions for reservations
  const getRecentReservations = () => {
    const reservedAssets = assets.filter(asset => 
      asset.status === "Reserve" || asset.notes?.includes("[RESERVED")
    )
    
    return reservedAssets
      .map(asset => {
        const match = asset.notes?.match(/\[RESERVED ([^\]]+)]/)
        if (match) {
          const reservationData = match[1]
          const parts = reservationData.split(' | ')
          const reservedFor = parts.find(p => p.startsWith('For:'))?.replace('For: ', '') || 'Unknown'
          const reservedDate = parts.find(p => p.match(/^\d{4}-\d{2}-\d{2}/))
          const department = asset.department || 'Unknown'
          
          return {
            id: asset.id,
            name: asset.name || asset.id,
            person: reservedFor,
            department: department,
            time: getTimeAgo(asset.updatedAt),
            reservedDate: reservedDate ? new Date(reservedDate) : new Date()
          }
        }
        return null
      })
      .filter(Boolean)
      .map(r => ({
        ...r!,
        updatedAt: (r as any)?.reservedDate.toISOString() || new Date().toISOString()
      }))
      .sort((a, b) => {
        return new Date((b as any).updatedAt).getTime() - new Date((a as any).updatedAt).getTime()
      })
      .slice(0, 5)
      .filter(r => {
        if (reservationFilter === "All") return true
        return (r as any)?.department === reservationFilter
      })
  }

  const getAllReservations = () => {
    const reservedAssets = assets.filter(asset => 
      asset.status === "Reserve" || asset.notes?.includes("[RESERVED")
    )
    
    return reservedAssets
      .map(asset => {
        const match = asset.notes?.match(/\[RESERVED ([^\]]+)]/)
        if (match) {
          const reservationData = match[1]
          const parts = reservationData.split(' | ')
          const reservedFor = parts.find(p => p.startsWith('For:'))?.replace('For: ', '') || 'Unknown'
          const reservedDate = parts.find(p => p.match(/^\d{4}-\d{2}-\d{2}/))
          const department = asset.department || 'Unknown'
          
          return {
            id: asset.id,
            name: asset.name || asset.id,
            person: reservedFor,
            department: department,
            time: getTimeAgo(asset.updatedAt),
            reservedDate: reservedDate ? new Date(reservedDate) : new Date()
          }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => {
        return new Date((b as any).reservedDate || 0).getTime() - new Date((a as any).reservedDate || 0).getTime()
      })
  }

  const getTimeAgo = (updatedAt?: string) => {
    if (!updatedAt) return "Unknown time"
    
    const now = new Date()
    const updated = new Date(updatedAt)
    const diffInMs = now.getTime() - updated.getTime()
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)
    
    if (diffInYears > 0) return `${diffInYears}y ago`
    if (diffInMonths > 0) return `${diffInMonths}mo ago`
    if (diffInWeeks > 0) return `${diffInWeeks}w ago`
    if (diffInDays > 0) return `${diffInDays}d ago`
    if (diffInHours > 0) {
      const remainingMinutes = diffInMinutes % 60
      if (diffInHours < 6 && remainingMinutes > 0) {
        return `${diffInHours}h ${remainingMinutes}m ago`
      }
      return `${diffInHours}h ago`
    }
    if (diffInMinutes > 0) return `${diffInMinutes}m ago`
    return "Just now"
  }

  const recentReservations = getRecentReservations()
  const allReservations = getAllReservations()

  // Initialize available assets
  React.useEffect(() => {
    const avAssets = getAvailableAssets(assets)
    setAvailableAssets(avAssets)
  }, [assets])

  // Filter assets for search
  const handleAssetSearch = (value: string) => {
    setAssetSearch(value)
    
    if (value.length > 0) {
      const filtered = availableAssets.filter(asset =>
        asset.id.toLowerCase().includes(value.toLowerCase()) ||
        (asset.name || '').toLowerCase().includes(value.toLowerCase()) ||
        (asset.category || '').toLowerCase().includes(value.toLowerCase())
      )
      setFilteredAssets(filtered)
      setShowAssetSuggestions(true)
    } else {
      setFilteredAssets([])
      setShowAssetSuggestions(false)
    }
  }

  const selectAsset = (asset: any) => {
    if (selectedAssets.includes(asset.id)) {
      toast.error("Asset already added", {
        description: `Asset ${asset.id} is already in the reservation list`,
      })
      return
    }

    setSelectedAssets(prev => [...prev, asset.id])
    setAssetSearch("")
    setShowAssetSuggestions(false)
    setFilteredAssets([])
    
    // Update form values
    const currentAssetIds = form.getValues("assetIds")
    form.setValue("assetIds", [...currentAssetIds, asset.id])
    
    toast.success("Asset added", {
      description: `${asset.name || asset.id} has been added to the reservation list`,
    })
  }

  const removeAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(id => id !== assetId))
    
    // Update form values
    const currentAssetIds = form.getValues("assetIds")
    form.setValue("assetIds", currentAssetIds.filter(id => id !== assetId))
  }

  // Filter persons based on search input
  const handlePersonSearch = (value: string) => {
    setEmployeeSearch(value)
    form.setValue("reservedFor", value)
    
    if (value.length > 0) {
      const filtered = Object.entries(mockPersons).filter(([name, person]) =>
        name.toLowerCase().includes(value.toLowerCase()) ||
        person.email.toLowerCase().includes(value.toLowerCase()) ||
        person.department.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredPersons(Object.fromEntries(filtered))
      setShowPersonSuggestions(true)
    } else {
      setFilteredPersons({})
      setShowPersonSuggestions(false)
    }
  }

  const selectPerson = (personName: string) => {
    setEmployeeSearch(personName)
    form.setValue("reservedFor", personName)
    setShowPersonSuggestions(false)
  }

  // Filter departments based on search input
  const handleDepartmentSearch = (value: string) => {
    setDepartmentSearch(value)
    form.setValue("reservedFor", value)
    
    if (value.length > 0) {
      const filtered = mockDepartments.filter(department =>
        department.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredDepartments(filtered)
      setShowDepartmentSuggestions(true)
    } else {
      setFilteredDepartments([])
      setShowDepartmentSuggestions(false)
    }
  }

  const selectDepartment = (department: string) => {
    setDepartmentSearch(department)
    form.setValue("reservedFor", department)
    setShowDepartmentSuggestions(false)
  }

  const onSubmit = async (data: ReserveFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please select at least one asset to reserve",
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
          const reservationDetails = 
            `[RESERVED ${format(data.reservationDate, "yyyy-MM-dd")}] For: ${data.reservedFor} | Expected Return: ${format(data.expectedReturnDate, "yyyy-MM-dd")} | Purpose: ${data.purpose}${data.notes ? ` | Notes: ${data.notes}` : ''}`
          
          const updateData = {
            status: "Reserve" as const,
            assignedTo: data.reservedForType === "employee" ? data.reservedFor : undefined,
            department: data.reservedForType === "department" ? data.reservedFor : undefined,
            notes: reservationDetails
          }
          
          const result = await updateAssetMutation.mutateAsync({ id: assetId, updates: updateData })
          if (result.success) {
            successCount++
            console.log('Successfully reserved asset', assetId)
          } else {
            failedCount++
            console.error('Asset reservation failed:', result.error)
          }
        } catch (error) {
          console.error(`Failed to reserve asset ${assetId}:`, error)
          failedCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully reserved ${successCount} asset${successCount !== 1 ? 's' : ''}`, {
          description: `Assets reserved for ${data.reservedForType === "employee" ? data.reservedFor : data.reservedFor + " department"}${
            failedCount > 0 ? ` (${failedCount} failed)` : ''
          }`,
        })
        
        // Reset form and selected assets
        setSelectedAssets([])
        form.reset()
        
        // Reload assets to reflect changes
        // Assets will be automatically refetched by the useInstantAssets hook
      } else {
        toast.error("Failed to reserve assets", {
          description: "No assets could be reserved. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error reserving assets:", error)
      toast.error("Failed to reserve assets", {
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
                  <CalendarIconComponent className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">Total Reserved</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-[80px] font-bold text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200">{assets.filter(a => a.notes?.includes("[RESERVED")).length}</div>
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
                      {Array.from(new Set(allReservations.map(r => (r as any).department).filter(Boolean))).map(dept => (
                        <SelectItem key={dept} value={dept} className="text-xs">{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={viewAllDialogOpen} onOpenChange={setViewAllDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View All
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>All Recent Reservations</DialogTitle>
                        <DialogDescription>
                          Complete list of all asset reservations
                        </DialogDescription>
                      </DialogHeader>
                      <div className="border rounded-lg bg-card p-2">
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-2">
                            {allReservations.length === 0 ? (
                              <div className="text-center py-8 text-sm text-muted-foreground">
                                No reservations found
                              </div>
                            ) : (
                              allReservations.map((reservation) => (
                                <div key={(reservation as any).id} className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{(reservation as any).name}</div>
                                    <div className="text-xs text-muted-foreground">{(reservation as any).person} • {(reservation as any).department}</div>
                                  </div>
                                  <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">{(reservation as any).time}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-4">
                    {recentReservations.map((reservation) => (
                      <div key={(reservation as any).id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{(reservation as any).name}</div>
                          <div className="text-xs text-muted-foreground">{(reservation as any).person} • {(reservation as any).department}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{(reservation as any).time}</div>
                      </div>
                    ))}
                    {recentReservations.length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        {allReservations.length === 0 
                          ? "No reservations found" 
                          : "No reservations found for selected filter"
                        }
                      </div>
                    )}
                  </div>
                </ScrollArea>
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
            {/* Reserve Asset Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIconComponent className="h-5 w-5" />
                  Reserve Asset Form
                </CardTitle>
                <CardDescription>
                  Fill out the form below to reserve assets for future use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form id="reserve-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Asset Selection */}
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                          Asset Selection
                        </CardTitle>
                        <CardDescription>
                          Select the assets you want to reserve
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <FormLabel>Add Assets to Reserve</FormLabel>
                            <FormDescription>
                              Type asset ID and press Enter or click Add to add assets to the reservation list
                            </FormDescription>
                          </div>
                          
                          {/* Asset ID Input */}
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                placeholder="Enter Asset ID (e.g., AST-001)"
                                value={assetSearch}
                                onChange={(e) => handleAssetSearch(e.target.value)}
                                onFocus={() => {
                                  if (assetSearch.length > 0) {
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
                              {showAssetSuggestions && filteredAssets.length === 0 && assetSearch.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                                  No available assets found for &quot;{assetSearch}&quot;
                                </div>
                              )}
                            </div>
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
                                    {selectedAssets.map((assetId) => {
                                      const asset = availableAssets.find(a => a.id === assetId)
                                      if (!asset) return null
                                      
                                      return (
                                        <div key={assetId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
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
                                            onClick={() => removeAsset(assetId)}
                                            className="text-destructive hover:text-destructive flex-shrink-0 ml-2"


                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Reserve Configuration */}
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                          Reserve Configuration
                        </CardTitle>
                        <CardDescription>
                          Configure reservation details and assignee
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-6">
                          
                          {/* Reservation Type */}
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
                                <FormDescription>Choose whether you&apos;re reserving for an employee or department</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Employee Selection - Only show for Employee reservation */}
                          {form.watch("reservedForType") === "employee" && (
                            <div className="space-y-2">
                              <FormLabel>Reserved For Employee</FormLabel>
                              <FormDescription>
                                Search for an employee by name, email, or department
                              </FormDescription>
                              <div className="relative">
                                <Input
                                  placeholder="Search by name, email, or department..."
                                  value={employeeSearch}
                                  onChange={(e) => handlePersonSearch(e.target.value)}
                                  onFocus={() => {
                                    if (employeeSearch.length > 0) {
                                      setShowPersonSuggestions(true)
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => setShowPersonSuggestions(false), 200)
                                  }}
                                />
                                
                                {/* Person Suggestions Dropdown */}
                                {showPersonSuggestions && Object.keys(filteredPersons).length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                                    <ScrollArea className="max-h-48 overflow-y-auto">
                                      <div className="p-1">
                                        {filteredPersons &&
                                          Object.entries(filteredPersons).map(([name, person]) => (
                                            <button
                                              key={name}
                                              type="button"
                                              onClick={() => selectPerson(name)}
                                              className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
                                            >
                                              <div className="font-medium">{name}</div>
                                              <div className="text-sm text-muted-foreground">
                                                {person.email} • {person.department}
                                              </div>
                                            </button>
                                          ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                )}
                                
                                {/* No results message */}
                                {showPersonSuggestions && Object.keys(filteredPersons).length === 0 && employeeSearch.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                                    No employees found for &quot;{employeeSearch}&quot;
                                  </div>
                                )}
                              </div>
                              {form.formState.errors.reservedFor && (
                                <p className="text-sm text-destructive">{form.formState.errors.reservedFor.message}</p>
                              )}
                            </div>
                          )}

                          {/* Department Selection - Only show for Department reservation */}
                          {form.watch("reservedForType") === "department" && (
                            <div className="space-y-2">
                              <FormLabel>Reserved For Department</FormLabel>
                              <FormDescription>
                                Search for a department by name
                              </FormDescription>
                              <div className="relative">
                                <Input
                                  placeholder="Search for a department..."
                                  value={departmentSearch}
                                  onChange={(e) => handleDepartmentSearch(e.target.value)}
                                  onFocus={() => {
                                    if (departmentSearch.length > 0) {
                                      setShowDepartmentSuggestions(true)
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => setShowDepartmentSuggestions(false), 200)
                                  }}
                                />
                                
                                {/* Department Suggestions Dropdown */}
                                {showDepartmentSuggestions && filteredDepartments.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                                    <ScrollArea className="max-h-48 overflow-y-auto">
                                      <div className="p-1">
                                        {filteredDepartments.map((department) => (
                                          <button
                                            key={department}
                                            type="button"
                                            onClick={() => selectDepartment(department)}
                                            className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
                                          >
                                            <div className="font-medium">{department}</div>
                                          </button>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                )}
                                
                                {/* No results message */}
                                {showDepartmentSuggestions && filteredDepartments.length === 0 && departmentSearch.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                                    No departments found for &quot;{departmentSearch}&quot;
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Reserve Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Purpose</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter purpose of reservation..." {...field} />
                                </FormControl>
                                <FormDescription>Describe why these assets are sendo reserved</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Additional notes or special instructions..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                        </div>
                      </CardContent>
                    </Card>

                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Separator Line */}
            <Separator />

            {/* Submit Button */}
            <div className="flex justify-center gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/assets")}>
                Cancel
              </Button>
              <Button type="submit" form="reserve-form" disabled={isSubmitting || selectedAssets.length === 0} className="min-w-[140px]">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reserving...
                  </>
                ) : (
                  `Reserve ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}