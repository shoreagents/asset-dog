"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useDashboard } from "@/hooks/use-dashboard"
import { AddWidgetDialog } from "@/components/add-widget-dialog"
import { DraggableWidgetContainer } from "@/components/draggable-widget-container"
import { DropPlaceholder } from "@/components/drop-placeholder"
import { SortableProvider } from "@/components/sortable-provider"
import { Settings, BarChart3, RefreshCw, UserCheck, UserMinus, Move, Plus, CalendarIcon, Save, Package, DollarSign, CheckCircle, X, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import Link from "next/link"
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"
import { WidgetSize } from "@/types/widgets"
import { useState, useEffect } from "react"
import { DataManager, Asset } from "@/lib/lists-data"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Form schemas matching the actual pages
const assetFormSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required").max(20, "Asset ID must be 20 characters or less"),
  name: z.string().min(1, "Asset name is required").max(100, "Asset name must be 100 characters or less"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  purchaseDate: z.date().min(new Date("1900-01-01"), "Purchase date is required"),
  cost: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= 0
  }, "Cost must be a valid positive number"),
  location: z.string().min(1, "Location is required"),
  assignedTo: z.string().optional(),
  department: z.string().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  warrantyExpiry: z.date().optional(),
  notes: z.string().optional(),
})

const checkoutSchema = z.object({
  assignedTo: z.string().min(1, "Please select who to assign to"),
  checkoutDate: z.date({
    message: "Checkout date is required",
  }),
  expectedReturnDate: z.date({
    message: "Expected return date is required",
  }),
  checkoutReason: z.string().min(1, "Please provide a reason for checkout"),
  notes: z.string().optional(),
})

const checkinSchema = z.object({
  checkinDate: z.date({
    message: "Check-in date is required",
  }),
  condition: z.string().min(1, "Asset condition is required"),
  location: z.string().min(1, "Return location is required"),
  notes: z.string().optional(),
})

