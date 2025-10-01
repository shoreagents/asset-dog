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
import { DataManager } from "@/lib/lists-data"
import { setupDataManager } from "@/lib/setup-data"
import AssetFieldManager, { AnyAssetField } from "@/lib/asset-field-manager"

// Dynamic form schema generator
const createAssetFormSchema = (fields: AnyAssetField[]) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {}
  
  fields.forEach(field => {
    if (!field.included) return
    
    let fieldSchema: z.ZodTypeAny
    
    switch (field.type) {
      case 'text':
      case 'textarea':
        fieldSchema = z.string()
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`)
        } else {
          fieldSchema = fieldSchema.optional()
        }
        break
      case 'number':
        fieldSchema = z.string().refine((val) => {
          if (!field.required && !val) return true
          const num = parseFloat(val)
          return !isNaN(num) && num >= 0
        }, `${field.label} must be a valid positive number`)
        if (field.required) {
          fieldSchema = fieldSchema.refine((val) => val !== "", `${field.label} is required`)
        }
        break
      case 'date':
        fieldSchema = z.date()
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodDate).min(new Date("1900-01-01"), `${field.label} is required`)
        } else {
          fieldSchema = fieldSchema.optional()
        }
        break
      case 'select':
        fieldSchema = z.string()
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`)
        } else {
          fieldSchema = fieldSchema.optional()
        }
        break
      default:
        fieldSchema = field.required ? z.string().min(1, `${field.label} is required`) : z.string().optional()
    }
    
    schemaObject[field.name] = fieldSchema
  })
  
  return z.object(schemaObject)
}

// Get dynamic data from setup manager
const categories = setupDataManager.getCategories()
const locations = setupDataManager.getLocations()
const departments = setupDataManager.getDepartments()
const employees = setupDataManager.getEmployees()
const manufacturers = setupDataManager.getManufacturers()

