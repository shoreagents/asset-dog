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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
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
import { CalendarIcon, ArrowLeft, Save, Plus, X, Loader2, Upload, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { DataManager } from "@/lib/lists-data"
import { setupDataManager } from "@/lib/setup-data"
import AssetFieldManager, { AnyAssetField } from "@/lib/asset-field-manager"
import { assetService, CreateAssetData } from "@/lib/asset-service"
import { createAsset } from "@/lib/asset-api"
import { validateAssetIdFormat, checkAssetIdExists, suggestAssetId } from "@/lib/asset-validation"

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
      case 'file':
        fieldSchema = z.any().optional() // File objects are handled separately
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
  
  // Get field manager instance
  const fieldManager = AssetFieldManager.getInstance()
  
  // Get default fields for instant form display
  const getDefaultFields = (): AnyAssetField[] => {
    // Create default fields using the same structure as AssetFieldManager
    const defaultFields: AnyAssetField[] = [
      {
        id: 'asset-tag-id',
        name: 'assetTagId',
        type: 'text',
        label: 'Asset Tag ID',
        description: 'Unique asset identifier',
        required: true,
        included: true,
        example: 'PT2021-0994',
        placeholder: 'Enter asset tag ID',
        isStandard: true
      },
      {
        id: 'asset-name',
        name: 'name',
        type: 'text',
        label: 'Asset Name',
        description: 'Name/title of the asset',
        required: true,
        included: true,
        example: 'Dell Laptop XPS 13',
        placeholder: 'Enter asset name',
        isStandard: true
      },
      {
        id: 'asset-description',
        name: 'description',
        type: 'textarea',
        label: 'Asset Description',
        description: 'Description of the asset',
        required: true,
        included: true,
        example: 'SEE SUB-CATEGORY',
        placeholder: 'Enter asset description',
        isStandard: true
      },
      {
        id: 'category',
        name: 'category',
        type: 'select',
        label: 'Category',
        description: 'Asset category',
        required: false,
        included: true,
        options: ['COMPUTER - MAIN ITEMS', 'OFFICE FURNITURE', 'NETWORK DEVICE', 'FIRE EQUIPMENT', 'HARDWARE AND OFFICE ESSENTIALS', 'PHOTOGRAPHY AND VIDEOGRAPHY', 'COMMUNICATION AND WATCHES', 'OFFICE ELECTRONICS AND KITCHEN EQUIPMENT', 'COMPUTER ACCESSORIES'],
        placeholder: 'Select category',
        isStandard: false,
        dataType: 'Text'
      },
      {
        id: 'sub-category',
        name: 'subCategory',
        type: 'select',
        label: 'Sub Category',
        description: 'Asset sub-category',
        required: false,
        included: true,
        options: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Server', 'Network Switch', 'Router', 'Tablet', 'Phone', 'Other'],
        placeholder: 'Select sub-category',
        isStandard: false,
        dataType: 'Text'
      },
      {
        id: 'location',
        name: 'location',
        type: 'select',
        label: 'Location',
        description: 'Current location of the asset',
        required: false,
        included: true,
        options: ['Office A', 'Office B', 'Warehouse', 'Remote'],
        placeholder: 'Select location',
        isStandard: false,
        dataType: 'Text'
      },
      {
        id: 'assignedTo',
        name: 'assignedTo',
        type: 'select',
        label: 'Assigned To',
        description: 'Person assigned to this asset',
        required: false,
        included: true,
        options: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        placeholder: 'Select assigned person',
        isStandard: false,
        dataType: 'Text'
      },
      {
        id: 'purchase-date',
        name: 'purchaseDate',
        type: 'date',
        label: 'Purchase Date',
        description: 'Date asset was purchased',
        required: false,
        included: true,
        example: '04/09/2021',
        placeholder: 'Select purchase date',
        isStandard: true
      },
      {
        id: 'cost',
        name: 'value',
        type: 'number',
        label: 'Cost',
        description: 'Cost of the asset',
        required: false,
        included: true,
        example: '18000',
        placeholder: 'Enter cost',
        validation: {
          min: 0,
          message: 'Cost must be a positive number'
        },
        isStandard: true
      },
      {
        id: 'brand',
        name: 'brand',
        type: 'text',
        label: 'Brand',
        description: 'Manufacturer of the asset',
        required: false,
        included: true,
        example: 'ARUBA',
        placeholder: 'Enter brand name',
        isStandard: true
      },
      {
        id: 'serial-number',
        name: 'serialNumber',
        type: 'text',
        label: 'Serial Number',
        description: 'Unique serial number of the asset',
        required: false,
        included: true,
        example: 'SN123456789',
        placeholder: 'Enter serial number',
        isStandard: true
      },
      {
        id: 'model',
        name: 'model',
        type: 'text',
        label: 'Model',
        description: 'Model name of the asset',
        required: false,
        included: true,
        example: 'ARUBA 6100 48G 4SFP+ Switch JL676A',
        placeholder: 'Enter model name',
        isStandard: true
      },
      {
        id: 'image',
        name: 'image',
        type: 'file',
        label: 'Asset Image',
        description: 'Upload an image of the asset',
        required: false,
        included: true,
        example: 'asset-photo.jpg',
        placeholder: 'Select image file',
        accept: 'image/*',
        isStandard: true
      }
    ]
    return defaultFields
  }
  
  const defaultFields = getDefaultFields()
  const [fields, setFields] = React.useState<AnyAssetField[]>(defaultFields)
  const [assetFormSchema, setAssetFormSchema] = React.useState<z.ZodObject<Record<string, z.ZodTypeAny>>>(() => createAssetFormSchema(defaultFields))
  const [isLoading, setIsLoading] = React.useState(false) // Start as false for instant loading
  const [addCategoryOpen, setAddCategoryOpen] = React.useState(false)
  const [addSubCategoryOpen, setAddSubCategoryOpen] = React.useState(false)
  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [newSubCategoryName, setNewSubCategoryName] = React.useState("")
  const [isAddingCategory, setIsAddingCategory] = React.useState(false)
  const [isAddingSubCategory, setIsAddingSubCategory] = React.useState(false)
  const [issuedToSearch, setIssuedToSearch] = React.useState("")
  const [uploadedImagePreview, setUploadedImagePreview] = React.useState<string | null>(null)
  const [qrCodePreview, setQrCodePreview] = React.useState<string | null>(null)
  const [showAssetIdDialog, setShowAssetIdDialog] = React.useState(false)
  const [showQrAssetIdDialog, setShowQrAssetIdDialog] = React.useState(false)
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null)
  
  // Independent dialog input states
  const [imageDialogAssetId, setImageDialogAssetId] = React.useState('')
  const [qrDialogAssetId, setQrDialogAssetId] = React.useState('')
  
  // Dialog states for validation errors
  const [showInvalidFormatDialog, setShowInvalidFormatDialog] = React.useState(false)
  const [formatError, setFormatError] = React.useState<string | null>(null)
  const [showDuplicateIdDialog, setShowDuplicateIdDialog] = React.useState(false)
  const [duplicateAssetId, setDuplicateAssetId] = React.useState('')
  const [suggestedAssetId, setSuggestedAssetId] = React.useState('')
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false)
  const [createdAssetId, setCreatedAssetId] = React.useState('')

  // Load dynamic fields and merge with defaults
  React.useEffect(() => {
    
    // Hard reset to clear all caches
    console.log('Performing hard reset of field configuration...')
    fieldManager.forceReset()
    
    // Ensure image field is always included
    fieldManager.ensureImageField()
    
    // Load initial fields and merge with defaults
    const loadedFields = fieldManager.getIncludedFields()
    console.log('Loaded fields after reset:', loadedFields.map(f => ({ name: f.name, type: f.type, included: f.included })))
    console.log('All fields from manager:', fieldManager.getAllFields().map(f => ({ name: f.name, type: f.type, included: f.included })))
    
    // Merge loaded fields with defaults (loaded fields take precedence)
    const mergedFields = [...defaultFields]
    loadedFields.forEach(loadedField => {
      const existingIndex = mergedFields.findIndex(f => f.name === loadedField.name)
      if (existingIndex >= 0) {
        mergedFields[existingIndex] = loadedField
      } else {
        mergedFields.push(loadedField)
      }
    })
    
    setFields(mergedFields)
    setAssetFormSchema(createAssetFormSchema(mergedFields))

    // Subscribe to field changes
    const unsubscribe = fieldManager.subscribe((updatedFields: AnyAssetField[]) => {
      const includedFields = updatedFields.filter((field: AnyAssetField) => field.included)
      
      // Merge with defaults again
      const mergedFields = [...defaultFields]
      includedFields.forEach(loadedField => {
        const existingIndex = mergedFields.findIndex(f => f.name === loadedField.name)
        if (existingIndex >= 0) {
          mergedFields[existingIndex] = loadedField
        } else {
          mergedFields.push(loadedField)
        }
      })
      
      setFields(mergedFields)
      setAssetFormSchema(createAssetFormSchema(mergedFields))
    })

    return unsubscribe
  }, [])


  // Handle adding new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }
    
    setIsAddingCategory(true)
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newCategory = setupDataManager.addCategory({
        name: newCategoryName.trim(),
        description: `Custom category: ${newCategoryName.trim()}`,
        isActive: true
      })
      
      toast.success(`Category "${newCategory.name}" added successfully!`)
      setNewCategoryName("")
      setAddCategoryOpen(false)
      
      // Refresh the form to show the new category
      window.location.reload()
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error("Failed to add category")
    } finally {
      setIsAddingCategory(false)
    }
  }

  // Handle adding new sub category
  const handleAddSubCategory = async () => {
    if (!newSubCategoryName.trim()) {
      toast.error("Please enter a sub category name")
      return
    }
    
    setIsAddingSubCategory(true)
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get the current sub category field
      const subCategoryField = fields.find(field => field.name === 'subCategory')
      if (subCategoryField && subCategoryField.options) {
        // Add the new option to the field
        const updatedOptions = [...subCategoryField.options, newSubCategoryName.trim()]
        const fieldManager = AssetFieldManager.getInstance()
        fieldManager.updateField(subCategoryField.id, { options: updatedOptions })
        
        toast.success(`Sub Category "${newSubCategoryName.trim()}" added successfully!`)
        setNewSubCategoryName("")
        setAddSubCategoryOpen(false)
      }
    } catch (error) {
      console.error('Error adding sub category:', error)
      toast.error("Failed to add sub category")
    } finally {
      setIsAddingSubCategory(false)
    }
  }

  // Create default values dynamically
  const createDefaultValues = (fields: AnyAssetField[]) => {
    const defaults: Record<string, string | Date | File | null | undefined> = {}
    fields.forEach(field => {
      if (field.included) {
        // Ensure all fields have defined values to prevent uncontrolled to controlled warnings
        if (field.type === 'date') {
          defaults[field.name] = undefined
        } else if (field.type === 'number') {
          defaults[field.name] = ""
        } else if (field.type === 'file') {
          defaults[field.name] = null
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

  // Initialize search value when form field changes
  React.useEffect(() => {
    const assignedToValue = form.getValues('assignedTo')
    if (assignedToValue) {
      const selectedEmployee = employees.find(emp => emp.id === assignedToValue)
      if (selectedEmployee) {
        setIssuedToSearch(selectedEmployee.name)
      }
    }
  }, [form, employees])

  // Handle image file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== IMAGE UPLOAD DEBUG ===')
    console.log('File input changed:', event.target.files)
    
    const file = event.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name, file.type, file.size)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type)
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size)
        toast.error('Image size must be less than 5MB')
        return
      }
      
      // Check if Asset ID is provided
      const assetId = form.getValues('assetTagId') as string
      if (!assetId || assetId.trim() === '') {
        console.log('Asset ID not provided, showing dialog')
        setPendingImageFile(file)
        setShowAssetIdDialog(true)
        return
      }
      
      console.log('Asset ID provided, processing image upload...')
      processImageUpload(file, assetId)
    } else {
      console.log('No file selected')
    }
    console.log('=== END IMAGE UPLOAD DEBUG ===')
  }

  // Process image upload with Asset ID
  const processImageUpload = async (file: File, assetId: string) => {
    try {
    console.log('Processing image upload with Asset ID:', assetId)
    
      // Show loading state
      toast.loading("Uploading image...", {
        id: 'image-upload'
      })
      
      // Create preview first
      let previewUrl: string | null = null
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('File read successfully, setting preview')
        previewUrl = e.target?.result as string
        setUploadedImagePreview(previewUrl)
      }
      reader.onerror = (e) => {
        console.error('File read error:', e)
      }
      reader.readAsDataURL(file)
    
      // Generate file path for Supabase Storage
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${assetId}.${fileExt}`
      const filePath = `asset-images/${fileName}`
      
      console.log('=== IMAGE UPLOAD DEBUG ===')
      console.log('Original filename:', file.name)
      console.log('Asset ID:', assetId)
      console.log('File extension:', fileExt)
      console.log('New filename:', fileName)
      console.log('File path:', filePath)
      console.log('Bucket: asset-images')
      console.log('============================')
      
      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await assetService.uploadImage(file, filePath)
      
      if (uploadError) {
        console.error('Image upload failed:', uploadError)
        toast.dismiss('image-upload')
        toast.error("Image upload failed", {
          description: uploadError.message + ". Image will be used locally.",
          duration: 4000,
        })
        
        // Fallback: use local file
        form.setValue('image', file)
      } else {
        console.log('Image uploaded successfully:', uploadData)
        
        // Set the uploaded image URL as form value
        form.setValue('image', file)
        
        // Create preview using the uploaded URL
        setUploadedImagePreview(uploadData?.publicUrl || previewUrl)
        
        toast.dismiss('image-upload')
        toast.success("Image uploaded successfully!", {
          description: `Image for Asset ID "${assetId}" has been uploaded and renamed.`,
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error processing image upload:', error)
      toast.dismiss('image-upload')
      toast.error("Failed to process image upload", {
        description: "Please try again or contact support if the issue persists.",
        duration: 4000,
      })
    }
  }

  // Handle Asset ID dialog confirmation
  const handleAssetIdDialogConfirm = async () => {
    const assetId = imageDialogAssetId.trim()
    if (assetId && pendingImageFile) {
      // Update the form with the dialog input
      form.setValue('assetTagId', assetId)
      await processImageUpload(pendingImageFile, assetId)
      setShowAssetIdDialog(false)
      setPendingImageFile(null)
      setImageDialogAssetId('')
    }
  }

  // Handle Asset ID dialog cancel
  const handleAssetIdDialogCancel = () => {
    setShowAssetIdDialog(false)
    setPendingImageFile(null)
    setImageDialogAssetId('')
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Handle QR Asset ID dialog confirmation
  const handleQrAssetIdDialogConfirm = async () => {
    const assetId = qrDialogAssetId.trim()
    if (assetId) {
      // Update the form with the dialog input
      form.setValue('assetTagId', assetId)
      setShowQrAssetIdDialog(false)
      setQrDialogAssetId('')
      await generateQRCode(assetId)
    }
  }

  // Handle QR Asset ID dialog cancel
  const handleQrAssetIdDialogCancel = () => {
    setShowQrAssetIdDialog(false)
    setQrDialogAssetId('')
  }

  // Remove uploaded image
  const removeUploadedImage = () => {
    setUploadedImagePreview(null)
    form.setValue('image', null)
  }

  // Remove QR code
  const removeQrCode = () => {
    setQrCodePreview(null)
  }

  // Generate QR Code
  const handleGenerateQR = async () => {
    const assetId = form.getValues('assetTagId') as string
    if (!assetId || assetId.trim() === '') {
      setShowQrAssetIdDialog(true)
      return
    }

    await generateQRCode(assetId)
  }

  // Generate QR Code with Asset ID
  const generateQRCode = async (assetId: string) => {
    try {
      // Show loading state
      toast.loading("Generating QR code...", {
        id: 'qr-generation'
      })

      // Create QR code URL with proper data format
      // Include asset information in a structured format
      const qrData = {
        type: 'asset',
        id: assetId,
        url: `${window.location.origin}/assets/${assetId}`,
        timestamp: new Date().toISOString()
      }
      
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`
      
      // Create a temporary image element to download the QR code
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = async () => {
        try {
          // Create canvas to convert to blob
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  // Create file from blob
                  const file = new File([blob], `${assetId}.png`, { type: 'image/png' })
                  
                  // Generate file path for Supabase Storage (QR codes bucket)
                  const fileExt = file.name.split('.').pop() || 'png'
                  const fileName = `${assetId}.${fileExt}`
                  const filePath = `qr-codes/${fileName}`
                  
                  console.log('=== QR CODE UPLOAD DEBUG ===')
                  console.log('QR filename:', file.name)
                  console.log('Asset ID:', assetId)
                  console.log('File extension:', fileExt)
                  console.log('New filename:', fileName)
                  console.log('File path:', filePath)
                  console.log('Bucket: qr-codes')
                  console.log('============================')
                  
                  // Upload QR code to Supabase Storage
                  const { data: uploadData, error: uploadError } = await assetService.uploadImage(file, filePath)
                  
                  if (uploadError) {
                    console.error('QR code upload failed:', uploadError)
                    toast.dismiss('qr-generation')
                    toast.error("QR code upload failed", {
                      description: uploadError.message + ". QR code will be used locally.",
                      duration: 4000,
                    })
                    
                    // Fallback: use local file
                    form.setValue('image', file)
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      setQrCodePreview(e.target?.result as string)
                    }
                    reader.readAsDataURL(blob)
                  } else {
                    console.log('QR code uploaded successfully:', uploadData)
                    
                    // Set the uploaded image URL as form value
                    form.setValue('image', file)
                    
                    // Create preview using the uploaded URL
                    setQrCodePreview(uploadData?.publicUrl || qrCodeUrl)
                    
                    toast.dismiss('qr-generation')
                    toast.success("QR Code generated and uploaded successfully!", {
                      description: `Scannable QR code for Asset ID "${assetId}" has been generated and uploaded. Contains asset URL and metadata.`,
                      duration: 4000,
                    })
                  }
                } catch (error) {
                  console.error('Error processing QR code:', error)
                  toast.dismiss('qr-generation')
                  toast.error("Failed to process QR code", {
                    description: "Please try again or contact support if the issue persists.",
                    duration: 4000,
                  })
                }
              }
            }, 'image/png')
          }
        } catch (error) {
          console.error('Error creating QR code canvas:', error)
          toast.dismiss('qr-generation')
          toast.error("Failed to create QR code", {
            description: "Please try again or contact support if the issue persists.",
            duration: 4000,
          })
        }
      }
      
      img.onerror = () => {
        toast.dismiss('qr-generation')
        toast.error("Failed to generate QR code", {
          description: "Please try again or contact support if the issue persists.",
          duration: 4000,
        })
      }
      
      img.src = qrCodeUrl
      
    } catch (error) {
      console.error('Error in generateQRCode:', error)
      toast.dismiss('qr-generation')
      toast.error("Failed to generate QR code", {
        description: "Please try again or contact support if the issue persists.",
        duration: 4000,
      })
    }
  }

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
      console.log('Form submission data:', data)
      
      // Get Asset ID for image renaming
      let assetId = String(data.assetTagId || '')
      
      // Validate Asset ID format
      const formatValidation = validateAssetIdFormat(assetId)
      if (!formatValidation.isValid) {
        setFormatError(formatValidation.error || 'Invalid Asset ID format')
        setShowInvalidFormatDialog(true)
        setIsSubmitting(false)
        return
      }
      
      // Check if Asset ID already exists
      console.log('Checking if Asset ID exists:', assetId)
      const existenceCheck = await checkAssetIdExists(assetId)
      if (existenceCheck.error) {
        toast.error("Unable to verify Asset ID", {
          description: existenceCheck.error,
          duration: 4000,
        })
        setIsSubmitting(false)
        return
      }
      
      if (existenceCheck.exists) {
        const suggestedId = suggestAssetId(assetId)
        setDuplicateAssetId(assetId)
        setSuggestedAssetId(suggestedId)
        setShowDuplicateIdDialog(true)
        setIsSubmitting(false)
        return
      }
      
      // Handle image upload FIRST with Asset ID (before creating asset)
      let imageUrl = ''
      let imageFileName = ''
      
      if (data.image && data.image instanceof File) {
        try {
          console.log('Uploading image to Supabase Storage with Asset ID...')
          
          // Use Asset ID as filename for easy identification
          const fileExt = data.image.name.split('.').pop()
          const fileName = `${assetId}.${fileExt}`
          const filePath = `assets/${fileName}`
          
          console.log('=== IMAGE UPLOAD DEBUG ===')
          console.log('Original filename:', data.image.name)
          console.log('Asset ID:', assetId)
          console.log('File extension:', fileExt)
          console.log('New filename:', fileName)
          console.log('File path:', filePath)
          console.log('========================')
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await assetService.uploadImage(data.image, filePath)
          
          if (uploadError) {
            console.error('Image upload failed:', uploadError)
            toast.error("Image upload failed", {
              description: uploadError.message + ". Asset will be created without image.",
              duration: 4000,
            })
          } else {
            console.log('Image uploaded successfully:', uploadData)
            imageUrl = uploadData?.publicUrl || ''
            imageFileName = fileName
          }
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error("Image upload failed", {
            description: "Asset will be created without image.",
            duration: 4000,
          })
        }
      }
      
      // Prepare asset data for database
      const assetData: CreateAssetData = {
        asset_tag_id: assetId,
        name: String(data.name || data.description || data.serialNumber || data.brand || data.model || assetId || 'Untitled Asset'), // Use name field from form, fallback to other fields, ensure never empty
        description: String(data.description || ''),
        serial_number: String(data.serialNumber || ''),
        brand: String(data.brand || ''),
        model: String(data.model || ''),
        cost: data.cost ? parseFloat(String(data.cost)) || 0 : 0,
        purchase_date: data.purchaseDate ? format(data.purchaseDate as Date, "yyyy-MM-dd") : undefined,
        date_acquired: data.purchaseDate ? format(data.purchaseDate as Date, "yyyy-MM-dd") : undefined,
        category: String(data.category || ''),
        sub_category: String(data.subCategory || ''),
        location: String(data.location || ''),
        site: String(data.site || ''),
        department: String(data.department || ''),
        status: "Available",
        assigned_to: String(data.assignedTo || ''),
        asset_type: String(data.assetType || ''),
        notes: String(data.notes || ''),
        image_url: imageUrl,
        image_file_name: imageFileName,
      }

      console.log('Prepared asset data:', assetData)
      console.log('Asset name being sent:', assetData.name)

      // Test database connection first
      console.log('Testing database connection...')
      const connectionTest = await assetService.testConnection()
      console.log('Connection test result:', connectionTest)
      
      if (!connectionTest.success) {
        toast.error("Database connection failed", {
          description: connectionTest.error || "Please check your database configuration.",
          duration: 4000,
        })
        return
      }

      // Save the asset to database
      console.log('Calling assetService.createAsset with:', assetData)
      const result = await assetService.createAsset(assetData)
      console.log('Asset service result:', result)

      if (result.success && result.data) {
        console.log("Asset created successfully:", result.data)
        
        toast.success("Asset created successfully!", {
          description: `Asset ${result.data.asset_tag_id} has been added to your inventory.`,
          duration: 4000,
        })

        // Reset form
        form.reset()
        setUploadedImagePreview(null)
        setQrCodePreview(null)
        
        // Show success dialog instead of redirecting
        setCreatedAssetId(assetId)
        setShowSuccessDialog(true)
      } else {
        console.error("Failed to create asset:", result.error)
        toast.error("Failed to create asset", {
          description: result.error || "Please try again or contact support if the issue persists.",
          duration: 4000,
        })
      }
    } catch (error) {
      console.error("Unexpected error creating asset:", error)
      toast.error("Failed to create asset", {
        description: "An unexpected error occurred. Please try again.",
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
                    className="w-full"
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
                    className="w-full"
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

      case 'file':
        // Special handling for image upload field
        console.log('Checking field:', field.name, field.type, 'is image?', field.name === 'image')
        if (field.name === 'image') {
          console.log('Rendering image field with special handling')
          return (
            <div key={field.id} className="w-full">
              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <div className="space-y-4 mt-2">
                {/* File Input */}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    onClick={() => console.log('File input clicked')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ cursor: 'pointer' }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateQR}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Generate QR
                  </Button>
                </div>
                
                {/* Hidden file input for button trigger */}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Images Preview - 2 Column Layout */}
                {(uploadedImagePreview || qrCodePreview) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Asset Images</span>
                    </div>

                    {/* 2 Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Uploaded Image Column */}
                      {uploadedImagePreview && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
                              <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Uploaded Image</span>
                            </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                              onClick={removeUploadedImage}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                          <div className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="relative">
                                <img
                                  src={uploadedImagePreview}
                                  alt="Uploaded Asset Image"
                                  className="h-40 w-auto max-w-full object-contain rounded-lg shadow-sm"
                                />
                              </div>
                              <div className="text-center space-y-1">
                                <p className="text-sm font-medium text-foreground">Image Uploaded</p>
                                <p className="text-xs text-muted-foreground">This image will be associated with your asset</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeUploadedImage}
                                className="text-destructive border-destructive/20 hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QR Code Column */}
                      {qrCodePreview && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
                              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">Generated QR Code</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeQrCode}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="relative">
                                <img
                                  src={qrCodePreview}
                                  alt="Generated QR Code"
                                  className="h-40 w-40 object-contain rounded-lg shadow-sm"
                                />
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                              <div className="text-center space-y-1">
                                <p className="text-sm font-medium text-foreground">QR Code Generated</p>
                                <p className="text-xs text-muted-foreground">Scannable QR code with asset URL and metadata</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = qrCodePreview
                                    link.download = `${form.getValues('assetTagId') || 'asset'}.png`
                                    link.click()
                                  }}
                                  className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                                >
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download QR
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={removeQrCode}
                                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Remove QR
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {field.description && (
                <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
              )}
            </div>
          )
        }
        // Fallback for other file types
        return null

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
        } else if (field.name === 'site') {
          options = setupDataManager.getSites().map(site => ({ value: site.id, label: site.name }))
        } else if (field.name === 'department') {
          options = departments.map(dept => ({ value: dept.id, label: dept.name }))
        } else if (field.name === 'assignedTo') {
          options = employees.map(emp => ({ value: emp.id, label: emp.name }))
        } else if (field.name === 'manufacturer') {
          options = manufacturers.map(mfr => ({ value: mfr.id, label: mfr.name }))
        } else if (field.options) {
          options = field.options.map(opt => ({ value: opt, label: opt }))
        }

        // Special handling for Issued To field to make it searchable
        if (field.name === 'assignedTo') {
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
                      placeholder="Type to search employees..."
                      value={issuedToSearch}
                      onChange={(e) => {
                        const value = e.target.value
                        setIssuedToSearch(value)
                        
                        // Find matching employee and set form field
                        const matchingEmployee = employees.find(emp => 
                          emp.name.toLowerCase().includes(value.toLowerCase())
                        )
                        
                        if (matchingEmployee && value === matchingEmployee.name) {
                          formField.onChange(matchingEmployee.id)
                        } else {
                          formField.onChange("")
                        }
                      }}
                      className="w-full"
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

        console.log('Rendering field with default handler:', field.name, field.type)
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
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select onValueChange={formField.onChange} value={String(formField.value || "")}>
                      <FormControl>
                        <SelectTrigger className="w-full">
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
                  </div>
                  {(field.name === 'category' || field.name === 'subCategory') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (field.name === 'category') {
                          setAddCategoryOpen(true)
                        } else if (field.name === 'subCategory') {
                          setAddSubCategoryOpen(true)
                        }
                      }}
                      className="px-3 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                    className="w-full"
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
                        {categoryFields.map((field) => (
                          <div key={field.id} className="w-full">
                            {renderField(field)}
                          </div>
                        ))}
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
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
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

          {/* Add Category Dialog */}
          <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Category
                </DialogTitle>
                <DialogDescription>
                  Add a new category to the asset management system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAddingCategory) {
                        handleAddCategory()
                      }
                    }}
                    disabled={isAddingCategory}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddCategoryOpen(false)
                    setNewCategoryName("")
                  }}
                  disabled={isAddingCategory}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddCategory} disabled={isAddingCategory}>
                  {isAddingCategory ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Category"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Sub Category Dialog */}
          <Dialog open={addSubCategoryOpen} onOpenChange={setAddSubCategoryOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Sub Category
                </DialogTitle>
                <DialogDescription>
                  Add a new sub category to the asset management system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subCategoryName">Sub Category Name</Label>
                  <Input
                    id="subCategoryName"
                    placeholder="Enter sub category name"
                    value={newSubCategoryName}
                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAddingSubCategory) {
                        handleAddSubCategory()
                      }
                    }}
                    disabled={isAddingSubCategory}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddSubCategoryOpen(false)
                    setNewSubCategoryName("")
                  }}
                  disabled={isAddingSubCategory}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSubCategory} disabled={isAddingSubCategory}>
                  {isAddingSubCategory ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Sub Category"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Asset ID Required Dialog */}
          <Dialog open={showAssetIdDialog} onOpenChange={setShowAssetIdDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Asset ID Required
                </DialogTitle>
                <DialogDescription>
                  Please enter an Asset ID before uploading an image. The image will be automatically renamed using this Asset ID.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="assetIdForImage">Asset ID</Label>
                  <Input
                    id="assetIdForImage"
                    placeholder="Enter Asset ID (e.g., LAPTOP-001)"
                    value={imageDialogAssetId}
                    onChange={(e) => setImageDialogAssetId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The image will be renamed to: <span className="font-mono font-medium">{imageDialogAssetId || 'ASSET-ID'}.jpg</span>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleAssetIdDialogCancel}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssetIdDialogConfirm}
                  disabled={!imageDialogAssetId || imageDialogAssetId.trim() === ''}
                >
                  Upload Image
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* QR Asset ID Required Dialog */}
          <Dialog open={showQrAssetIdDialog} onOpenChange={setShowQrAssetIdDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Asset ID Required
                </DialogTitle>
                <DialogDescription>
                  Please enter an Asset ID before generating a QR code. The QR code will contain the Asset ID and link to the asset page.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="assetIdForQR">Asset ID</Label>
                  <Input
                    id="assetIdForQR"
                    placeholder="Enter Asset ID (e.g., LAPTOP-001)"
                    value={qrDialogAssetId}
                    onChange={(e) => setQrDialogAssetId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The QR code will be named: <span className="font-mono font-medium">{qrDialogAssetId || 'ASSET-ID'}.png</span>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleQrAssetIdDialogCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleQrAssetIdDialogConfirm}
                  disabled={!qrDialogAssetId || qrDialogAssetId.trim() === ''}
                >
                  Generate QR Code
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Invalid Asset ID Format Dialog */}
          <Dialog open={showInvalidFormatDialog} onOpenChange={setShowInvalidFormatDialog}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  Invalid Asset ID Format
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  The Asset ID you entered doesn't meet the required format. Please review the requirements below and fix your entry.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Error Message */}
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-red-800 dark:text-red-300">Format Error</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-red-700 dark:text-red-300">{formatError}</p>
                  </div>
                </Alert>

                {/* Requirements List */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Asset ID Requirements:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5 flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">1</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Length Requirements</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">Must be between 3-50 characters long</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5 flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">2</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Character Requirements</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">Can only contain letters (A-Z), numbers (0-9), hyphens (-), and underscores (_)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5 flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">3</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Examples</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs font-mono">ABC-123</Badge>
                            <Badge variant="secondary" className="text-xs font-mono">Test_Asset_001</Badge>
                            <Badge variant="secondary" className="text-xs font-mono">COMPANY-LAPTOP</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  onClick={() => {
                    setShowInvalidFormatDialog(false)
                    setFormatError(null)
                  }}
                  className="w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Close & Fix Asset ID
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Duplicate Asset ID Dialog */}
          <Dialog open={showDuplicateIdDialog} onOpenChange={setShowDuplicateIdDialog}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  Asset ID Already Exists
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  The Asset ID <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded text-sm">"{duplicateAssetId}"</span> is already in use by another asset. Please choose an alternative:
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Option 1 - Suggested Asset ID */}
                <Card className="border-dashed border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full text-primary-foreground font-bold text-sm flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="space-y-2 flex-1">
                        <h4 className="font-medium text-foreground">Use suggested Asset ID</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-sm px-3 py-1 bg-primary/20 text-primary border-primary/30">
                            {suggestedAssetId}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Auto-generated based on your input</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Option 2 - Manual Entry */}
                <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-muted-foreground/20 rounded-full text-muted-foreground font-bold text-sm flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="space-y-2 flex-1">
                        <h4 className="font-medium text-muted-foreground">Enter a different Asset ID manually</h4>
                        <p className="text-sm text-muted-foreground">
                          Close this dialog and type a new Asset ID in the Asset Tag ID field
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset ID Requirements */}
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Asset ID Requirements:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground ml-1">
                    <li>• 3-50 characters, alphanumeric with hyphens and underscores</li>
                    <li>• Must be unique across all assets</li>
                    <li>• Examples: ABC-001, LAPTOP-2023, DESKTOP_001</li>
                  </ul>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDuplicateIdDialog(false)
                    setDuplicateAssetId('')
                    setSuggestedAssetId('')
                  }}
                  className="sm:flex-shrink-0"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    form.setValue('assetTagId', suggestedAssetId)
                    setShowDuplicateIdDialog(false)
                    setDuplicateAssetId('')
                    setSuggestedAssetId('')
                  }}
                  className="sm:flex-shrink-0"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Use Suggested ID
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Success Dialog */}
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Asset Created Successfully!
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Your asset <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded text-sm">"{createdAssetId}"</span> has been successfully added to your inventory.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Asset Added Successfully
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      The asset is now available in your inventory system
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSuccessDialog(false)}
                  className="flex-1"
                >
                  Add Another Asset
                </Button>
                <Button 
                  onClick={() => {
                    setShowSuccessDialog(false)
                    router.push("/assets")
                  }}
                  className="flex-1"
                >
                  View All Assets
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