const moveSchema = z.object({
  newLocation: z.string().min(1, "New location is required"),
  reason: z.string().min(1, "Reason for move is required"),
  assignedTo: z.string().optional(),
  departmentTransfer: z.string().optional(),
  notes: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>
type CheckoutFormValues = z.infer<typeof checkoutSchema>
type CheckinFormValues = z.infer<typeof checkinSchema>
type MoveFormValues = z.infer<typeof moveSchema>

type Person = {
  name: string
  email: string
  department: string
}

// Sample data for dropdowns
const categories = [
  "IT Equipment",
  "Furniture", 
  "Vehicle",
  "Security Equipment",
  "Office Equipment",
  "Machinery",
  "Tools",
  "Other"
]

const locations = [
  "New York Office - Floor 1",
  "New York Office - Floor 2", 
  "New York Office - Floor 3",
  "New York Office - IT Room",
  "New York Office - Meeting Room A",
  "New York Office - Meeting Room B",
  "New York Office - Parking Garage",
  "Chicago Office - Main Floor",
  "Chicago Office - IT Room",
  "Chicago Office - Entrance",
  "Remote - Employee Home",
  "Warehouse - Section A",
  "Warehouse - Section B"
]

const departments = [
  "IT Department",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
  "Security",
  "Facilities",
  "Executive",
  "Sales",
  "Customer Service"
]

const employees = [
  "John Smith",
  "Sarah Johnson", 
  "Mike Wilson",
  "Emily Davis",
  "David Brown",
  "Lisa Anderson",
  "Chris Taylor",
  "Amanda White",
  "James Miller",
  "Jennifer Garcia"
]

const conditions = [
  "Excellent",
  "Good", 
  "Fair",
  "Poor",
  "Damaged"
]

export default function Page() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  
  // Dialog states
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-mobile-menu]')) {
          setMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])
  
  // Asset selection states
  const [selectedCheckOutAssets, setSelectedCheckOutAssets] = useState<Asset[]>([])
  const [selectedCheckInAssets, setSelectedCheckInAssets] = useState<Asset[]>([])
  const [selectedMoveAssets, setSelectedMoveAssets] = useState<Asset[]>([])
  
  // Asset ID inputs
  const [checkOutAssetIdInput, setCheckOutAssetIdInput] = useState("")
  const [checkInAssetIdInput, setCheckInAssetIdInput] = useState("")
  const [moveAssetIdInput, setMoveAssetIdInput] = useState("")
  
  // Person search states
  const [assignToInput, setAssignToInput] = useState("")
  const [showAssignToSuggestions, setShowAssignToSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, Person>>({})
  
  // Form instances
  const addAssetForm = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      assetId: "",
      name: "",
      category: "",
      description: "",
      cost: "",
      location: "",
      assignedTo: "",
      department: "",
      serialNumber: "",
      manufacturer: "",
      model: "",
      notes: "",
    },
  })

  const checkoutForm = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      assignedTo: "",
      checkoutReason: "",
      notes: "",
    },
  })

  const checkinForm = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      condition: "",
      location: "",
      notes: "",
    },
  })

  const moveForm = useForm<MoveFormValues>({
    resolver: zodResolver(moveSchema),
    defaultValues: {
      newLocation: "",
      reason: "",
      notes: "",
    },
  })
  
  const { 
    widgets, 
    isLoaded,
    addWidget, 
    removeWidget, 
    updateWidget,
    reorderWidgets,
    resetToDefault,
    getWidgetComponent, 
    getAvailableWidgets 
  } = useDashboard()

  const availableWidgets = getAvailableWidgets()

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      reorderWidgets(active.id as string, over?.id as string)
    }
    
    setActiveId(null)
    setOverId(null)
  }

  const handleResizeWidget = (id: string, size: WidgetSize) => {
    updateWidget(id, { size })
  }

  // Asset selection helper functions
  const addAssetById = (assetIdInput: string, setAssetIdInput: (value: string) => void, selectedAssets: Asset[], setSelectedAssets: (assets: Asset[]) => void, availableAssets: Asset[]) => {
    if (!assetIdInput.trim()) return

    const asset = availableAssets.find((a: Asset) => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (!asset) {
      toast.error("Asset not found", {
        description: `No available asset found with ID: ${assetIdInput}`,
      })
      return
    }

    if (selectedAssets.find((a: Asset) => a.id === asset.id)) {
      toast.error("Asset already added", {
        description: `Asset ${asset.id} is already in the list`,
      })
      return
    }

    setSelectedAssets([...selectedAssets, asset])
    setAssetIdInput("")
    toast.success("Asset added", {
      description: `${asset.name} has been added to the list`,
    })
  }

  const removeAsset = (assetId: string, selectedAssets: Asset[], setSelectedAssets: (assets: Asset[]) => void) => {
    setSelectedAssets(selectedAssets.filter((asset: Asset) => asset.id !== assetId))
  }

  // Person search functions
  const handleAssignToSearch = (value: string) => {
    setAssignToInput(value)
    checkoutForm.setValue("assignedTo", value)
    
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
    checkoutForm.setValue("assignedTo", personName)
    setShowAssignToSuggestions(false)
  }

  const mockPersons = {
    "John Smith": { name: "John Smith", email: "john@company.com", department: "IT" },
    "Sarah Johnson": { name: "Sarah Johnson", email: "sarah@company.com", department: "Marketing" },
    "Mike Wilson": { name: "Mike Wilson", email: "mike@company.com", department: "Sales" },
    "Lisa Brown": { name: "Lisa Brown", email: "lisa@company.com", department: "HR" },
    "David Lee": { name: "David Lee", email: "david@company.com", department: "Finance" },
  }

  // Form submission handlers matching actual pages
  const handleAddAsset = async (data: AssetFormValues) => {
    try {
      const dataManager = DataManager.getInstance()
      const newAsset = dataManager.addAsset({
        name: data.name,
        description: data.description || "",
        category: data.category,
        subCategory: "",
        location: data.location,
        site: "",
        status: "Available" as const,
        value: parseFloat(data.cost) || 0,
        purchaseDate: format(data.purchaseDate, "yyyy-MM-dd"),
        dateAcquired: format(data.purchaseDate, "yyyy-MM-dd"),
        assignedTo: data.assignedTo && data.assignedTo !== "unassigned" ? data.assignedTo : null,
        department: data.department && data.department !== "none" ? data.department : "Unassigned",
        brand: data.manufacturer || "",
        model: data.model || "",
        serialNumber: data.serialNumber || undefined,
        manufacturer: data.manufacturer || undefined,
        notes: data.notes || undefined,
      })
      
      toast.success("Asset added successfully!", {
        description: `${data.name} has been added to your inventory.`,
      })
      
      addAssetForm.reset()
      setAddAssetOpen(false)
    } catch (error) {
      toast.error("Failed to add asset", {
        description: "Please try again.",
      })
    }
  }

  const handleCheckOut = async (data: CheckoutFormValues) => {
    try {
      if (selectedCheckOutAssets.length === 0) {
        toast.error("No assets selected", {
          description: "Please select at least one asset to check out.",
        })
        return
      }

      const dataManager = DataManager.getInstance()
      let successCount = 0
      let failedCount = 0
      
      // Update each selected asset
      for (const asset of selectedCheckOutAssets) {
        const updated = dataManager.updateAsset(asset.id, {
          status: "In Use",
          assignedTo: data.assignedTo,
          notes: data.notes
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
      } else {
        toast.error("Failed to check out assets", {
          description: "No assets could be updated. They may be read-only imported assets.",
        })
      }
      
      checkoutForm.reset()
      setSelectedCheckOutAssets([])
      setCheckOutOpen(false)
    } catch (error) {
      toast.error("Failed to check out assets", {
        description: "Please try again.",
      })
    }
  }

  const handleCheckIn = async (data: CheckinFormValues) => {
    try {
      if (selectedCheckInAssets.length === 0) {
        toast.error("No assets selected", {
          description: "Please select at least one asset to check in.",
        })
        return
      }

      const dataManager = DataManager.getInstance()
      let successCount = 0
      let failedCount = 0
      
      // Update each selected asset
      for (const asset of selectedCheckInAssets) {
        const updated = dataManager.updateAsset(asset.id, {
          status: "Available",
          assignedTo: null,
          location: data.location,
          notes: data.notes
        })
        
        if (updated) {
          successCount++
        } else {
          failedCount++
        }
      }
      
      if (successCount > 0) {
        toast.success("Assets checked in successfully!", {
          description: `${successCount} asset(s) returned to ${data.location}.${failedCount > 0 ? ` ${failedCount} asset(s) could not be updated.` : ''}`,
        })
      } else {
        toast.error("Failed to check in assets", {
          description: "No assets could be updated. They may be read-only imported assets.",
        })
      }
      
      checkinForm.reset()
      setSelectedCheckInAssets([])
      setCheckInOpen(false)
    } catch (error) {
      toast.error("Failed to check in assets", {
        description: "Please try again.",
      })
    }
  }

  const handleMove = async (data: MoveFormValues) => {
    try {
      if (selectedMoveAssets.length === 0) {
        toast.error("No assets selected", {
          description: "Please select at least one asset to move.",
        })
        return
      }

      const dataManager = DataManager.getInstance()
      let successCount = 0
      let failedCount = 0
      
      // Update each selected asset
      for (const asset of selectedMoveAssets) {
        const updateData: Partial<Asset> = {
          location: data.newLocation,
          notes: data.notes
        }
        
        // Add assignment transfer if specified
        if (data.assignedTo) {
          updateData.assignedTo = data.assignedTo
        }
        
        if (data.departmentTransfer && data.departmentTransfer !== "none") {
          updateData.department = data.departmentTransfer
        }
        
        const updated = dataManager.updateAsset(asset.id, updateData)
        
        if (updated) {
          successCount++
        } else {
          failedCount++
        }
      }
      
      if (successCount > 0) {
        toast.success("Assets moved successfully!", {
          description: `${successCount} asset(s) moved to ${data.newLocation}.${failedCount > 0 ? ` ${failedCount} asset(s) could not be updated.` : ''}`,
        })
      } else {
        toast.error("Failed to move assets", {
          description: "No assets could be updated. They may be read-only imported assets.",
        })
      }
      
      moveForm.reset()
      setSelectedMoveAssets([])
      setMoveOpen(false)
    } catch (error) {
      toast.error("Failed to move assets", {
        description: "Please try again.",
      })
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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-2">
          {/* Dashboard Header */}
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Monitor your asset management system
                <span className="hidden sm:inline"> • Drag widgets to customize layout</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <AddWidgetDialog 
                availableWidgets={availableWidgets}
                onAddWidget={addWidget}
              />
              
              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1">
                {/* 3 Dots Menu - Visible on all screen sizes */}
                <div className="relative" data-mobile-menu>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  
                  {/* Menu Dropdown */}
                  {mobileMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-background border rounded-md shadow-lg p-2 min-w-[200px]">
                      <div className="flex flex-col gap-1">
                        {/* Add Asset */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8"
                          onClick={() => {
                            setAddAssetOpen(true)
                            setMobileMenuOpen(false)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Asset
                        </Button>
                        
                        {/* Check Out */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8"
                          onClick={() => {
                            setCheckOutOpen(true)
                            setMobileMenuOpen(false)
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Check Out
                        </Button>
                        
                        {/* Check In */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8"
                          onClick={() => {
                            setCheckInOpen(true)
                            setMobileMenuOpen(false)
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                        
                        {/* Move */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="justify-start h-8"
                          onClick={() => {
                            setMoveOpen(true)
                            setMobileMenuOpen(false)
                          }}
                        >
                          <Move className="h-4 w-4 mr-2" />
                          Move Asset
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dialog Components - Outside of dropdown */}
                {/* Add Asset Dialog */}
                <Dialog open={addAssetOpen} onOpenChange={setAddAssetOpen}>
                  <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh]">
                    <ScrollArea className="max-h-[80vh]">
                      <div className="p-6">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add New Asset
                          </DialogTitle>
                          <DialogDescription>
                            Register a new asset in your inventory system
                          </DialogDescription>
                        </DialogHeader>
                    
                        <Form {...addAssetForm}>
                          <form onSubmit={addAssetForm.handleSubmit(handleAddAsset)} className="space-y-6">
                            {/* Basic Information */}
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                  Basic Information
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={addAssetForm.control}
                                  name="assetId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Asset ID *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="AST-001" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={addAssetForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Asset Name *</FormLabel>
                                      <FormControl>
                                        <Input placeholder='MacBook Pro 16"' {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={addAssetForm.control}
                                  name="category"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Category *</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {categories.map(category => (
                                            <SelectItem key={category} value={category}>
                                              {category}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={addAssetForm.control}
                                  name="location"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Location *</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a location" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {locations.map(location => (
                                            <SelectItem key={location} value={location}>
                                              {location}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                            {/* Financial Information */}
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                  Financial Information
                                </CardTitle>
                              </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={addAssetForm.control}
                                name="purchaseDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Purchase Date *</FormLabel>
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
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={addAssetForm.control}
                                name="cost"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Purchase Cost *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="2999.99" 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
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

                            {/* Assignment Information */}
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                  Assignment Information
                                </CardTitle>
                              </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={addAssetForm.control}
                                name="assignedTo"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Assigned To</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an employee" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {employees.map(employee => (
                                          <SelectItem key={employee} value={employee}>
                                            {employee}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={addAssetForm.control}
                                name="department"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="none">No Department</SelectItem>
                                        {departments.map(department => (
                                          <SelectItem key={department} value={department}>
                                            {department}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>

                            {/* Additional Information */}
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                  Additional Information
                                </CardTitle>
                              </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={addAssetForm.control}
                                name="serialNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Serial Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="SN123456789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={addAssetForm.control}
                                name="manufacturer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Manufacturer</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Apple Inc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={addAssetForm.control}
                                name="model"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <FormControl>
                                      <Input placeholder="MacBook Pro 16-inch" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={addAssetForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Asset description..."
                                        className="resize-none"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={addAssetForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Additional notes about this asset..."
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

                            <div className="flex gap-4 pt-6">
                              <Button 
                                type="submit" 
                                className="flex-1 md:flex-none"
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Create Asset
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setAddAssetOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                      </form>
                    </Form>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                {/* Check Out Dialog */}
                <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                  <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh]">
                    <ScrollArea className="max-h-[80vh]">
                      <div className="p-6">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            Asset Checkout Form
                          </DialogTitle>
                          <DialogDescription>
                            Fill out the form below to check out an asset to someone
                          </DialogDescription>
                        </DialogHeader>
                    
                        <Form {...checkoutForm}>
                          <form onSubmit={checkoutForm.handleSubmit(handleCheckOut)} className="space-y-6">
                            {/* Asset Selection */}
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
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
                                  value={checkOutAssetIdInput}
                                  onChange={(e) => setCheckOutAssetIdInput(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      const dataManager = DataManager.getInstance()
                                      const availableAssets = dataManager.getAssets().filter(asset => asset.status === "Available")
                                      addAssetById(checkOutAssetIdInput, setCheckOutAssetIdInput, selectedCheckOutAssets, setSelectedCheckOutAssets, availableAssets)
                                    }
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  onClick={() => {
                                    const dataManager = DataManager.getInstance()
                                    const availableAssets = dataManager.getAssets().filter(asset => asset.status === "Available")
                                    addAssetById(checkOutAssetIdInput, setCheckOutAssetIdInput, selectedCheckOutAssets, setSelectedCheckOutAssets, availableAssets)
                                  }} 
                                  disabled={!checkOutAssetIdInput.trim()}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Selected Assets List */}
                              {selectedCheckOutAssets.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">Selected Assets ({selectedCheckOutAssets.length})</span>
                                  </div>
                                  <ScrollArea className="max-h-40">
                                    <div className="space-y-2 pr-4">
                                      {selectedCheckOutAssets.map((asset) => (
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
                                            onClick={() => removeAsset(asset.id, selectedCheckOutAssets, setSelectedCheckOutAssets)}
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
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
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
                                            <div className="font-medium">{(person as Person).name}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {(person as Person).department} • {(person as Person).email}
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
                              {checkoutForm.formState.errors.assignedTo && (
                                <p className="text-sm text-destructive">{checkoutForm.formState.errors.assignedTo.message}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                            {/* Checkout Details */}
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
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
                                control={checkoutForm.control}
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
                                control={checkoutForm.control}
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
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
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
                                control={checkoutForm.control}
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
                              <FormField
                                control={checkoutForm.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Any additional notes or special instructions..."
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

                            <div className="flex gap-4 pt-6">
                              <Button 
                                type="submit" 
                                className="flex-1 md:flex-none"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Check Out Assets
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setCheckOutOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                      </form>
                    </Form>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                {/* Check In Dialog */}
                <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
                  <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh]">
                    <ScrollArea className="max-h-[80vh]">
                      <div className="p-6">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="flex items-center gap-2">
                            <UserMinus className="h-5 w-5" />
                            Asset Check-in Form
                          </DialogTitle>
                          <DialogDescription>
                            Fill out the form below to check in an asset and return it to inventory
                          </DialogDescription>
                        </DialogHeader>
                    
                        <Form {...checkinForm}>
                          <form onSubmit={checkinForm.handleSubmit(handleCheckIn)} className="space-y-6">
                            {/* Asset Selection */}
                            <Card className="border-2 border-dashed border-muted-foreground/25">
                              <CardHeader className="pb-4">
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
                                  value={checkInAssetIdInput}
                                  onChange={(e) => setCheckInAssetIdInput(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      const dataManager = DataManager.getInstance()
                                      const inUseAssets = dataManager.getAssets().filter(asset => asset.status === "In Use")
                                      addAssetById(checkInAssetIdInput, setCheckInAssetIdInput, selectedCheckInAssets, setSelectedCheckInAssets, inUseAssets)
                                    }
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  onClick={() => {
                                    const dataManager = DataManager.getInstance()
                                    const inUseAssets = dataManager.getAssets().filter(asset => asset.status === "In Use")
                                    addAssetById(checkInAssetIdInput, setCheckInAssetIdInput, selectedCheckInAssets, setSelectedCheckInAssets, inUseAssets)
                                  }} 
                                  disabled={!checkInAssetIdInput.trim()}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Selected Assets List */}
                              {selectedCheckInAssets.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">Selected Assets ({selectedCheckInAssets.length})</span>
                                  </div>
                                  <ScrollArea className="max-h-40">
                                    <div className="space-y-2 pr-4">
                                      {selectedCheckInAssets.map((asset) => (
                                        <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                          <div className="flex-1">
                                            <div className="font-medium">{asset.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {asset.id} • Assigned to: {asset.assignedTo || 'Unknown'} • Status: {asset.status}
                                            </div>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAsset(asset.id, selectedCheckInAssets, setSelectedCheckInAssets)}
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

                        {/* Assigned Person Information */}
                        {selectedCheckInAssets.length > 0 && (
                          <Card className="border-2 border-dashed border-muted-foreground/25">
                            <CardHeader className="pb-4">
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
                                {Array.from(new Set(selectedCheckInAssets.map(asset => asset.assignedTo).filter(Boolean))).map((personName) => {
                                  const personAssets = selectedCheckInAssets.filter(asset => asset.assignedTo === personName)
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
                        <Card className="border-2 border-dashed border-muted-foreground/25">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              Check-in Details
                            </CardTitle>
                            <CardDescription>
                              Set the check-in date and asset condition
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Check-in Date */}
                              <FormField
                                control={checkinForm.control}
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
                                      When the asset is being checked in
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Asset Condition */}
                              <FormField
                                control={checkinForm.control}
                                name="condition"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Asset Condition</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {conditions.map(condition => (
                                          <SelectItem key={condition} value={condition}>
                                            {condition}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      Current condition of the asset
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Return Location */}
                        <Card className="border-2 border-dashed border-muted-foreground/25">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              Return Location
                            </CardTitle>
                            <CardDescription>
                              Specify where the assets will be returned
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <FormField
                              control={checkinForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Return Location</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select return location" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {locations.map(location => (
                                        <SelectItem key={location} value={location}>
                                          {location}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Where the assets will be stored after check-in
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card className="border-2 border-dashed border-muted-foreground/25">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              Additional Information
                            </CardTitle>
                            <CardDescription>
                              Any additional notes about the check-in
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <FormField
                              control={checkinForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Any additional notes about the check-in process..."
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

                            <div className="flex gap-4 pt-6">
                              <Button 
                                type="submit" 
                                className="flex-1 md:flex-none"
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Check In Assets
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setCheckInOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                      </form>
                    </Form>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                {/* Move Dialog */}
                <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
                  <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh]">
                    <ScrollArea className="max-h-[80vh]">
                      <div className="p-6">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="flex items-center gap-2">
                            <Move className="h-5 w-5" />
                            Asset Move Form
                          </DialogTitle>
                          <DialogDescription>
                            Fill out the form below to move assets to new locations
                          </DialogDescription>
                        </DialogHeader>
                    
                        <Form {...moveForm}>
                          <form onSubmit={moveForm.handleSubmit(handleMove)} className="space-y-6">
                        {/* Asset Selection */}
                        <Card className="border-2 border-dashed border-muted-foreground/25">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              Asset Selection
                            </CardTitle>
                            <CardDescription>
                              Select the assets you want to move
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div>
                                <FormLabel>Add Assets to Move</FormLabel>
                                <FormDescription>
                                  Type asset ID and press Enter or click Add to add assets to the move list
                                </FormDescription>
                              </div>
                              
                              {/* Asset ID Input */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter Asset ID (e.g., AST-001)"
                                  value={moveAssetIdInput}
                                  onChange={(e) => setMoveAssetIdInput(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      const dataManager = DataManager.getInstance()
                                      const allAssets = dataManager.getAssets()
                                      addAssetById(moveAssetIdInput, setMoveAssetIdInput, selectedMoveAssets, setSelectedMoveAssets, allAssets)
                                    }
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  onClick={() => {
                                    const dataManager = DataManager.getInstance()
                                    const allAssets = dataManager.getAssets()
                                    addAssetById(moveAssetIdInput, setMoveAssetIdInput, selectedMoveAssets, setSelectedMoveAssets, allAssets)
                                  }} 
                                  disabled={!moveAssetIdInput.trim()}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Selected Assets List */}
                              {selectedMoveAssets.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">Selected Assets ({selectedMoveAssets.length})</span>
                                  </div>
                                  <ScrollArea className="max-h-40">
                                    <div className="space-y-2 pr-4">
                                      {selectedMoveAssets.map((asset) => (
                                        <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                          <div className="flex-1">
                                            <div className="font-medium">{asset.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {asset.id} • {asset.category} • Current: {asset.location}
                                            </div>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAsset(asset.id, selectedMoveAssets, setSelectedMoveAssets)}
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

                        {/* Move Details */}
                        <Card className="border-2 border-dashed border-muted-foreground/25">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              Move Details
                            </CardTitle>
                            <CardDescription>
                              Specify the new location and reason for the move
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <FormField
                                control={moveForm.control}
                                name="newLocation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Location</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select new location" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {locations.map(location => (
                                          <SelectItem key={location} value={location}>
                                            {location}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      Where the assets will be moved to
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={moveForm.control}
                                name="reason"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reason for Move</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="e.g., Relocation, reorganization, department transfer, maintenance"
                                        className="resize-none"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Explain why these assets are being moved
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Transfer Information */}
                        <Card className="border-2 border-dashed border-muted-foreground/25">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              Transfer Information
                            </CardTitle>
                            <CardDescription>
                              Optional: Transfer assets to a different person or department
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <FormField
                                control={moveForm.control}
                                name="assignedTo"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Transfer To (Optional)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Search by name, email, or department..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Leave blank to keep current assignment
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={moveForm.control}
                                name="departmentTransfer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Department Transfer (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="none">No Department</SelectItem>
                                        {departments.map(department => (
                                          <SelectItem key={department} value={department}>
                                            {department}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      Transfer to a different department
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card className="border-2 border-dashed border-muted-foreground/25">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              Additional Information
                            </CardTitle>
                            <CardDescription>
                              Any additional notes about the move
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <FormField
                              control={moveForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Any additional notes about the move process..."
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

                            <div className="flex gap-4 pt-6">
                              <Button 
                                type="submit" 
                                className="flex-1 md:flex-none"
                              >
                                <Move className="mr-2 h-4 w-4" />
                                Move Assets
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setMoveOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                      </form>
                    </Form>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Refresh dashboard data
                  window.location.reload()
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetToDefault()
                  toast.success("Dashboard reset to default layout")
                }}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Reset Layout</span>
              </Button>
            </div>
          </div>
          
              <Separator />

              {/* Widgets Grid */}
              {!isLoaded ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading dashboard...</span>
                  </div>
                </div>
              ) : (
                <SortableProvider 
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  items={widgets.map(w => w.id)}
                  activeId={activeId}
                  overId={overId}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-min" style={{ gridAutoFlow: 'row dense' }}>
                    {widgets.map((widget) => {
                const WidgetComponent = getWidgetComponent(widget.type)
                return (
                  <DraggableWidgetContainer
                    key={widget.id}
                    widget={widget}
                    onRemove={removeWidget}
                    onResize={handleResizeWidget}
                    activeId={activeId}
                    overId={overId}
                  >
                    <WidgetComponent />
                  </DraggableWidgetContainer>
                )
              })}
                  </div>
                </SortableProvider>
              )}

              {/* Empty State */}
          {widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No widgets added yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
                Add widgets to customize your dashboard and monitor your assets
              </p>
              <AddWidgetDialog 
                availableWidgets={availableWidgets}
                onAddWidget={addWidget}
              />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}