export default function AddAssetPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [fields, setFields] = React.useState<AnyAssetField[]>([])
  const [assetFormSchema, setAssetFormSchema] = React.useState<z.ZodObject<Record<string, z.ZodTypeAny>>>(z.object({}))
  const [isLoading, setIsLoading] = React.useState(true)

  const fieldManager = AssetFieldManager.getInstance()

  // Load dynamic fields
  React.useEffect(() => {
    const loadedFields = fieldManager.getIncludedFields()
    setFields(loadedFields)
    setAssetFormSchema(createAssetFormSchema(loadedFields))
    setIsLoading(false)

    // Subscribe to field changes
    const unsubscribe = fieldManager.subscribe((updatedFields) => {
      const includedFields = updatedFields.filter(field => field.included)
      setFields(includedFields)
      setAssetFormSchema(createAssetFormSchema(includedFields))
    })

    return unsubscribe
  }, [fieldManager])

  // Create default values dynamically
  const createDefaultValues = (fields: AnyAssetField[]) => {
    const defaults: Record<string, string | Date | undefined> = {}
    fields.forEach(field => {
      if (field.included) {
        // Ensure all fields have defined values to prevent uncontrolled to controlled warnings
        if (field.type === 'date') {
          defaults[field.name] = undefined
        } else if (field.type === 'number') {
          defaults[field.name] = ""
        } else {
          defaults[field.name] = ""
        }
      }
    })
    return defaults
  }

  const form = useForm({
    resolver: zodResolver(assetFormSchema),
    defaultValues: createDefaultValues(fields),
  })

  // Update form when fields change
  React.useEffect(() => {
    if (fields.length > 0 && !isLoading) {
      const defaultValues = createDefaultValues(fields)
      form.reset(defaultValues)
    }
  }, [fields, form, isLoading])

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)
    
    try {
      // Create the asset object with all form data
      const assetData = {
        name: String(data.name || ''),
        description: String(data.description || ''),
        category: String(data.category || ''),
        location: String(data.location || ''),
        department: String(data.department || ''),
        purchaseDate: data.purchaseDate ? format(data.purchaseDate as Date, "yyyy-MM-dd") : '',
        assignedTo: String(data.assignedTo || ''),
        ...data,
        // Convert date fields to ISO strings if they exist
        ...Object.keys(data).reduce((acc, key) => {
          const field = fields.find(f => f.name === key)
          if (field?.type === 'date' && data[key] instanceof Date) {
            acc[key] = format(data[key] as Date, "yyyy-MM-dd")
          } else if (data[key] !== undefined) {
            acc[key] = String(data[key])
          }
          return acc
        }, {} as Record<string, string>),
        status: "Available" as "Available" | "In Use" | "Maintenance" | "Disposed",
        value: data.cost ? parseFloat(String(data.cost)) || 0 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save the asset using DataManager
      const dataManager = DataManager.getInstance()
      const newAsset = dataManager.addAsset(assetData)

      console.log("Asset created:", newAsset)

      toast.success("Asset created successfully!", {
        description: `Asset has been added to your inventory.`,
        duration: 4000,
      })

      router.push("/assets")
    } catch (error) {
      console.error("Failed to create asset:", error)
      toast.error("Failed to create asset", {
        description: "Please try again or contact support if the issue persists.",
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group fields into 2 cards only
  const groupFieldsByCategory = (fields: AnyAssetField[]) => {
    const groups: { [key: string]: AnyAssetField[] } = {
      'Asset Information': [],
      'Additional Information': []
    }

    fields.forEach(field => {
      // All standard fields go to "Asset Information"
      // All custom fields go to "Additional Information"
      if (field.isStandard === false) {
        groups['Additional Information'].push(field)
      } else {
        groups['Asset Information'].push(field)
      }
    })

    // Remove empty groups
    return Object.entries(groups).filter(([, fields]) => fields.length > 0)
  }

  // Dynamic field renderer
  const renderField = (field: AnyAssetField) => {
    const fieldName = field.name as keyof typeof form.control._formValues

    switch (field.type) {
      case 'textarea':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={String(formField.value || "")}
                    onChange={formField.onChange}
                    onBlur={formField.onBlur}
                    name={formField.name}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={String(formField.value || "")}
                    onChange={formField.onChange}
                    onBlur={formField.onBlur}
                    name={formField.name}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value instanceof Date ? (
                          format(formField.value, "PPP")
                        ) : (
                          <span>{field.placeholder || `Select ${field.label.toLowerCase()}`}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value instanceof Date ? formField.value : undefined}
                      onSelect={formField.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'select':
        // Determine options based on field name
        let options: { value: string; label: string }[] = []
        
        if (field.name === 'category') {
          options = categories.map(cat => ({ value: cat.id, label: cat.name }))
        } else if (field.name === 'location') {
          options = locations.map(loc => ({ value: loc.id, label: loc.name }))
        } else if (field.name === 'department') {
          options = departments.map(dept => ({ value: dept.id, label: dept.name }))
        } else if (field.name === 'assignedTo') {
          options = employees.map(emp => ({ value: emp.id, label: emp.name }))
        } else if (field.name === 'manufacturer') {
          options = manufacturers.map(mfr => ({ value: mfr.id, label: mfr.name }))
        } else if (field.options) {
          options = field.options.map(opt => ({ value: opt, label: opt }))
        }

        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Select onValueChange={formField.onChange} value={String(formField.value || "")}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={String(formField.value || "")}
                    onChange={formField.onChange}
                    onBlur={formField.onBlur}
                    name={formField.name}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/assets">Assets</BreadcrumbLink>
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

        {/* Color-coded header bar for Add Asset */}
        <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>

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
                  <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                  <h1 className="text-3xl font-bold tracking-tight">Add New Asset</h1>
                </div>
              </div>
              <p className="text-muted-foreground ml-6">
                Register a new asset in your inventory system
              </p>
            </div>
          </div>

          {/* Asset Form */}
          {isLoading || fields.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      {isLoading ? "Loading field configuration..." : "No fields configured"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please configure your asset fields in{" "}
                      <a href="/setup/databases/assets-table" className="text-primary hover:underline">
                        Database Assets
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Grouped Fields in Separate Cards */}
                {groupFieldsByCategory(fields).map(([categoryName, categoryFields]) => (
                  <Card key={categoryName}>
                    <CardHeader>
                      <CardTitle className="text-lg">{categoryName}</CardTitle>
                      <CardDescription>
                        {categoryName === 'Additional Information' 
                          ? 'Custom fields configured for your assets'
                          : 'Essential asset information for registration'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {categoryFields.map((field) => renderField(field))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Form Actions - Centered for better UX */}
                <div className="flex justify-center gap-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[120px]"
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
                </div>
              </form>
            </Form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
