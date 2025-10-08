"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMaintenance } from "@/hooks/use-maintenance"
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Wrench, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  X
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function MaintenancesListPage() {
  const router = useRouter()
  const { maintenanceRecords, isLoading, error, loadMaintenanceRecords, updateMaintenanceRecord, deleteMaintenanceRecord } = useMaintenance()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Filter maintenance records
  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = 
      record.maintenance_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.maintenance_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assets?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assets?.asset_tag_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (recordId: string, newStatus: string) => {
    setIsUpdating(recordId)
    try {
      const result = await updateMaintenanceRecord(recordId, { 
        status: newStatus as any,
        date_completed: newStatus === "completed" ? new Date().toISOString() : undefined
      })
      
      if (result.success) {
        toast.success("Maintenance status updated successfully")
      } else {
        toast.error("Failed to update maintenance status")
      }
    } catch (error) {
      console.error("Error updating maintenance status:", error)
      toast.error("Failed to update maintenance status")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return
    }

    try {
      await deleteMaintenanceRecord(recordId)
      toast.success("Maintenance record deleted successfully")
    } catch (error) {
      console.error("Error deleting maintenance record:", error)
      toast.error("Failed to delete maintenance record")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "in_progress":
        return <Wrench className="h-4 w-4 text-orange-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "secondary"
      case "in_progress":
        return "default"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
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
                  <BreadcrumbPage>Maintenances</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        {/* Color-coded header bar for Maintenances */}
        <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>

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
                  <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Maintenance Records</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                View and manage all maintenance records for assets
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/assets/maintenance">
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, provider, or asset..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Maintenance Records ({filteredRecords.length})
              </CardTitle>
              <CardDescription>
                All maintenance records for assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading maintenance records...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-red-500 mb-4">⚠️</div>
                    <p className="text-red-600 font-medium">Failed to load maintenance records</p>
                    <p className="text-muted-foreground text-sm mt-2">{error}</p>
                  </div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No maintenance records found</p>
                    <p className="text-muted-foreground text-sm mt-2">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your filters" 
                        : "Schedule maintenance for assets to see records here"
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Maintenance Title</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Repeating</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.assets?.asset_tag_id || record.asset_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {record.assets?.name || 'Unknown Asset'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.maintenance_title}</div>
                              {record.maintenance_details && (
                                <div className="text-sm text-muted-foreground">
                                  {record.maintenance_details.substring(0, 50)}
                                  {record.maintenance_details.length > 50 && '...'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {record.maintenance_by}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(record.maintenance_due_date), "MMM dd, yyyy")}
                            </div>
                            {record.date_completed && (
                              <div className="text-sm text-green-600">
                                Completed: {format(new Date(record.date_completed), "MMM dd, yyyy")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(record.status)}
                              <Badge variant={getStatusBadgeVariant(record.status) as any}>
                                {record.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              ₱{record.maintenance_cost.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.is_repeating ? "default" : "outline"}>
                              {record.is_repeating ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={record.status}
                                onValueChange={(value) => handleStatusUpdate(record.id, value)}
                                disabled={isUpdating === record.id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecord(record.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}