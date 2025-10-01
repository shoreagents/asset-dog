"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  DollarSign,
  MoreHorizontal,
  Smartphone,
  Monitor
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { DataManager } from "@/lib/lists-data"
import { Asset } from "@/lib/lists-data"
import { AssetFormDialog } from "@/components/lists/asset-form-dialog"
import { DeleteConfirmDialog } from "@/components/lists/delete-confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusColors = {
  "Available": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "In Use": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Maintenance": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "Disposed": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function AssetsListPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>()
  const [deletingAsset, setDeletingAsset] = useState<Asset | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  const dataManager = DataManager.getInstance()

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = () => {
    setIsLoading(true)
    try {
      const loadedAssets = dataManager.getAssets()
      setAssets(loadedAssets)
    } catch (error) {
      toast.error("Failed to load assets")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter assets based on search and filters
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.value, 0)

  const handleAddAsset = () => {
    setEditingAsset(undefined)
    setIsFormOpen(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setIsFormOpen(true)
  }

  const handleDeleteAsset = (asset: Asset) => {
    setDeletingAsset(asset)
    setIsDeleteOpen(true)
  }

  const handleSaveAsset = (assetData: Omit<Asset, 'id'>) => {
    try {
      if (editingAsset) {
        dataManager.updateAsset(editingAsset.id, assetData)
        toast.success("Asset updated successfully!")
      } else {
        dataManager.addAsset(assetData)
        toast.success("Asset created successfully!")
      }
      loadAssets()
    } catch (error) {
      toast.error("Failed to save asset")
    }
  }

  const handleConfirmDelete = () => {
    if (deletingAsset) {
      try {
        dataManager.deleteAsset(deletingAsset.id)
        toast.success("Asset deleted successfully!")
        loadAssets()
      } catch (error) {
        toast.error("Failed to delete asset")
      }
    }
  }

  const handleExport = () => {
    try {
      dataManager.exportToCSV(filteredAssets, 'assets-list')
      toast.success("Assets exported successfully!")
    } catch (error) {
      toast.error("Failed to export assets")
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
                  <BreadcrumbLink href="/lists">
                    Lists
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>List of Assets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Assets List */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-1 bg-blue-500 rounded-full shrink-0"></div>
                  <h1 className="text-3xl font-bold tracking-tight">List of Assets</h1>
                </div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground ml-6">
                Full record of all assets in your inventory
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 px-3"
                >
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Table</span>
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-8 px-3"
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Cards</span>
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm" onClick={handleAddAsset}>
                <Package className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Asset</span>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-2 sm:mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xs sm:text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">Total Assets</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{filteredAssets.length}</div>
                <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                  Complete inventory count
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-2 sm:mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xs sm:text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 truncate">Available</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4">
                <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  {filteredAssets.filter(a => a.status === "Available").length}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300 truncate">
                  Ready for assignment
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 dark:bg-orange-900 mr-2 sm:mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 group-hover:scale-110 transition-all duration-300">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xs sm:text-sm font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 truncate">In Use</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4">
                <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">
                  {filteredAssets.filter(a => a.status === "In Use").length}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 truncate">
                  Currently assigned
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900 mr-2 sm:mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 group-hover:scale-110 transition-all duration-300">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xs sm:text-sm font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 truncate">Total Value</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4">
                <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                  ${totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300 truncate">
                  Inventory worth
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by ID, name, or assigned user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="In Use">In Use</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets Display */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Assets ({filteredAssets.length})</CardTitle>
              <CardDescription className="text-sm">
                Complete list of all assets in your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === "table" ? (
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="rounded-md border min-w-[1000px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Asset ID</TableHead>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead className="w-[150px]">Category</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[150px]">Location</TableHead>
                          <TableHead className="w-[150px]">Assigned To</TableHead>
                          <TableHead className="w-[120px]">Value</TableHead>
                          <TableHead className="w-[150px]">Purchase Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.id}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="truncate">{asset.name}</span>
                                <span className="text-xs text-muted-foreground sm:hidden">{asset.id}</span>
                              </div>
                            </TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[asset.status as keyof typeof statusColors]}>
                                {asset.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{asset.location}</TableCell>
                            <TableCell>{asset.assignedTo || "Unassigned"}</TableCell>
                            <TableCell>${asset.value.toLocaleString()}</TableCell>
                            <TableCell>{format(new Date(asset.purchaseDate), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {}}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Asset
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteAsset(asset)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Asset
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map((asset) => (
                    <Card key={asset.id} className="group hover:shadow-lg transition-all duration-300 ease-in-out">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium truncate">{asset.name}</CardTitle>
                            <CardDescription className="text-xs">{asset.id}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {}}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Asset
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteAsset(asset)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <Badge className={statusColors[asset.status as keyof typeof statusColors]}>
                              {asset.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Category</span>
                            <span className="text-xs font-medium">{asset.category}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Value</span>
                            <span className="text-xs font-medium">${asset.value.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Location</span>
                            <span className="text-xs font-medium truncate max-w-[100px]">{asset.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Assigned To</span>
                            <span className="text-xs font-medium truncate max-w-[100px]">{asset.assignedTo || "Unassigned"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <AssetFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          asset={editingAsset}
          onSave={handleSaveAsset}
        />

        <DeleteConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleConfirmDelete}
          title="Delete Asset"
          description="Are you sure you want to delete this asset? This action cannot be undone and will also delete all related maintenance and warranty records."
          itemName={deletingAsset?.name}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
