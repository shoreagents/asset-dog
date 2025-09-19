"use client"

import * as React from "react"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, Filter, ArrowUpDown, UserCheck, UserMinus, User, Mail, Phone, MapPin, Briefcase, MoreHorizontal, Package, Move, DollarSign, CheckCircle } from "lucide-react"
import Link from "next/link"

// Mock asset data
const mockAssets = [
  {
    id: "AST-001",
    name: "MacBook Pro 16\"",
    category: "IT Equipment",
    location: "New York Office - Floor 2",
    status: "In Use",
    value: 2999.99,
    assignedTo: "John Smith",
    purchaseDate: "2023-01-15",
  },
  {
    id: "AST-002",
    name: "Dell Workstation",
    category: "IT Equipment", 
    location: "Chicago Office - IT Room",
    status: "Available",
    value: 1899.99,
    assignedTo: null,
    purchaseDate: "2023-02-20",
  },
  {
    id: "AST-003",
    name: "Conference Table",
    category: "Furniture",
    location: "New York Office - Meeting Room A",
    status: "In Use",
    value: 1200.00,
    assignedTo: "Meeting Room A",
    purchaseDate: "2022-11-10",
  },
  {
    id: "AST-004",
    name: "Toyota Camry",
    category: "Vehicle",
    location: "New York Office - Parking Garage",
    status: "Under Maintenance",
    value: 28000.00,
    assignedTo: "Fleet Manager",
    purchaseDate: "2022-06-15",
  },
  {
    id: "AST-005",
    name: "iPhone 14 Pro",
    category: "IT Equipment",
    location: "Remote - Employee Home",
    status: "In Use",
    value: 999.99,
    assignedTo: "Sarah Johnson",
    purchaseDate: "2023-03-10",
  },
  {
    id: "AST-006",
    name: "Office Printer",
    category: "IT Equipment",
    location: "Chicago Office - Main Floor",
    status: "Available",
    value: 450.00,
    assignedTo: null,
    purchaseDate: "2023-01-05",
  },
  {
    id: "AST-007",
    name: "Ergonomic Chair",
    category: "Furniture",
    location: "New York Office - Floor 3",
    status: "In Use",
    value: 350.00,
    assignedTo: "Mike Wilson",
    purchaseDate: "2023-04-12",
  },
  {
    id: "AST-008",
    name: "Security Camera",
    category: "Security Equipment",
    location: "Chicago Office - Entrance",
    status: "In Use",
    value: 299.99,
    assignedTo: "Security Team",
    purchaseDate: "2022-12-01",
  },
]

const statusColors = {
  "Available": "bg-green-100 text-green-800 border-green-200",
  "In Use": "bg-blue-100 text-blue-800 border-blue-200", 
  "Under Maintenance": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Disposed": "bg-red-100 text-red-800 border-red-200",
}

