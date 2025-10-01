"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ArrowRight, Plus, Edit, Trash2, Save, X, Layers } from "lucide-react"
import { toast } from "sonner"

interface Department {
  id: string
  name: string
  description: string
  manager?: string
  budgetCode?: string
  assetCount: number
  isActive: boolean
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: "1",
      name: "SHORAGENTS - CROWDCOPIA",
      description: "Crowdcopia project department",
      manager: "John Smith",
      budgetCode: "SC-2024",
      assetCount: 25,
      isActive: true
    },
    {
      id: "2",
      name: "SHORE 360 - ALLEGRA VENTURES",
      description: "Allegra Ventures partnership",
      manager: "Sarah Johnson",
      budgetCode: "SA-2024",
      assetCount: 18,
      isActive: true
    },
    {
      id: "3",
      name: "SHORE AGENTS",
      description: "Main shore agents department",
      manager: "Mike Wilson",
      budgetCode: "SAG-2024",
      assetCount: 32,
      isActive: true
    },
    {
      id: "4",
      name: "SHORE REMOTE",
      description: "Remote operations department",
      manager: "Lisa Brown",
      budgetCode: "SR-2024",
      assetCount: 15,
      isActive: true
    },
    {
      id: "5",
      name: "SHORE360 - TOTAL TECHNOLOGIES",
      description: "Total Technologies collaboration",
      manager: "David Lee",
      budgetCode: "ST-2024",
      assetCount: 28,
      isActive: true
    },
    {
      id: "6",
      name: "SHORE360 - 3 STACK PTY LTD",
      description: "3 Stack Pty Ltd partnership",
      manager: "Emma Davis",
      budgetCode: "S3-2024",
      assetCount: 22,
      isActive: true
    },
    {
      id: "7",
      name: "SHORE360 - ACCESS REHABILITATION EQUIPMENT",
      description: "Access rehabilitation equipment",
      manager: "Tom Anderson",
      budgetCode: "SAR-2024",
      assetCount: 12,
      isActive: true
    },
    {
      id: "8",
      name: "SHORE360 - ACCOUNT MANAGEMENT",
      description: "Account management operations",
      manager: "Rachel Green",
      budgetCode: "SAM-2024",
      assetCount: 35,
      isActive: true
    },
    {
      id: "9",
      name: "SHORE360 - ACCOUNT MANAGER",
      description: "Account manager department",
      manager: "Chris Taylor",
      budgetCode: "SAMG-2024",
      assetCount: 20,
      isActive: true
    },
    {
      id: "10",
      name: "SHORE360 - ADLLINS MEDIA",
      description: "Adllins Media collaboration",
      manager: "Anna Martinez",
      budgetCode: "SAD-2024",
      assetCount: 16,
      isActive: true
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: "",
    description: "",
    manager: "",
    budgetCode: "",
    isActive: true
  })

  const handleAdd = () => {
    if (!newDepartment.name) {
      toast.error("Please fill in all required fields")
      return
    }

    const department: Department = {
      id: Date.now().toString(),
      name: newDepartment.name!,
      description: newDepartment.description || "",
      manager: newDepartment.manager || "",
      budgetCode: newDepartment.budgetCode || "",
      assetCount: 0,
      isActive: newDepartment.isActive!
    }

    setDepartments(prev => [...prev, department])
    setNewDepartment({
      name: "",
      description: "",
      manager: "",
      budgetCode: "",
      isActive: true
    })
    setIsAdding(false)
    toast.success("Department added successfully!")
  }

  const handleEdit = (department: Department) => {
    setEditingId(department.id)
  }

  const handleSave = (id: string) => {
    setEditingId(null)
    toast.success("Department updated successfully!")
  }

  const handleDelete = (id: string) => {
    setDepartments(prev => prev.filter(department => department.id !== id))
    toast.success("Department deleted successfully!")
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setNewDepartment({
      name: "",
      description: "",
      manager: "",
      budgetCode: "",
      isActive: true
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Departments</h1>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 sm:p-6 md:p-8 pt-0">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/setup">Setup</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Departments</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                <p className="text-muted-foreground">
                  Manage organizational departments
                </p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Department
              </Button>
            </div>

            {/* Add Department Form */}
            {isAdding && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Department</CardTitle>
                  <CardDescription>
                    Enter the details for the new department
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Department Name *</label>
                      <Input
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter department name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={newDepartment.description}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Manager</label>
                      <Input
                        value={newDepartment.manager}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, manager: e.target.value }))}
                        placeholder="Enter manager name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Budget Code</label>
                      <Input
                        value={newDepartment.budgetCode}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, budgetCode: e.target.value }))}
                        placeholder="Enter budget code"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Add Department
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Departments Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Departments ({departments.length})
                </CardTitle>
                <CardDescription>
                  Manage organizational departments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Departments Table */}
                <ScrollArea className="h-[600px]">
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Manager</TableHead>
                          <TableHead>Assets</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.map((department) => (
                          <TableRow key={department.id}>
                            <TableCell className="font-medium">{department.name}</TableCell>
                            <TableCell>{department.description}</TableCell>
                            <TableCell>{department.manager}</TableCell>
                            <TableCell>{department.assetCount}</TableCell>
                            <TableCell>
                              <Badge variant={department.isActive ? "default" : "secondary"}>
                                {department.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(department)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(department.id)}
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
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}