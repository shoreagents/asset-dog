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
import { Search, Plus, Filter, ArrowUpDown } from "lucide-react"
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

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sortField, setSortField] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")

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

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Assets</h1>
              <p className="text-muted-foreground">
                Manage and track all your organizational assets
              </p>
            </div>
            <Link href="/assets/add">
              <Button className="w-fit">
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAssets.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockAssets.filter(a => a.status === "Available").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockAssets.filter(a => a.status === "In Use").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${mockAssets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
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
                      <TableHead className="cursor-pointer" onClick={() => handleSort("assignedTo")}>
                        <div className="flex items-center gap-2">
                          Assigned To
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
                      <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{asset.id}</TableCell>
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
                        <TableCell>{asset.assignedTo || "Unassigned"}</TableCell>
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
    </SidebarProvider>
  )
}
