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

interface Category {
  id: string
  name: string
  description: string
  assetCount: number
  isActive: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "COMMUNICATION AND WATCHES",
      description: "Communication devices and timepieces",
      assetCount: 15,
      isActive: true
    },
    {
      id: "2",
      name: "COMPUTER - MAIN ITEMS",
      description: "Primary computer equipment and devices",
      assetCount: 45,
      isActive: true
    },
    {
      id: "3",
      name: "COMPUTER ACCESSORIES",
      description: "Computer peripherals and accessories",
      assetCount: 23,
      isActive: true
    },
    {
      id: "4",
      name: "FIRE EQUIPMENT",
      description: "Fire safety and emergency equipment",
      assetCount: 8,
      isActive: true
    },
    {
      id: "5",
      name: "HARDWARE AND OFFICE ESSENTIALS",
      description: "Office hardware and essential supplies",
      assetCount: 12,
      isActive: true
    },
    {
      id: "6",
      name: "MEDICAL SUPPLIES",
      description: "Medical equipment and supplies",
      assetCount: 6,
      isActive: true
    },
    {
      id: "7",
      name: "NETWORK DEVICE",
      description: "Networking equipment and devices",
      assetCount: 15,
      isActive: true
    },
    {
      id: "8",
      name: "OFFICE ELECTRONICS AND KITCHEN EQUIPMENT",
      description: "Office electronics and kitchen appliances",
      assetCount: 20,
      isActive: true
    },
    {
      id: "9",
      name: "OFFICE FURNITURE",
      description: "Office furniture and fixtures",
      assetCount: 30,
      isActive: true
    },
    {
      id: "10",
      name: "PHOTOGRAPHY AND VIDEOGRAPHY",
      description: "Photography and video equipment",
      assetCount: 7,
      isActive: true
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: "",
    isActive: true
  })

  const handleAdd = () => {
    if (!newCategory.name) {
      toast.error("Please fill in all required fields")
      return
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name!,
      description: newCategory.description || "",
      assetCount: 0,
      isActive: newCategory.isActive!
    }

    setCategories(prev => [...prev, category])
    setNewCategory({
      name: "",
      description: "",
      isActive: true
    })
    setIsAdding(false)
    toast.success("Category added successfully!")
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
  }

  const handleSave = (id: string) => {
    setEditingId(null)
    toast.success("Category updated successfully!")
  }

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id))
    toast.success("Category deleted successfully!")
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setNewCategory({
      name: "",
      description: "",
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
              <h1 className="text-lg font-semibold">Categories</h1>
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
                  <BreadcrumbPage>Categories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                <p className="text-muted-foreground">
                  Manage asset categories and types
                </p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            {/* Add Category Form */}
            {isAdding && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Category</CardTitle>
                  <CardDescription>
                    Enter the details for the new category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category Name *</label>
                      <Input
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={newCategory.description}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter description"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Add Category
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Categories ({categories.length})
                </CardTitle>
                <CardDescription>
                  Manage asset categories and types
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Categories Table */}
                <ScrollArea className="h-[600px]">
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Assets</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>{category.assetCount}</TableCell>
                            <TableCell>
                              <Badge variant={category.isActive ? "default" : "secondary"}>
                                {category.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(category.id)}
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