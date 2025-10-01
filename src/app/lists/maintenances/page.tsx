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
import { Wrench, Search, Filter, Download, Eye, Edit, ArrowLeft, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DataManager } from "@/lib/lists-data"
import { Maintenance, Asset } from "@/lib/lists-data"
import { MaintenanceFormDialog } from "@/components/lists/maintenance-form-dialog"
import { DeleteConfirmDialog } from "@/components/lists/delete-confirm-dialog"

export default function MaintenancesListPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | undefined>()
  const [deleteMaintenance, setDeleteMaintenance] = useState<Maintenance | undefined>()

  const dataManager = DataManager.getInstance()

  const loadMaintenances = async () => {
    try {
      setIsLoading(true)
      const maintenancesData = dataManager.getMaintenances()
      const assetsData = dataManager.getAssets()
      setMaintenances(maintenancesData)
      setAssets(assetsData)
    } catch (error) {
      console.error("Failed to load maintenances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMaintenances()
  }, [])

  const handleAddMaintenance = async (data: Omit<Maintenance, "id">) => {
    try {
      dataManager.addMaintenance(data)
      await loadMaintenances()
    } catch (error) {
      console.error("Failed to add maintenance:", error)
    }
  }

  const handleUpdateMaintenance = async (data: Omit<Maintenance, "id">) => {
    if (!editingMaintenance) return
    
    try {
      dataManager.updateMaintenance(editingMaintenance.id, data)
      await loadMaintenances()
    } catch (error) {
      console.error("Failed to update maintenance:", error)
    }
  }

  const handleDeleteMaintenance = async () => {
    if (!deleteMaintenance) return
    
    try {
      dataManager.deleteMaintenance(deleteMaintenance.id)
      await loadMaintenances()
    } catch (error) {
      console.error("Failed to delete maintenance:", error)
    }
  }

  const handleExport = () => {
    dataManager.exportToCSV(maintenances, "maintenances")
  }

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const matchesSearch = maintenance.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || maintenance.status === statusFilter
    const matchesType = typeFilter === "all" || maintenance.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const summaryStats = {
    total: maintenances.length,
    completed: maintenances.filter(m => m.status === "Completed").length,
    inProgress: maintenances.filter(m => m.status === "In Progress").length,
    overdue: maintenances.filter(m => m.status === "Overdue").length,
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              <h1 className="text-lg font-semibold">List of Maintenances</h1>
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
                  <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Total</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{summaryStats.total}</div>
                <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Maintenance records
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Completed</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">{summaryStats.completed}</div>
                <p className="text-xs text-muted-foreground group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">
                  Finished tasks
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">In Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{summaryStats.inProgress}</div>
                <p className="text-xs text-muted-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Active work
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800 group-hover:scale-110 transition-all duration-300">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Overdue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300">{summaryStats.overdue}</div>
                <p className="text-xs text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                  Needs attention
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
                      placeholder="Search maintenances..."
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
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Maintenances Table */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records</CardTitle>
              <CardDescription>
                Complete record of maintenance activities for tracking service history
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
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[120px]">Priority</TableHead>
                        <TableHead className="w-[150px]">Scheduled Date</TableHead>
                        <TableHead className="w-[150px]">Technician</TableHead>
                        <TableHead className="w-[120px]">Cost</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMaintenances.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell className="font-medium">{maintenance.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{maintenance.assetName}</div>
                              <div className="text-sm text-muted-foreground">{maintenance.assetId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{maintenance.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(maintenance.status)}>
                              {maintenance.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(maintenance.priority || "Medium")}>
                              {maintenance.priority || "Medium"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(maintenance.scheduledDate).toLocaleDateString()}</TableCell>
                          <TableCell>{maintenance.technician}</TableCell>
                          <TableCell>${maintenance.cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMaintenance(maintenance)
                                  setIsFormOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteMaintenance(maintenance)}
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
        <MaintenanceFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) {
              setEditingMaintenance(undefined)
            }
          }}
          maintenance={editingMaintenance}
          assets={assets}
          onSubmit={editingMaintenance ? handleUpdateMaintenance : handleAddMaintenance}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={!!deleteMaintenance}
          onOpenChange={(open) => {
            if (!open) setDeleteMaintenance(undefined)
          }}
          onConfirm={handleDeleteMaintenance}
          itemType="maintenance"
          itemName={deleteMaintenance?.assetName}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
