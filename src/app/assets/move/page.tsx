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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CalendarIcon, ArrowLeft, Move, Plus, X, Package, CheckCircle, ChevronDown } from "lucide-react"
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

// Get real data from setup manager
const getLocations = () => {
  const locations = setupDataManager.getLocations()
  const sites = setupDataManager.getSites()
  
  // Convert to strings and combine locations and sites
  const allLocations: string[] = [
    ...locations.map(loc => loc.name),
    ...sites.map(site => site.name)
  ]
  
  // Add department-specific locations
  const departments = setupDataManager.getDepartments()
  departments.forEach(dept => {
    allLocations.push(`Main Office - ${dept.name}`)
    allLocations.push(`Branch Office - ${dept.name}`)
  })
  
  return allLocations
}

const getPersons = () => {
  const employees = setupDataManager.getEmployees()
  const persons: Record<string, { name: string; email: string; department: string }> = {}
  
  employees.forEach(emp => {
    persons[emp.name] = {
      name: emp.name,
      email: emp.email || `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
      department: emp.department || 'General'
    }
  })
  
  return persons
}

const getDepartments = () => {
  return setupDataManager.getDepartments().map(dept => dept.name)
}

const moveSchema = z.object({
  moveType: z.string().min(1, "Please select the type of move"),
  newLocation: z.string().min(1, "Please select a new location"),
  assignedTo: z.string().optional(),
  departmentTransfer: z.string().optional(),
  moveDate: z.date().min(new Date("1900-01-01"), "Move date is required"),
  reason: z.string().min(1, "Please provide a reason for the move"),
  notes: z.string().optional(),
})

type MoveFormValues = z.infer<typeof moveSchema>

export default function MoveAssetPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<any[]>([])
  const [assetIdInput, setAssetIdInput] = useState("")
  const [moveType, setMoveType] = useState("")
  const [locationInput, setLocationInput] = useState("")
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState<string[]>([])
  const [personInput, setPersonInput] = useState("")
  const [showPersonSuggestions, setShowPersonSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, { name: string; email: string; department: string }>>({})
  const [departmentInput, setDepartmentInput] = useState("")
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])

  // Get real data
  const locations = getLocations()
  const persons = getPersons()
  const departments = getDepartments()

  // Get available assets from the loaded assets
  const availableAssets = getAvailableAssets(assets)

  // Calculate asset counts by department from real data
  const assetCountsByDepartment = {
    "All Departments": assets.length,
    ...departments.reduce((acc, dept) => {
      acc[dept] = assets.filter(a => a.department === dept).length
      return acc
    }, {} as Record<string, number>)
  }

  // Calculate assets moved today (based on notes containing today's date)
  const today = format(new Date(), "yyyy-MM-dd")
  const assetsMovedToday = assets.filter(asset => 
    asset.notes?.includes(`[MOVE ${today}]`)
  ).length

  const form = useForm<MoveFormValues>({
    resolver: zodResolver(moveSchema),
    defaultValues: {
      moveType: "",
      newLocation: "",
      assignedTo: "",
      departmentTransfer: "",
      reason: "",
      notes: "",
    },
  })

  // Filter locations based on search input
  const handleLocationSearch = (value: string) => {
    setLocationInput(value)
    form.setValue("newLocation", value)
    
    if (value.length > 0) {
      const filtered = locations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredLocations(filtered)
      setShowLocationSuggestions(true)
    } else {
      setFilteredLocations([])
      setShowLocationSuggestions(false)
    }
  }

  const selectLocation = (location: string) => {
    setLocationInput(location)
    form.setValue("newLocation", location)
    setShowLocationSuggestions(false)
  }

  // Filter persons based on search input
  const handlePersonSearch = (value: string) => {
    setPersonInput(value)
    form.setValue("assignedTo", value)
    
    if (value.length > 0) {
      const filtered = Object.entries(persons).filter(([name, person]) =>
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
    setPersonInput(personName)
    form.setValue("assignedTo", personName)
    setShowPersonSuggestions(false)
  }

  // Filter departments based on search input
  const handleDepartmentSearch = (value: string) => {
    setDepartmentInput(value)
    form.setValue("departmentTransfer", value)
    
    if (value.length > 0) {
      const filtered = departments.filter(department =>
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
    setDepartmentInput(department)
    form.setValue("departmentTransfer", department)
    setShowDepartmentSuggestions(false)
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
      description: `${asset.name || asset.id} has been added to the move list`,
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

  const onSubmit = async (data: MoveFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please add at least one asset to move",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      let successCount = 0
      let failedCount = 0
      
      // Update each selected asset based on move type
      for (const asset of selectedAssets) {
        try {
          let updateData: any = {}
          
          // Prepare update data based on move type
          if (data.moveType === "location") {
            updateData = {
              location: data.newLocation,
              notes: `[MOVE ${format(data.moveDate, "yyyy-MM-dd")}] ${data.reason}${data.notes ? ` | Notes: ${data.notes}` : ''}`
            }
          } else if (data.moveType === "person") {
            updateData = {
              assignedTo: data.assignedTo,
              status: "Check Out",
              notes: `[MOVE ${format(data.moveDate, "yyyy-MM-dd")}] Assigned to ${data.assignedTo} | ${data.reason}${data.notes ? ` | Notes: ${data.notes}` : ''}`
            }
          } else if (data.moveType === "department") {
            updateData = {
              department: data.departmentTransfer,
              notes: `[MOVE ${format(data.moveDate, "yyyy-MM-dd")}] Department transfer to ${data.departmentTransfer} | ${data.reason}${data.notes ? ` | Notes: ${data.notes}` : ''}`
            }
          }
          
          const result = await updateAssetMutation.mutateAsync({ id: asset.id, updates: updateData })
          if (result.success) {
            successCount++
          } else {
            failedCount++
          }
        } catch (error) {
          console.error(`Failed to update asset ${asset.id}:`, error)
          failedCount++
        }
      }
      
      if (successCount > 0) {
        toast.success("Assets moved successfully!", {
          description: `${successCount} asset(s) have been moved.${failedCount > 0 ? ` ${failedCount} asset(s) could not be updated.` : ''}`,
          duration: 4000,
        })
        
        // Redirect back to assets list
        router.push("/assets")
      } else {
        toast.error("Failed to move assets", {
          description: "No assets could be updated. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error moving assets:", error)
      toast.error("Failed to move assets", {
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
                  <BreadcrumbPage>Move Asset</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Move Asset */}
        <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">
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
                    <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                    <h1 className="text-3xl font-bold tracking-tight">Move Asset</h1>
                  </div>
                </div>
                <p className="text-muted-foreground ml-6">
                  Transfer assets between sites, departments, or locations within the company
                </p>
              </div>
            </div>

          {/* Move Asset Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Assets by Department</CardTitle>
                </div>
                <div className="ml-2">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="h-8 text-xs min-w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(assetCountsByDepartment).map((department) => (
                        <SelectItem key={department} value={department} className="text-xs">
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                  {assetCountsByDepartment[selectedDepartment as keyof typeof assetCountsByDepartment]}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {selectedDepartment === "All Departments" 
                    ? "Total assets across all departments" 
                    : `Assets in ${selectedDepartment}`
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-200">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">Transferred Today</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">{assetsMovedToday}</div>
                <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-200">
                  Assets moved today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Asset Move Form */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Asset Move Form
          </CardTitle>
          <CardDescription>
            Fill out the form below to move an asset to a new location
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
                        <div className="border rounded-lg bg-muted/20 p-2">
                          <ScrollArea className="h-48">
                            <div className="space-y-2 pr-4">
                              {selectedAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-background shadow-sm">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{asset.name || asset.id}</div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      {asset.id} • {asset.location || 'No location'} • {asset.status}
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

              {/* Move Configuration */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Move Configuration
                  </CardTitle>
                  <CardDescription>
                    Choose the type of move and destination
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Move Type Selection */}
                    <FormField
                      control={form.control}
                      name="moveType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Move</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value)
                              setMoveType(value)
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select the type of move" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="location">Location Transfer</SelectItem>
                              <SelectItem value="person">Person Assignment</SelectItem>
                              <SelectItem value="department">Department Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose whether you&apos;re moving to a new location, assigning to a person, or transferring between departments
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New Location - Only show for Location Transfer */}
                    {moveType === "location" && (
                      <div className="space-y-2">
                        <FormLabel>New Location</FormLabel>
                        <FormDescription>
                          Search for a location by typing the name
                        </FormDescription>
                        <div className="relative">
                          <Input
                            placeholder="Search for a location..."
                            value={locationInput}
                            onChange={(e) => handleLocationSearch(e.target.value)}
                            onFocus={() => {
                              if (locationInput.length > 0) {
                                setShowLocationSuggestions(true)
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowLocationSuggestions(false), 200)
                            }}
                          />
                          
                          {/* Location Suggestions Dropdown */}
                          {showLocationSuggestions && filteredLocations.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                              <ScrollArea className="max-h-60">
                                <div className="p-1">
                                  {filteredLocations.map((location) => (
                                    <button
                                      key={location}
                                      type="button"
                                      onClick={() => selectLocation(location)}
                                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                                    >
                                      <div className="font-medium">{location}</div>
                                    </button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                          
                          {/* No results message */}
                          {showLocationSuggestions && filteredLocations.length === 0 && locationInput.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                              No locations found for &quot;{locationInput}&quot;
                            </div>
                          )}
                        </div>
                        {form.formState.errors.newLocation && (
                          <p className="text-sm text-destructive">{form.formState.errors.newLocation.message}</p>
                        )}
                      </div>
                    )}

                    {/* Person Assignment - Only for Person Assignment */}
                    {moveType === "person" && (
                      <div className="space-y-2">
                        <FormLabel>Assign To Person</FormLabel>
                        <FormDescription>
                          Search for a person by name, email, or department
                        </FormDescription>
                        <div className="relative">
                          <Input
                            placeholder="Search by name, email, or department..."
                            value={personInput}
                            onChange={(e) => handlePersonSearch(e.target.value)}
                            onFocus={() => {
                              if (personInput.length > 0) {
                                setShowPersonSuggestions(true)
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowPersonSuggestions(false), 200)
                            }}
                          />
                          
                          {/* Person Suggestions Dropdown */}
                          {showPersonSuggestions && Object.keys(filteredPersons).length > 0 && (
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
                          {showPersonSuggestions && Object.keys(filteredPersons).length === 0 && personInput.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                              No persons found for &quot;{personInput}&quot;
                            </div>
                          )}
                        </div>
                        {form.formState.errors.assignedTo && (
                          <p className="text-sm text-destructive">{form.formState.errors.assignedTo.message}</p>
                        )}
                      </div>
                    )}

                    {/* Department Transfer - Only for Department Transfer */}
                    {moveType === "department" && (
                      <div className="space-y-2">
                        <FormLabel>Transfer To Department</FormLabel>
                        <FormDescription>
                          Search for a department by typing the name
                        </FormDescription>
                        <div className="relative">
                          <Input
                            placeholder="Search for a department..."
                            value={departmentInput}
                            onChange={(e) => handleDepartmentSearch(e.target.value)}
                            onFocus={() => {
                              if (departmentInput.length > 0) {
                                setShowDepartmentSuggestions(true)
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowDepartmentSuggestions(false), 200)
                            }}
                          />
                          
                          {/* Department Suggestions Dropdown */}
                          {showDepartmentSuggestions && filteredDepartments.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                              <ScrollArea className="max-h-60">
                                <div className="p-1">
                                  {filteredDepartments.map((department) => (
                                    <button
                                      key={department}
                                      type="button"
                                      onClick={() => selectDepartment(department)}
                                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                                    >
                                      <div className="font-medium">{department}</div>
                                    </button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                          
                          {/* No results message */}
                          {showDepartmentSuggestions && filteredDepartments.length === 0 && departmentInput.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                              No departments found for &quot;{departmentInput}&quot;
                            </div>
                          )}
                        </div>
                        {form.formState.errors.departmentTransfer && (
                          <p className="text-sm text-destructive">{form.formState.errors.departmentTransfer.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Move Details */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Move Details
                  </CardTitle>
                  <CardDescription>
                    Set the move date and provide additional information
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Move Date */}
                    <FormField
                      control={form.control}
                      name="moveDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Move Date</FormLabel>
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
                            When the asset will be moved
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reason */}
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Move</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Department reorganization, Project requirements, Maintenance needs, Site relocation"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Explain why the asset is being moved
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
                              placeholder="Any special instructions or additional information"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Any extra details about this move
                          </FormDescription>
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
                      Moving Assets...
                    </>
                  ) : (
                    `Move ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
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
