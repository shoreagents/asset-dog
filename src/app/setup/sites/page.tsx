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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ArrowRight, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface Site {
  id: string
  name: string
  description: string
  address: string
  aptSuite: string
  city: string
  state: string
  zip: string
  country: string
  assetCount: number
  isActive: boolean
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([
    {
      id: "1",
      name: "Main Office",
      description: "Primary company headquarters",
      address: "123 Business Street",
      aptSuite: "Suite 100",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "United States",
      assetCount: 45,
      isActive: true
    },
    {
      id: "2",
      name: "Branch Office",
      description: "Secondary office location",
      address: "456 Commerce Avenue",
      aptSuite: "Floor 2",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "United States",
      assetCount: 23,
      isActive: true
    },
    {
      id: "3",
      name: "Warehouse",
      description: "Storage and distribution facility",
      address: "789 Industrial Boulevard",
      aptSuite: "",
      city: "Detroit",
      state: "MI",
      zip: "48201",
      country: "United States",
      assetCount: 8,
      isActive: true
    },
    {
      id: "4",
      name: "Data Center",
      description: "Server and IT infrastructure facility",
      address: "321 Technology Drive",
      aptSuite: "Building A",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      assetCount: 12,
      isActive: true
    },
    {
      id: "5",
      name: "Research Lab",
      description: "Research and development facility",
      address: "654 Innovation Way",
      aptSuite: "Lab Complex",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "United States",
      assetCount: 6,
      isActive: true
    },
    {
      id: "6",
      name: "Manufacturing Plant",
      description: "Production and manufacturing facility",
      address: "987 Production Road",
      aptSuite: "",
      city: "Houston",
      state: "TX",
      zip: "77001",
      country: "United States",
      assetCount: 15,
      isActive: true
    },
    {
      id: "7",
      name: "Customer Service Center",
      description: "Customer support and service facility",
      address: "147 Service Plaza",
      aptSuite: "Unit 200",
      city: "Phoenix",
      state: "AZ",
      zip: "85001",
      country: "United States",
      assetCount: 20,
      isActive: true
    },
    {
      id: "8",
      name: "Training Center",
      description: "Employee training and development facility",
      address: "258 Learning Lane",
      aptSuite: "Conference Wing",
      city: "Denver",
      state: "CO",
      zip: "80201",
      country: "United States",
      assetCount: 3,
      isActive: true
    },
    {
      id: "9",
      name: "Remote Office",
      description: "Remote work and satellite office",
      address: "369 Satellite Street",
      aptSuite: "Office 15",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      country: "United States",
      assetCount: 1,
      isActive: true
    },
    {
      id: "10",
      name: "Distribution Hub",
      description: "Regional distribution and logistics center",
      address: "741 Logistics Loop",
      aptSuite: "",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "United States",
      assetCount: 7,
      isActive: true
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newSite, setNewSite] = useState<Partial<Site>>({
    name: "",
    description: "",
    address: "",
    aptSuite: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isActive: true
  })

  const countries = [
    "United States",
    "Canada", 
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Mexico",
    "Philippines",
    "Singapore",
    "South Korea",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
    "Italy",
    "Spain",
    "Other"
  ]

  const handleAdd = () => {
    if (!newSite.name) {
      toast.error("Please fill in all required fields")
      return
    }

    const site: Site = {
      id: Date.now().toString(),
      name: newSite.name!,
      description: newSite.description || "",
      address: newSite.address || "",
      aptSuite: newSite.aptSuite || "",
      city: newSite.city || "",
      state: newSite.state || "",
      zip: newSite.zip || "",
      country: newSite.country || "",
      assetCount: 0,
      isActive: newSite.isActive!
    }

    setSites(prev => [...prev, site])
    setNewSite({
      name: "",
      description: "",
      address: "",
      aptSuite: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      isActive: true
    })
    setIsAdding(false)
    toast.success("Site added successfully!")
  }

  const handleEdit = (site: Site) => {
    setEditingId(site.id)
  }

  const handleSave = (id: string) => {
    setEditingId(null)
    toast.success("Site updated successfully!")
  }

  const handleDelete = (id: string) => {
    setSites(prev => prev.filter(site => site.id !== id))
    toast.success("Site deleted successfully!")
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setNewSite({
      name: "",
      description: "",
      address: "",
      aptSuite: "",
      city: "",
      state: "",
      zip: "",
      country: "",
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
              <h1 className="text-lg font-semibold">Sites</h1>
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
                  <BreadcrumbPage>Sites</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
                <p className="text-muted-foreground">
                  Define physical locations where assets are located
                </p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Site
              </Button>
            </div>

            {/* Add Site Form */}
            {isAdding && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Site</CardTitle>
                  <CardDescription>
                    Enter the details for the new site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name *</Label>
                      <Input
                        id="siteName"
                        value={newSite.name}
                        onChange={(e) => setNewSite(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter site name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteCountry">Country</Label>
                      <Select
                        value={newSite.country}
                        onValueChange={(value) => setNewSite(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={newSite.description}
                      onChange={(e) => setNewSite(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter site description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteAddress">Address</Label>
                    <Input
                      id="siteAddress"
                      value={newSite.address}
                      onChange={(e) => setNewSite(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteAptSuite">Apt. / Suite</Label>
                      <Input
                        id="siteAptSuite"
                        value={newSite.aptSuite}
                        onChange={(e) => setNewSite(prev => ({ ...prev, aptSuite: e.target.value }))}
                        placeholder="Enter apartment or suite"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteCity">City</Label>
                      <Input
                        id="siteCity"
                        value={newSite.city}
                        onChange={(e) => setNewSite(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteState">State</Label>
                      <Input
                        id="siteState"
                        value={newSite.state}
                        onChange={(e) => setNewSite(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteZip">Postal Code</Label>
                    <Input
                      id="siteZip"
                      value={newSite.zip}
                      onChange={(e) => setNewSite(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Add Site
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sites Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sites ({sites.length})</CardTitle>
                <CardDescription>
                  Manage physical locations for your assets
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Site Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Assets</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sites.map((site) => (
                          <TableRow key={site.id}>
                            <TableCell className="font-medium">{site.name}</TableCell>
                            <TableCell>{site.description}</TableCell>
                            <TableCell>{site.address}</TableCell>
                            <TableCell>{site.city}</TableCell>
                            <TableCell>{site.state}</TableCell>
                            <TableCell>{site.country}</TableCell>
                            <TableCell>{site.assetCount}</TableCell>
                            <TableCell>
                              <Badge variant={site.isActive ? "default" : "secondary"}>
                                {site.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(site)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(site.id)}
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