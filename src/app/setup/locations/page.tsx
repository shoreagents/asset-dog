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

interface Location {
  id: string
  name: string
  description: string
  site: string
  floor?: string
  room?: string
  assetCount: number
  isActive: boolean
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "1",
      name: "IT - SERVER ROOM",
      description: "Climate-controlled room housing IT servers and equipment",
      site: "B26",
      floor: "Basement",
      room: "Room B02",
      assetCount: 2,
      isActive: true
    },
    {
      id: "2",
      name: "IT - STOCK ROOM",
      description: "Secure storage room for IT equipment and devices",
      site: "B26",
      floor: "Ground Floor",
      room: "Room 101",
      assetCount: 8,
      isActive: true
    },
    {
      id: "3",
      name: "RECEPTION AREA",
      description: "Building main entrance and reception area",
      site: "B26",
      floor: "Ground Floor",
      room: "Lobby",
      assetCount: 1,
      isActive: true
    },
    {
      id: "4",
      name: "RETURN TO CLIENT",
      description: "Area for assets being returned to clients",
      site: "B26",
      floor: "Ground Floor",
      room: "Room 103",
      assetCount: 0,
      isActive: true
    },
    {
      id: "5",
      name: "UNIT 1",
      description: "First unit office space",
      site: "B26",
      floor: "1st Floor",
      room: "Unit 1",
      assetCount: 2,
      isActive: true
    },
    {
      id: "6",
      name: "UNIT 2",
      description: "Second unit office space",
      site: "B26",
      floor: "1st Floor",
      room: "Unit 2",
      assetCount: 1,
      isActive: true
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: "",
    description: "",
    site: "",
    floor: "",
    room: "",
    isActive: true
  })

  const sites = ["B26", "B28", "B43", "BC6", "BC7", "CEBU", "HAULER", "LEASED", "MBC", "RESOURCE SYSTEM"]

  const handleAdd = () => {
    if (!newLocation.name || !newLocation.site) {
      toast.error("Please fill in all required fields")
      return
    }

    const location: Location = {
      id: Date.now().toString(),
      name: newLocation.name!,
      description: newLocation.description || "",
      site: newLocation.site!,
      floor: newLocation.floor || "",
      room: newLocation.room || "",
      assetCount: 0,
      isActive: newLocation.isActive!
    }

    setLocations(prev => [...prev, location])
    setNewLocation({
      name: "",
      description: "",
      site: "",
      floor: "",
      room: "",
      isActive: true
    })
    setIsAdding(false)
    toast.success("Location added successfully!")
  }

  const handleEdit = (location: Location) => {
    setEditingId(location.id)
  }

  const handleSave = (id: string) => {
    setEditingId(null)
    toast.success("Location updated successfully!")
  }

  const handleDelete = (id: string) => {
    setLocations(prev => prev.filter(location => location.id !== id))
    toast.success("Location deleted successfully!")
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setNewLocation({
      name: "",
      description: "",
      site: "",
      floor: "",
      room: "",
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
              <h1 className="text-lg font-semibold">Locations</h1>
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
                  <BreadcrumbPage>Locations</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
                <p className="text-muted-foreground">
                  Define specific areas within sites (floors, rooms, storage)
                </p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Location
              </Button>
            </div>

            {/* Add Location Form */}
            {isAdding && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Location</CardTitle>
                  <CardDescription>
                    Enter the details for the new location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="locationName">Location Name *</Label>
                      <Input
                        id="locationName"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter location name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locationSite">Site *</Label>
                      <Select
                        value={newLocation.site}
                        onValueChange={(value) => setNewLocation(prev => ({ ...prev, site: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map(site => (
                            <SelectItem key={site} value={site}>
                              {site}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationDescription">Description</Label>
                    <Textarea
                      id="locationDescription"
                      value={newLocation.description}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter location description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="locationFloor">Floor</Label>
                      <Input
                        id="locationFloor"
                        value={newLocation.floor}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, floor: e.target.value }))}
                        placeholder="Enter floor (e.g., 1st Floor, Basement)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locationRoom">Room</Label>
                      <Input
                        id="locationRoom"
                        value={newLocation.room}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, room: e.target.value }))}
                        placeholder="Enter room (e.g., Room 101, Open Office)"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Add Location
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Locations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Locations ({locations.length})</CardTitle>
                <CardDescription>
                  Manage specific areas within your sites
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Location Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Floor</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Assets</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map((location) => (
                          <TableRow key={location.id}>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            <TableCell>{location.description}</TableCell>
                            <TableCell>{location.site}</TableCell>
                            <TableCell>{location.floor}</TableCell>
                            <TableCell>{location.room}</TableCell>
                            <TableCell>{location.assetCount}</TableCell>
                            <TableCell>
                              <Badge variant={location.isActive ? "default" : "secondary"}>
                                {location.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(location)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(location.id)}
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