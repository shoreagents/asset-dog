"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ArrowLeft, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

// Form validation schema
const assetFormSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required").max(20, "Asset ID must be 20 characters or less"),
  name: z.string().min(1, "Asset name is required").max(100, "Asset name must be 100 characters or less"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  purchaseDate: z.date().min(new Date("1900-01-01"), "Purchase date is required"),
  cost: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= 0
  }, "Cost must be a valid positive number"),
  location: z.string().min(1, "Location is required"),
  assignedTo: z.string().optional(),
  department: z.string().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  warrantyExpiry: z.date().optional(),
  notes: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>

// Sample data for dropdowns
const categories = [
  "IT Equipment",
  "Furniture", 
  "Vehicle",
  "Security Equipment",
  "Office Equipment",
  "Machinery",
  "Tools",
  "Other"
]

const locations = [
  "New York Office - Floor 1",
  "New York Office - Floor 2", 
  "New York Office - Floor 3",
  "New York Office - IT Room",
  "New York Office - Meeting Room A",
  "New York Office - Meeting Room B",
  "New York Office - Parking Garage",
  "Chicago Office - Main Floor",
  "Chicago Office - IT Room",
  "Chicago Office - Entrance",
  "Remote - Employee Home",
  "Warehouse - Section A",
  "Warehouse - Section B"
]

const departments = [
  "IT Department",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
  "Security",
  "Facilities",
  "Executive",
  "Sales",
  "Customer Service"
]

const employees = [
  "John Smith",
  "Sarah Johnson", 
  "Mike Wilson",
  "Emily Davis",
  "David Brown",
  "Lisa Anderson",
  "Chris Taylor",
  "Amanda White",
  "James Miller",
  "Jennifer Garcia"
]

export default function AddAssetPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      assetId: "",
      name: "",
      category: "",
      description: "",
      cost: "",
      location: "",
      assignedTo: "",
      department: "",
      serialNumber: "",
      manufacturer: "",
      model: "",
      notes: "",
    },
  })

  const onSubmit = async (data: AssetFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Asset data:", data)
      
      // Show success toast notification
      
      toast.success("Asset created successfully!", {
        description: `${data.name} has been added to your inventory.`,
        duration: 4000,
      })
      
      // Redirect back to assets list
      router.push("/assets")
    } catch (error) {
      console.error("Error creating asset:", error)
      toast.error("Failed to create asset", {
        description: "Please try again or contact support if the issue persists.",
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
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
                  <BreadcrumbLink href="/assets">
                    Assets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Asset</BreadcrumbPage>
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
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.back()}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Add New Asset</h1>
              </div>
              <p className="text-muted-foreground">
                Register a new asset in your inventory system
              </p>
            </div>
          </div>

          {/* Asset Form */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
              <CardDescription>
                Fill in the details below to register a new asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        Basic Information
                      </CardTitle>
                      <CardDescription>
                        Essential details about the asset
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="assetId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Asset ID *</FormLabel>
                                <FormControl>
                                  <Input placeholder="AST-001" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Unique identifier for the asset
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Asset Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder='MacBook Pro 16"' {...field} />
                                </FormControl>
                                <FormDescription>
                                  Descriptive name of the asset
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map(category => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a location" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {locations.map(location => (
                                      <SelectItem key={location} value={location}>
                                        {location}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        Financial Information
                      </CardTitle>
                      <CardDescription>
                        Purchase details and cost information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="purchaseDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Purchase Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Cost *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="2999.99" 
                                  type="number" 
                                  step="0.01" 
                                  min="0"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Purchase cost in dollars
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assignment Information */}
                  <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        Assignment Information
                      </CardTitle>
                      <CardDescription>
                        Assign the asset to a person or department
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned To</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an employee" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {employees.map(employee => (
                                    <SelectItem key={employee} value={employee}>
                                      {employee}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Person responsible for this asset
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">No Department</SelectItem>
                                  {departments.map(department => (
                                    <SelectItem key={department} value={department}>
                                      {department}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Department this asset belongs to
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        Additional Information
                      </CardTitle>
                      <CardDescription>
                        Any additional notes or special information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional notes about this asset..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Any additional information or special notes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-6">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 md:flex-none"
                    >
                      {isSubmitting ? (
                        "Creating Asset..."
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Asset
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
