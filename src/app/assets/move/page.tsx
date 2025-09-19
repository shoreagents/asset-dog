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
import { CalendarIcon, ArrowLeft, Move, Plus, X, Package } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Mock assets data (all assets for moving)
const mockAssets = [
  { id: "AST-001", name: "MacBook Pro 16\"", category: "IT Equipment", currentLocation: "IT Storage Room", status: "Available" },
  { id: "AST-002", name: "Dell Monitor 27\"", category: "IT Equipment", currentLocation: "IT Storage Room", status: "Available" },
  { id: "AST-003", name: "Office Chair", category: "Furniture", currentLocation: "Storage Room", status: "Available" },
  { id: "AST-004", name: "Toyota Camry", category: "Vehicle", currentLocation: "Parking Garage", status: "In Use" },
  { id: "AST-005", name: "Projector", category: "IT Equipment", currentLocation: "Conference Room", status: "Available" },
]

// Mock locations with sites and departments
const mockLocations = [
  // Main Office Locations
  "Main Office - IT Department",
  "Main Office - HR Department", 
  "Main Office - Finance Department",
  "Main Office - Marketing Department",
  "Main Office - Sales Department",
  "Main Office - Operations Department",
  "Main Office - Reception Area",
  "Main Office - Conference Room A",
  "Main Office - Conference Room B",
  "Main Office - Break Room",
  "Main Office - Server Room",
  "Main Office - Storage Room",
  
  // Branch Office Locations
  "Branch Office - Downtown",
  "Branch Office - Downtown - IT Department",
  "Branch Office - Downtown - Sales Department",
  "Branch Office - Downtown - Conference Room",
  
  "Branch Office - Suburbs",
  "Branch Office - Suburbs - Operations Department",
  "Branch Office - Suburbs - Warehouse",
  
  // Warehouse Locations
  "Central Warehouse - Receiving",
  "Central Warehouse - Storage Area A",
  "Central Warehouse - Storage Area B",
  "Central Warehouse - Shipping Dock",
  
  // Remote Sites
  "Remote Site - Manufacturing Plant",
  "Remote Site - Distribution Center",
  "Remote Site - Research Lab",
  
  // Special Locations
  "Parking Garage - Main Office",
  "Parking Garage - Branch Downtown",
  "Maintenance Room",
  "Archive Room"
]

// Mock persons data for person transfers
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
  "HR Department", 
  "Finance Department",
  "Marketing Department",
  "Sales Department",
  "Operations Department",
  "Legal Department",
  "Customer Service",
  "Research & Development",
  "Quality Assurance"
]

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<typeof mockAssets>([])
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
      const filtered = mockLocations.filter(location =>
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
    setPersonInput(personName)
    form.setValue("assignedTo", personName)
    setShowPersonSuggestions(false)
  }

  // Filter departments based on search input
  const handleDepartmentSearch = (value: string) => {
    setDepartmentInput(value)
    form.setValue("departmentTransfer", value)
    
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
    setDepartmentInput(department)
    form.setValue("departmentTransfer", department)
    setShowDepartmentSuggestions(false)
  }

  const addAssetById = () => {
    if (!assetIdInput.trim()) return

    const asset = mockAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (!asset) {
      toast.error("Asset not found", {
        description: `No asset found with ID: ${assetIdInput}`,
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
      description: `${asset.name} has been added to the move list`,
    })
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Move asset data:", { ...data, assets: selectedAssets })
      
      // Show success toast notification
      toast.success("Assets moved successfully!", {
        description: `${selectedAssets.length} asset(s) have been moved to ${data.newLocation}.`,
        duration: 4000,
      })
      
      // Redirect back to assets list
      router.push("/assets")
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
                <h1 className="text-3xl font-bold">Move Asset</h1>
              </div>
              <p className="text-muted-foreground">
                Transfer assets between sites, departments, or locations within the company
              </p>
            </div>
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
                                  {asset.id} • Current: {asset.currentLocation} • Status: {asset.status}
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
                            Choose whether you're moving to a new location, assigning to a person, or transferring between departments
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
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                          )}
                          
                          {/* No results message */}
                          {showLocationSuggestions && filteredLocations.length === 0 && locationInput.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                              No locations found for "{locationInput}"
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
                          {showPersonSuggestions && Object.keys(filteredPersons).length === 0 && personInput.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                              No persons found for "{personInput}"
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
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                          )}
                          
                          {/* No results message */}
                          {showDepartmentSuggestions && filteredDepartments.length === 0 && departmentInput.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                              No departments found for "{departmentInput}"
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
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting || selectedAssets.length === 0} className="flex-1">
                  {isSubmitting ? "Moving Assets..." : `Move ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`}
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