// Mock person data
const mockPersons = {
  "John Smith": {
    name: "John Smith",
    email: "john.smith@assetdog.com",
    phone: "+1 (555) 123-4567",
    department: "IT Department",
    position: "Senior Developer",
    location: "New York Office - Floor 2",
    employeeId: "EMP-001",
  },
  "Sarah Johnson": {
    name: "Sarah Johnson", 
    email: "sarah.johnson@assetdog.com",
    phone: "+1 (555) 234-5678",
    department: "Marketing",
    position: "Marketing Manager",
    location: "Remote - Employee Home",
    employeeId: "EMP-002",
  },
  "Mike Wilson": {
    name: "Mike Wilson",
    email: "mike.wilson@assetdog.com", 
    phone: "+1 (555) 345-6789",
    department: "Operations",
    position: "Operations Lead",
    location: "Chicago Office - Main Floor",
    employeeId: "EMP-003",
  },
  "Emily Davis": {
    name: "Emily Davis",
    email: "emily.davis@assetdog.com",
    phone: "+1 (555) 456-7890", 
    department: "Finance",
    position: "Financial Analyst",
    location: "New York Office - Floor 1",
    employeeId: "EMP-004",
  },
  "Fleet Manager": {
    name: "Fleet Manager",
    email: "fleet@assetdog.com",
    phone: "+1 (555) 567-8901",
    department: "Operations", 
    position: "Fleet Manager",
    location: "New York Office - Parking Garage",
    employeeId: "EMP-005",
  },
}

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sortField, setSortField] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [selectedPerson, setSelectedPerson] = React.useState<string | null>(null)
  const [isPersonModalOpen, setIsPersonModalOpen] = React.useState(false)

  // Get unique categories and statuses for filters
  const categories = Array.from(new Set(mockAssets.map(asset => asset.category)))
  const statuses = Array.from(new Set(mockAssets.map(asset => asset.status)))

  // Filter and sort assets
  const filteredAssets = React.useMemo(() => {
    let filtered = mockAssets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
      const matchesStatus = statusFilter === "all" || asset.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort if a field is selected
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a]
        let bValue = b[sortField as keyof typeof b]

        // Handle null values
        if (aValue === null) aValue = ""
        if (bValue === null) bValue = ""

        // Convert to string for comparison
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }

    return filtered
  }, [searchTerm, categoryFilter, statusFilter, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handlePersonClick = (personName: string) => {
    setSelectedPerson(personName)
    setIsPersonModalOpen(true)
  }

  // Get assets assigned to the selected person
  const getPersonAssets = (personName: string) => {
    return mockAssets.filter(asset => asset.assignedTo === personName)
  }

  const selectedPersonData = selectedPerson ? mockPersons[selectedPerson as keyof typeof mockPersons] : null
  const personAssets = selectedPerson ? getPersonAssets(selectedPerson) : []

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
                  <BreadcrumbPage>Assets</BreadcrumbPage>
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
              <h1 className="text-3xl font-bold">Assets</h1>
              <p className="text-muted-foreground">
                Manage and track all your organizational assets
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-fit">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/assets/add" className="flex items-center w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/assets/checkout" className="flex items-center w-full">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Check Out Asset
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/assets/checkin" className="flex items-center w-full">
                    <UserMinus className="mr-2 h-4 w-4" />
                    Check In Asset
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/assets/move" className="flex items-center w-full">
                    <Move className="mr-2 h-4 w-4" />
                    Move Asset
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 mr-3">
                  <Package className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors duration-300">Total Assets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{mockAssets.length}</div>
                <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-green-500/5 hover:to-green-500/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-green-500/20">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300 mr-3">
                  <CheckCircle className="h-5 w-5 text-green-500 group-hover:text-green-500/80 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-green-500 transition-colors duration-300">Available</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-green-500 transition-colors duration-300">
                  {mockAssets.filter(a => a.status === "Available").length}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-green-500/70 transition-colors duration-300">
                  Ready for assignment
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-blue-500/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-blue-500/20">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 mr-3">
                  <User className="h-5 w-5 text-blue-500 group-hover:text-blue-500/80 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-blue-500 transition-colors duration-300">In Use</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-blue-500 transition-colors duration-300">
                  {mockAssets.filter(a => a.status === "In Use").length}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-blue-500/70 transition-colors duration-300">
                  {Math.round((mockAssets.filter(a => a.status === "In Use").length / mockAssets.length) * 100)}% utilization
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-yellow-500/5 hover:to-yellow-500/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-yellow-500/20">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all duration-300 mr-3">
                  <DollarSign className="h-5 w-5 text-yellow-500 group-hover:text-yellow-500/80 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-yellow-500 transition-colors duration-300">Total Value</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-yellow-500 transition-colors duration-300">
                  ${mockAssets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-yellow-500/70 transition-colors duration-300">
                  Asset portfolio value
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Separator />

          {/* Filters and Search */}
          <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle>Asset List</CardTitle>
              <CardDescription>
                Filter, search, and sort through all your assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assets Table */}
              <div className="mt-6 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                        <div className="flex items-center gap-2">
                          Asset ID
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("assignedTo")}>
                        <div className="flex items-center gap-2">
                          Assigned To
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-2">
                          Name
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                        <div className="flex items-center gap-2">
                          Category
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("location")}>
                        <div className="flex items-center gap-2">
                          Location
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        <div className="flex items-center gap-2">
                          Status
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer text-right" onClick={() => handleSort("value")}>
                        <div className="flex items-center justify-end gap-2">
                          Value
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50 hover:shadow-md transition-all duration-200 ease-in-out">
                        <TableCell className="font-medium">{asset.id}</TableCell>
                        <TableCell>
                          {asset.assignedTo && mockPersons[asset.assignedTo as keyof typeof mockPersons] ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePersonClick(asset.assignedTo!)
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {asset.assignedTo}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">
                              {asset.assignedTo || "Unassigned"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.category}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusColors[asset.status as keyof typeof statusColors]}
                          >
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${asset.value.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredAssets.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No assets found matching your criteria.
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredAssets.length} of {mockAssets.length} assets
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Person Details Sheet */}
      <Sheet open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
        <SheetContent className="w-full sm:w-[600px] md:w-[700px] lg:w-[800px] xl:w-[900px] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="flex-shrink-0 p-4 sm:p-6 md:p-8 pb-4 sm:pb-6">
              <SheetTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl font-bold">
                <User className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                {selectedPersonData?.name}
              </SheetTitle>
              <SheetDescription className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1 sm:mt-2">
                Employee information and assigned assets
              </SheetDescription>
            </SheetHeader>

            {selectedPersonData && (
              <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 pt-0">
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  {/* Person Information */}
                  <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                    <CardHeader className="pb-4 sm:pb-6">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base sm:text-lg break-words">{selectedPersonData.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Employee ID: {selectedPersonData.employeeId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Email</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all">{selectedPersonData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Phone</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{selectedPersonData.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Position</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.position}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Department</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.department}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Location</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assigned Assets */}
                  <Card className="flex flex-col hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                    <CardHeader className="flex-shrink-0 pb-4 sm:pb-6">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                        Assigned Assets ({personAssets.length})
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base md:text-lg text-muted-foreground">
                        Assets currently assigned to this person
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                      {personAssets.length > 0 ? (
                        <>
                          {/* Scrollable Assets List */}
                          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px]">
                            {personAssets.map((asset) => (
                              <div key={asset.id} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                                <div className="space-y-2 sm:space-y-3">
                                  {/* Asset Header */}
                                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                                        <h4 className="font-semibold text-sm sm:text-base break-words">{asset.name}</h4>
                                        <Badge 
                                          variant="outline" 
                                          className={`${statusColors[asset.status as keyof typeof statusColors]} text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}
                                        >
                                          {asset.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                      <p className="font-bold text-sm sm:text-base md:text-lg">${asset.value.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Asset Details */}
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px]">Asset ID:</span>
                                      <span className="text-xs sm:text-sm break-all">{asset.id}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px]">Category:</span>
                                      <span className="text-xs sm:text-sm break-words">{asset.category}</span>
                                    </div>
                                    <div className="flex items-start gap-1 sm:gap-2">
                                      <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px] mt-0.5">Location:</span>
                                      <span className="text-xs sm:text-sm flex-1 break-words">{asset.location}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Action Button */}
                                  {asset.status === "In Use" && (
                                    <div className="flex justify-end pt-1 sm:pt-2">
                                      <Link href={`/assets/checkin/${asset.id}`}>
                                        <Button size="sm" variant="outline" onClick={() => setIsPersonModalOpen(false)} className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                                          <UserMinus className="h-3 w-3 mr-1" />
                                          Check In
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Fixed Total Section */}
                          <div className="flex-shrink-0 pt-2 sm:pt-3 mt-2 sm:mt-3 border-t bg-background">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm sm:text-base">Total Value:</span>
                              <span className="font-bold text-sm sm:text-base md:text-lg text-primary">
                                ${personAssets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-6 sm:py-8">
                          <User className="h-8 w-8 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                          <p className="text-xs sm:text-sm text-center px-4">No assets currently assigned to this person.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  )
}
