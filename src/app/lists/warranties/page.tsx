"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ShieldCheck, Search, Filter, Download, Eye, Edit, ArrowLeft, AlertTriangle, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { DataManager } from "@/lib/lists-data"
import { Warranty, Asset } from "@/lib/lists-data"
import { WarrantyFormDialog } from "@/components/lists/warranty-form-dialog"
import { DeleteConfirmDialog } from "@/components/lists/delete-confirm-dialog"

export default function WarrantiesListPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWarranty, setEditingWarranty] = useState<Warranty | undefined>()
  const [deleteWarranty, setDeleteWarranty] = useState<Warranty | undefined>()

  const dataManager = DataManager.getInstance()

  const loadWarranties = async () => {
    try {
      setIsLoading(true)
      const warrantiesData = dataManager.getWarranties()
      const assetsData = dataManager.getAssets()
      setWarranties(warrantiesData)
      setAssets(assetsData)
    } catch (error) {
      console.error("Failed to load warranties:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWarranties()
  }, [])

  const handleAddWarranty = async (data: Omit<Warranty, "id">) => {
    try {
      dataManager.addWarranty(data)
      await loadWarranties()
    } catch (error) {
      console.error("Failed to add warranty:", error)
    }
  }

  const handleUpdateWarranty = async (data: Omit<Warranty, "id">) => {
    if (!editingWarranty) return
    
    try {
      dataManager.updateWarranty(editingWarranty.id, data)
      await loadWarranties()
    } catch (error) {
      console.error("Failed to update warranty:", error)
    }
  }

  const handleDeleteWarranty = async () => {
    if (!deleteWarranty) return
    
    try {
      dataManager.deleteWarranty(deleteWarranty.id)
      await loadWarranties()
    } catch (error) {
      console.error("Failed to delete warranty:", error)
    }
  }

  const handleExport = () => {
    dataManager.exportToCSV(warranties, "warranties")
  }

  const filteredWarranties = warranties.filter((warranty) => {
    const matchesSearch = warranty.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || warranty.status === statusFilter
    const matchesType = typeFilter === "all" || warranty.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Expired":
        return "bg-red-100 text-red-800"
      case "Expiring Soon":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Manufacturer":
        return "bg-blue-100 text-blue-800"
      case "Extended":
        return "bg-purple-100 text-purple-800"
      case "Service":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const summaryStats = {
    total: warranties.length,
    active: warranties.filter(w => w.status === "Active").length,
    expired: warranties.filter(w => w.status === "Expired").length,
    expiringSoon: warranties.filter(w => w.status === "Expiring Soon").length,
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <h1 className="text-lg font-semibold">List of Warranties</h1>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Back Button */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lists">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lists
              </Link>
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Total</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{summaryStats.total}</div>
                <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Warranty records
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Active</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">{summaryStats.active}</div>
                <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">
                  Valid coverage
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800 group-hover:scale-110 transition-all duration-300">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Expired</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300">{summaryStats.expired}</div>
                <p className="text-xs text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                  No longer valid
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 mr-3 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 group-hover:scale-110 transition-all duration-300">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">Expiring Soon</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors duration-300">{summaryStats.expiringSoon}</div>
                <p className="text-xs text-muted-foreground group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors duration-300">
                  Renewal needed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search warranties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="Extended">Extended</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setIsFormOpen(true)}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Add Warranty
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Warranties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Warranty Records</CardTitle>
              <CardDescription>
                Tracks warranties tied to assets, including start/end dates, coverage, and vendor information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="rounded-md border min-w-[1000px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">ID</TableHead>
                        <TableHead className="w-[200px]">Asset</TableHead>
                        <TableHead className="w-[150px]">Vendor</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[120px]">Start Date</TableHead>
                        <TableHead className="w-[120px]">End Date</TableHead>
                        <TableHead className="w-[150px]">Reference</TableHead>
                        <TableHead className="w-[120px]">Cost</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWarranties.map((warranty) => (
                        <TableRow key={warranty.id}>
                          <TableCell className="font-medium">{warranty.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{warranty.assetName}</div>
                              <div className="text-sm text-muted-foreground">{warranty.assetId}</div>
                            </div>
                          </TableCell>
                          <TableCell>{warranty.vendor}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(warranty.type)}>
                              {warranty.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(warranty.status)}>
                              {warranty.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(warranty.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(warranty.endDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono text-sm">{warranty.referenceNumber}</TableCell>
                          <TableCell>${(warranty.cost || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingWarranty(warranty)
                                  setIsFormOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteWarranty(warranty)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Dialog */}
        <WarrantyFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) {
              setEditingWarranty(undefined)
            }
          }}
          warranty={editingWarranty}
          assets={assets}
          onSubmit={editingWarranty ? handleUpdateWarranty : handleAddWarranty}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={!!deleteWarranty}
          onOpenChange={(open) => {
            if (!open) setDeleteWarranty(undefined)
          }}
          onConfirm={handleDeleteWarranty}
          itemType="warranty"
          itemName={deleteWarranty?.assetName}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
