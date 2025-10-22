"use client"

import * as React from "react"
import { Asset } from "@/lib/lists-data"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { useUpdateAsset } from "@/hooks/use-assets-query"
import { useSystemSettings } from "@/contexts/system-settings-context"
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
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, ArrowUpDown, UserCheck, UserMinus, User, Mail, Phone, MapPin, Briefcase, MoreHorizontal, Package, Move, DollarSign, CheckCircle, Columns, ChevronLeft, ChevronRight, Edit, FileText, Settings, Save, X, Image as ImageIcon, Camera, Trash2 } from "lucide-react"
import Link from "next/link"
import { DeleteConfirmDialog } from "@/components/lists/delete-confirm-dialog"
import { toast } from "sonner"

// Use useAssets hook for Supabase integration

const statusColors = {
  "Available": "bg-green-100 text-green-800 border-green-200",
  "In Use": "bg-blue-100 text-blue-800 border-blue-200", 
  "Under Maintenance": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Maintenance": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Disposed": "bg-red-100 text-red-800 border-red-200",
  "Unknown": "bg-gray-100 text-gray-800 border-gray-200",
}

// Mock person data
const mockPersons = {
  "John Smith": {
    name: "John Smith",
    email: "john.smith@assetdog.com",
    phone: "+1 (555) 123-4567",
    department: "IT Department",
    position: "Senior Developer",
    location: "New York Office - Floor 2",
    employeeId: "EMP-001",
  },
  "Sarah Johnson": {
    name: "Sarah Johnson", 
    email: "sarah.johnson@assetdog.com",
    phone: "+1 (555) 234-5678",
    department: "Marketing",
    position: "Marketing Manager",
    location: "Remote - Employee Home",
    employeeId: "EMP-002",
  },
  "Mike Wilson": {
    name: "Mike Wilson",
    email: "mike.wilson@assetdog.com", 
    phone: "+1 (555) 345-6789",
    department: "Operations",
    position: "Operations Lead",
    location: "Chicago Office - Main Floor",
    employeeId: "EMP-003",
  },
  "Emily Davis": {
    name: "Emily Davis",
    email: "emily.davis@assetdog.com",
    phone: "+1 (555) 456-7890", 
    department: "Finance",
    position: "Financial Analyst",
    location: "New York Office - Floor 1",
    employeeId: "EMP-004",
  },
  "Fleet Manager": {
    name: "Fleet Manager",
    email: "fleet@assetdog.com",
    phone: "+1 (555) 567-8901",
    department: "Operations", 
    position: "Fleet Manager",
    location: "New York Office - Parking Garage",
    employeeId: "EMP-005",
  },
}

export default function AssetsPage() {
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const { formatCurrency, formatDate, formatDateTime } = useSystemSettings()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sortField, setSortField] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [selectedPerson, setSelectedPerson] = React.useState<string | null>(null)
  const [isPersonModalOpen, setIsPersonModalOpen] = React.useState(false)
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null)
  const [isAssetDetailsOpen, setIsAssetDetailsOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedAsset, setEditedAsset] = React.useState<Asset | null>(null)
  const [showSaveConfirmation, setShowSaveConfirmation] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingAsset, setDeletingAsset] = React.useState<Asset | null>(null)
  const [visibleFields, setVisibleFields] = React.useState<string[]>([
    "id", "name", "category", "status", "assignedTo", "location", "value"
  ])
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // QR Scanner states
  const [isQrScannerOpen, setIsQrScannerOpen] = React.useState(false)
  const [scannedAssetId, setScannedAssetId] = React.useState<string | null>(null)
  const [showQrOptionsDialog, setShowQrOptionsDialog] = React.useState(false)
  const [isCameraScanning, setIsCameraScanning] = React.useState(false)
  const [showUnrecognizedQrDialog, setShowUnrecognizedQrDialog] = React.useState(false)
  const [unrecognizedQrData, setUnrecognizedQrData] = React.useState<string>('')

  // Handle authentication errors gracefully
  React.useEffect(() => {
    if (error) {
      console.error('Assets page error:', error)
      // Check if it's an authentication error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('auth')) {
        console.log('Authentication error detected, redirecting to login...')
        // You could redirect to login here if needed
        // window.location.href = '/login'
      }
    }
  }, [error])

  // Available field options
  const fieldOptions = [
    { key: "id", label: "Asset ID" },
    { key: "name", label: "Asset Name" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "location", label: "Location" },
    { key: "value", label: "Value" },
    { key: "purchaseDate", label: "Purchase Date" },
    { key: "serialNumber", label: "Serial Number" },
    { key: "model", label: "Model" },
    { key: "brand", label: "Brand" },
    { key: "department", label: "Department" },
    { key: "site", label: "Site" },
    { key: "subCategory", label: "Sub Category" },
    { key: "purchasedFrom", label: "Purchased From" },
    { key: "manufacturer", label: "Manufacturer" }
  ]

  // Toggle field visibility
  const toggleField = (fieldKey: string) => {
    setVisibleFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    )
  }


  // Assets are now loaded via useAssets hook

  // Get unique categories for filters, filtering out empty values
  const categories = Array.from(new Set(assets.map(asset => asset.category).filter(category => category && category.trim() !== '')))
  
  // Define all possible statuses
  const allStatuses = ['Available', 'Check Out', 'Move', 'Reserve', 'Lease', 'Dispose', 'Maintenance']
  
  // Get unique statuses from assets, but include all possible statuses in the filter
  const statuses = Array.from(new Set(assets.map(asset => asset.status).filter(status => status && status.trim() !== '')))

  // Filter and sort assets
  const filteredAssets = React.useMemo(() => {
    const filtered = assets.filter(asset => {
      const matchesSearch = 
        (asset.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = categoryFilter === "all" || (asset.category && asset.category.trim() !== '' && asset.category === categoryFilter)
      const matchesStatus = statusFilter === "all" || (asset.status && asset.status.trim() !== '' && asset.status === statusFilter)

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort if a field is selected
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a]
        let bValue = b[sortField as keyof typeof b]

        // Handle null values
        if (aValue === null) aValue = ""
        if (bValue === null) bValue = ""

        // Convert to string for comparison
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }

    return filtered
  }, [assets, searchTerm, categoryFilter, statusFilter, sortField, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, rowsPerPage])

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handlePersonClick = (personName: string) => {
    setSelectedPerson(personName)
    setIsPersonModalOpen(true)
  }

  const handleAssetClick = (asset: Asset) => {
    console.log('Selected Asset Data:', JSON.stringify(asset, null, 2))
    setSelectedAsset(asset)
    setIsAssetDetailsOpen(true)
    setIsEditing(false)
  }

  const handleEditClick = () => {
    if (selectedAsset) {
      setEditedAsset({ ...selectedAsset })
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    setShowSaveConfirmation(true)
  }

  const confirmSaveEdit = async () => {
    if (editedAsset) {
      try {
        // Update the asset in Supabase
        await updateAssetMutation.mutateAsync({ id: editedAsset.id, updates: editedAsset })
        
        // Update the selected asset
        setSelectedAsset(editedAsset)
        setIsEditing(false)
        setShowSaveConfirmation(false)
      } catch (error) {
        console.error('Failed to update asset:', error)
        // You could add a toast notification here
      }
    }
  }

  const cancelSaveEdit = () => {
    setShowSaveConfirmation(false)
  }

  const handleCancelEdit = () => {
    setEditedAsset(null)
    setIsEditing(false)
  }

  const handleFieldChange = (field: keyof Asset, value: string | number) => {
    if (editedAsset) {
      setEditedAsset(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  const handleDeleteAsset = (asset: Asset, event: React.MouseEvent) => {
    event.stopPropagation()
    setDeletingAsset(asset)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return
    
    try {
      // Call your delete API here
      const response = await fetch(`/api/assets/${deletingAsset.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete asset')
      
      toast.success(`Asset "${deletingAsset.id || deletingAsset.name}" deleted successfully!`)
      
      // Reload assets
      window.location.reload()
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error('Failed to delete asset. Please try again.')
    } finally {
      setIsDeleteOpen(false)
      setDeletingAsset(null)
    }
  }

  // QR Scanner functionality
  const handleQrScan = (result: string) => {
    try {
      // Try to parse as JSON first (for our structured QR codes)
      const qrData = JSON.parse(result)
      if (qrData.type === 'asset' && qrData.id) {
        // Check if asset exists
        const foundAsset = assets.find(asset => asset.id === qrData.id)
        if (foundAsset) {
          setScannedAssetId(qrData.id)
          setIsQrScannerOpen(false)
          setShowQrOptionsDialog(false)
          return
        } else {
          // Asset not found
          setUnrecognizedQrData(result)
          setShowUnrecognizedQrDialog(true)
          setIsQrScannerOpen(false)
          setShowQrOptionsDialog(false)
          return
        }
      }
    } catch (error) {
      // If not JSON, treat as plain asset ID
      console.log('QR code is not JSON format, treating as plain asset ID')
    }
    
    // Treat the result as a plain asset ID
    const assetId = result.trim()
    
    // Check if asset exists
    const foundAsset = assets.find(asset => asset.id === assetId)
    if (foundAsset) {
      setScannedAssetId(assetId)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    } else {
      // Asset not found
      setUnrecognizedQrData(result)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    }
  }

  const handleQrScannerError = (error: any) => {
    console.error('QR Scanner error:', error)
    
    // Check if it's a decoding error (no QR code found)
    if (error instanceof Error && error.message.includes('No MultiFormat Readers were able to detect the code')) {
      // Show unrecognized QR dialog for decode failures
      setUnrecognizedQrData('Unable to decode QR code from camera')
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
    } else {
      // Show unrecognized QR dialog for other errors
      setUnrecognizedQrData(`Camera Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
    }
  }

  // Handle QR image file upload
  const handleQrFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('=== QR SCAN DEBUG ===')
    console.log('File uploaded:', file.name)
    console.log('File type:', file.type)
    console.log('File size:', file.size)
    console.log('====================')

    // Show loading toast
    toast.loading('Scanning QR code...', { id: 'qr-scan' })

    try {
      // Dynamically import html5-qrcode to avoid SSR issues
      const Html5Qrcode = await import('html5-qrcode')
      
      // Create a temporary container for file scanning
      const tempContainer = document.createElement('div')
      tempContainer.id = 'temp-qr-reader'
      tempContainer.style.display = 'none'
      document.body.appendChild(tempContainer)
      
      try {
        const html5QrCode = new Html5Qrcode.Html5Qrcode("temp-qr-reader")
        
        // Try scanning with showImage=true for better debugging
        console.log('Attempting to scan QR code from file...')
        const result = await html5QrCode.scanFile(file, true)
        
        console.log('QR scan successful! Result:', result)
        toast.dismiss('qr-scan')
        toast.success('QR code scanned successfully!')
        
        handleQrScan(result)
      } finally {
        // Clean up the temporary container
        document.body.removeChild(tempContainer)
      }
    } catch (error) {
      console.error('Failed to scan QR from file:', error)
      toast.dismiss('qr-scan')
      
      // Check if it's a decoding error (no QR code found)
      if (error instanceof Error && error.message.includes('No MultiFormat Readers were able to detect the code')) {
        // Show more helpful error message
        toast.error('Cannot read QR code', {
          description: 'The image quality might be too low or the QR code is damaged. Please try downloading and uploading a higher quality image.',
          duration: 5000
        })
        
        setUnrecognizedQrData('Unable to decode QR code. The image might be compressed or low quality. Try using a higher resolution image (at least 500x500px).')
        setShowUnrecognizedQrDialog(true)
      } else {
        // Show unrecognized QR dialog for other errors
        toast.error('QR scan failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
          duration: 5000
        })
        
        setUnrecognizedQrData(`Error scanning QR code: ${error instanceof Error ? error.message : 'Unknown error'}. Please try uploading a clearer image.`)
        setShowUnrecognizedQrDialog(true)
      }
    }
  }

  // Handle camera scanning option
  const handleCameraScan = () => {
    setShowQrOptionsDialog(false)
    setIsCameraScanning(true)
    setIsQrScannerOpen(true)
  }

  // Handle file upload option
  const handleFileUploadScan = () => {
    setShowQrOptionsDialog(false)
    setIsCameraScanning(false)
    // Trigger file input
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement
      if (target.files?.[0]) {
        handleQrFileUpload({ target } as React.ChangeEvent<HTMLInputElement>)
      }
    }
    fileInput.click()
  }

  // Handle scanned asset ID
  React.useEffect(() => {
    if (scannedAssetId) {
      // Find the asset by ID
      const foundAsset = assets.find(asset => asset.id === scannedAssetId)
      if (foundAsset) {
        setSelectedAsset(foundAsset)
        setIsAssetDetailsOpen(true)
        setIsEditing(false)
        setScannedAssetId(null) // Reset after showing
      } else {
        // Asset not found - you could show a toast notification here
        console.log('Asset not found:', scannedAssetId)
        setScannedAssetId(null) // Reset
      }
    }
  }, [scannedAssetId, assets])

  // QR Scanner setup
  React.useEffect(() => {
    if (isQrScannerOpen && isCameraScanning) {
      // Dynamically import html5-qrcode to avoid SSR issues
      import('html5-qrcode').then((Html5QrcodeScanner) => {
        const html5QrCode = new Html5QrcodeScanner.Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        )
        
        html5QrCode.render(
          (decodedText: string) => {
            handleQrScan(decodedText)
            html5QrCode.clear()
          },
          (errorMessage: string) => {
            // Handle scan error
            console.log('QR scan error:', errorMessage)
          }
        )
      }).catch((error) => {
        console.error('Failed to load QR scanner:', error)
      })
    }
  }, [isQrScannerOpen, isCameraScanning])




  // Get assets assigned to the selected person
  const getPersonAssets = (personName: string) => {
    return assets.filter(asset => asset.assignedTo === personName)
  }

  const selectedPersonData = selectedPerson ? mockPersons[selectedPerson as keyof typeof mockPersons] : null
  const personAssets = selectedPerson ? getPersonAssets(selectedPerson) : []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12 px-1 sm:px-2">
          <div className="flex items-center gap-1 sm:gap-2 w-full min-w-0 overflow-hidden">
            <SidebarTrigger className="-ml-1 flex-shrink-0" />
            <Separator
              orientation="vertical"
              className="mr-1 sm:mr-2 data-[orientation=vertical]:h-4 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Breadcrumb>
                <BreadcrumbList className="flex items-center">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-xs sm:text-sm truncate">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="mx-1 sm:mx-2" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xs sm:text-sm font-medium truncate">Assets</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assets from database...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <p className="text-red-600 font-medium">Failed to load assets</p>
                <p className="text-muted-foreground text-sm mt-2">{error instanceof Error ? error.message : "Failed to load assets"}</p>
              </div>
            </div>
          ) : (
          <div className="min-h-full p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Assets</h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                  Manage and track all your organizational assets
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full sm:w-auto h-10 text-sm">
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuItem asChild>
                  <Link href="/assets/add" className="flex items-center w-full text-sm py-2">
                    <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Add Asset</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/assets/checkout" className="flex items-center w-full text-sm py-2">
                    <UserCheck className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Check Out Asset</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/assets/checkin" className="flex items-center w-full text-sm py-2">
                    <UserMinus className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Check In Asset</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/assets/move" className="flex items-center w-full text-sm py-2">
                    <Move className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Move Asset</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-primary/20">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 mr-3">
                    <Package className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors duration-300">Total Assets</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors duration-300">{assets.length}</div>
                  <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">+2 from last month</p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-green-500/5 hover:to-green-500/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-green-500/20">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300 mr-3">
                    <CheckCircle className="h-5 w-5 text-green-500 group-hover:text-green-500/80 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-green-500 transition-colors duration-300">Available</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 group-hover:text-green-500 transition-colors duration-300">
                    {assets.filter(a => a.status === "Available").length}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-green-500/70 transition-colors duration-300">Ready for assignment</p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-blue-500/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-blue-500/20">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 mr-3">
                    <User className="h-5 w-5 text-blue-500 group-hover:text-blue-500/80 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-blue-500 transition-colors duration-300">Check Out</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 group-hover:text-blue-500 transition-colors duration-300">
                    {assets.filter(a => a.status === "Check Out").length}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-blue-500/70 transition-colors duration-300">
                    {assets.length > 0 ? Math.round((assets.filter(a => a.status === "Check Out").length / assets.length) * 100) : 0}% utilization
                  </p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-yellow-500/5 hover:to-yellow-500/10 transition-all duration-500 ease-in-out cursor-pointer border-2 hover:border-yellow-500/20">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all duration-300 mr-3">
                    <DollarSign className="h-5 w-5 text-yellow-500 group-hover:text-yellow-500/80 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium group-hover:text-yellow-500 transition-colors duration-300">Total Value</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 group-hover:text-yellow-500 transition-colors duration-300">
                    {formatCurrency(assets.filter(asset => asset.status !== 'Dispose').reduce((sum, asset) => sum + asset.value, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-yellow-500/70 transition-colors duration-300">
                    Active asset portfolio value (excluding disposed)
                  </p>
                </CardContent>
              </Card>
          </div>
          
            {/* Asset List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Asset List</CardTitle>
                    <CardDescription>
                      Filter, search, and sort through all your assets
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
                      <SelectTrigger className="w-full sm:w-[140px] h-10 text-sm">
                        <span className="text-muted-foreground">Rows:</span>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 rows</SelectItem>
                        <SelectItem value="20">20 rows</SelectItem>
                        <SelectItem value="30">30 rows</SelectItem>
                        <SelectItem value="50">50 rows</SelectItem>
                        <SelectItem value="100">100 rows</SelectItem>
                      </SelectContent>
                    </Select>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto h-10 text-sm">
                          <Columns className="mr-2 h-4 w-4" />
                          Add Fields ({visibleFields.length})
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <div className="p-2">
                          <p className="text-sm font-medium mb-2">Select fields to display:</p>
                          <div className="space-y-1">
                            {fieldOptions.map((field) => (
                              <label key={field.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={visibleFields.includes(field.key)}
                                  onChange={() => toggleField(field.key)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{field.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search assets by name, ID, location, or assigned to..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setShowQrOptionsDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="hidden sm:inline">Scan QR</span>
                    </Button>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {allStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Assets Table */}
                  <div className="overflow-x-auto">
                    <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky right-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-l w-[80px]">Actions</TableHead>
                      {visibleFields.map((fieldKey) => {
                        const field = fieldOptions.find(f => f.key === fieldKey)
                        if (!field) return null
                        
                        return (
                          <TableHead 
                            key={fieldKey} 
                            className={`cursor-pointer ${fieldKey === 'value' ? 'text-right' : ''}`}
                            onClick={() => handleSort(fieldKey)}
                          >
                            <div className={`flex items-center gap-2 ${fieldKey === 'value' ? 'justify-end' : ''}`}>
                              {field.label}
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAssets.map((asset, index) => (
                        <TableRow 
                          key={`${asset.id}-${index}`} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleAssetClick(asset)}
                        >
                          <TableCell className="sticky right-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-l" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAssetClick(asset)
                                    setIsEditing(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Asset
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteAsset(asset, e)
                                  }}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Asset
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          {visibleFields.map((fieldKey) => {
                            const field = fieldOptions.find(f => f.key === fieldKey)
                            if (!field) return null
                            
                            const getCellContent = () => {
                              switch (fieldKey) {
                                case 'id':
                                  return <span className="font-medium">{asset.id}</span>
                                case 'assignedTo':
                                  return asset.assignedTo && mockPersons[asset.assignedTo as keyof typeof mockPersons] ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePersonClick(asset.assignedTo!)
                                      }}
                                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                    >
                                      {asset.assignedTo}
                                    </button>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      {asset.assignedTo || "Unassigned"}
                                    </span>
                                  )
                                case 'name':
                                  return <span>{asset.name}</span>
                                case 'category':
                                  return <span>{asset.category || 'Uncategorized'}</span>
                                case 'location':
                                  return <span>{asset.location}</span>
                                case 'status':
                                  return (
                                    <Badge 
                                      variant="outline" 
                                      className={`${statusColors[asset.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"} text-xs`}
                                    >
                                      {asset.status || 'Unknown'}
                                    </Badge>
                                  )
                                case 'value':
                                  return <span className="font-medium">{formatCurrency(asset.value)}</span>
                                case 'purchaseDate':
                                  return <span>{asset.purchaseDate || 'N/A'}</span>
                                case 'serialNumber':
                                  return <span>{asset.serialNumber || 'N/A'}</span>
                                case 'model':
                                  return <span>{asset.model || 'N/A'}</span>
                                case 'brand':
                                  return <span>{asset.brand || 'N/A'}</span>
                                case 'department':
                                  return <span>{asset.department || 'N/A'}</span>
                                case 'site':
                                  return <span>{asset.site || 'N/A'}</span>
                                case 'subCategory':
                                  return <span>{asset.subCategory || 'N/A'}</span>
                                case 'purchasedFrom':
                                  return <span>{asset.purchasedFrom || 'N/A'}</span>
                                case 'manufacturer':
                                  return <span>{asset.manufacturer || 'N/A'}</span>
                                default:
                                  return <span>N/A</span>
                              }
                            }
                            
                            return (
                              <TableCell 
                                key={fieldKey}
                                className={`${fieldKey === 'value' ? 'text-right' : ''}`}
                              >
                                {getCellContent()}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
                      {filteredAssets.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          No assets found matching your criteria.
                        </div>
                      )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredAssets.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredAssets.length)} of {filteredAssets.length} assets
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => goToPage(pageNum)}
                                  className="h-8 w-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Person Details Sheet */}
      <Sheet open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
        <SheetContent className="w-full sm:w-[500px] md:w-[700px] lg:w-[800px] xl:w-[900px] p-0 sm:p-6">
          <div className="flex flex-col h-full">
            <SheetHeader className="flex-shrink-0 p-3 sm:p-4 md:p-6 pb-3 sm:pb-4">
              <SheetTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl lg:text-2xl font-bold truncate">
                <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                <span className="truncate">{selectedPersonData?.name}</span>
              </SheetTitle>
              <SheetDescription className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
                Employee information and assigned assets
              </SheetDescription>
            </SheetHeader>

            {selectedPersonData && (
              <ScrollArea className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Person Information */}
                  <Card className="transition-all duration-300 ease-in-out">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 pt-0">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base sm:text-lg break-words">{selectedPersonData.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Employee ID: {selectedPersonData.employeeId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Email</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all">{selectedPersonData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Phone</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{selectedPersonData.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Position</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.position}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Department</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.department}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Location</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assigned Assets */}
                  <Card className="flex flex-col hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                    <CardHeader className="flex-shrink-0 pb-4 sm:pb-6">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                        Assigned Assets ({personAssets.length})
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base md:text-lg text-muted-foreground">
                        Assets currently assigned to this person
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                      {personAssets.length > 0 ? (
                        <>
                          {/* Scrollable Assets List */}
                          <ScrollArea className="flex-1 pr-1 sm:pr-2 max-h-[300px] sm:max-h-[400px]">
                            <div className="space-y-2 sm:space-y-3">
                              {personAssets.map((asset, index) => (
                                <div key={`${asset.id}-${index}`} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                                  <div className="space-y-2 sm:space-y-3">
                                  {/* Asset Header */}
                                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                                        <h4 className="font-semibold text-sm sm:text-base break-words">{asset.name}</h4>
                                        <Badge 
                                          variant="outline" 
                                          className={`${statusColors[asset.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"} text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}
                                        >
                                          {asset.status || 'Unknown'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                      <p className="font-bold text-sm sm:text-base md:text-lg">{formatCurrency(asset.value)}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Asset Details */}
                                  <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px]">Asset ID:</span>
                                      <span className="text-xs sm:text-sm break-all">{asset.id}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px]">Category:</span>
                                      <span className="text-xs sm:text-sm break-words">{asset.category || 'Uncategorized'}</span>
                                    </div>
                                    <div className="flex items-start gap-1 sm:gap-2">
                                      <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px] mt-0.5">Location:</span>
                                      <span className="text-xs sm:text-sm flex-1 break-words">{asset.location}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Action Button */}
                                  {asset.status === "Check Out" && (
                                    <div className="flex justify-end pt-1 sm:pt-2">
                                      <Link href={`/assets/checkin/${asset.id}`}>
                                        <Button size="sm" variant="outline" onClick={() => setIsPersonModalOpen(false)} className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                                          <UserMinus className="h-3 w-3 mr-1" />
                                          Check In
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            </div>
                          </ScrollArea>
                          
                          {/* Fixed Total Section */}
                          <div className="flex-shrink-0 pt-2 sm:pt-3 mt-2 sm:mt-3 border-t bg-background">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm sm:text-base">Total Value:</span>
                              <span className="font-bold text-sm sm:text-base md:text-lg text-primary">
                                {formatCurrency(personAssets.reduce((sum, asset) => sum + asset.value, 0))}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-6 sm:py-8">
                          <User className="h-8 w-8 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                          <p className="text-xs sm:text-sm text-center px-4">No assets currently assigned to this person.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Asset Details Dialog */}
      <Dialog open={isAssetDetailsOpen} onOpenChange={setIsAssetDetailsOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b bg-background">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl font-bold break-words leading-tight">
                    {selectedAsset?.name}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1 break-words">
                    Asset ID: <span className="font-mono font-medium">{selectedAsset?.id}</span>
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveEdit} size="sm" className="h-9">
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm" className="h-9">
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEditClick} size="sm" className="h-9">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedAsset && (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4 pb-4">
                  {/* Asset Image */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-purple-100 rounded">
                          <ImageIcon className="h-3 w-3 text-purple-600" />
                        </div>
                        Asset Image
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-center">
                          {selectedAsset.imageUrl ? (
                            <img
                              src={selectedAsset.imageUrl}
                              alt={selectedAsset.name}
                              className="max-w-full max-h-64 object-contain rounded-lg border shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                      <ImageIcon class="h-12 w-12 mb-2 opacity-50" />
                                      <p class="text-sm">Image not available</p>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : selectedAsset.imageFileName ? (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                              <p className="text-sm font-medium">{selectedAsset.imageFileName}</p>
                              <p className="text-xs text-muted-foreground mt-1">Image file uploaded</p>
                              <p className="text-xs text-muted-foreground mt-2">Click Edit to add image URL</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                              <p className="text-sm">No image data found</p>
                              <p className="text-xs text-muted-foreground mt-1">Add image during asset creation or edit</p>
                            </div>
                          )}
                        </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-blue-100 rounded">
                          <Package className="h-3 w-3 text-blue-600" />
                        </div>
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Asset Tag ID</p>
                          <p className="text-sm font-mono font-semibold">{selectedAsset.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Asset Name</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.name || ''}
                              onChange={(e) => handleFieldChange('name', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm font-medium">{selectedAsset.name || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Category</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.category || ''}
                              onChange={(e) => handleFieldChange('category', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.category || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Sub Category</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.subCategory || ''}
                              onChange={(e) => handleFieldChange('subCategory', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.subCategory || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Status</p>
                          {isEditing ? (
                            <Select value={editedAsset?.status || ''} onValueChange={(value) => handleFieldChange('status', value)}>
                              <SelectTrigger className="text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Check Out">Check Out</SelectItem>
                                <SelectItem value="Move">Move</SelectItem>
                                <SelectItem value="Reserve">Reserve</SelectItem>
                                <SelectItem value="Lease">Lease</SelectItem>
                                <SelectItem value="Dispose">Dispose</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={`${statusColors[selectedAsset.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"} text-xs px-2 py-0.5`}
                            >
                              {selectedAsset.status || 'Unknown'}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Asset Type</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.assetType || ''}
                              onChange={(e) => handleFieldChange('assetType', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.assetType || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location & Assignment */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-green-100 rounded">
                          <MapPin className="h-3 w-3 text-green-600" />
                        </div>
                        Location & Assignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Location</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.location || ''}
                              onChange={(e) => handleFieldChange('location', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.location || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Site</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.site || ''}
                              onChange={(e) => handleFieldChange('site', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.site || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Department</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.department || ''}
                              onChange={(e) => handleFieldChange('department', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.department || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Assigned To</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.assignedTo || ''}
                              onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter assigned person"
                            />
                          ) : selectedAsset.assignedTo ? (
                            <button
                              onClick={() => {
                                setIsAssetDetailsOpen(false)
                                handlePersonClick(selectedAsset.assignedTo!)
                              }}
                              className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm transition-colors text-left"
                            >
                              {selectedAsset.assignedTo}
                            </button>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Unassigned</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical Specifications */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-purple-100 rounded">
                          <Settings className="h-3 w-3 text-purple-600" />
                        </div>
                        Technical Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Brand</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.brand || ''}
                              onChange={(e) => handleFieldChange('brand', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter brand"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.brand || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Model</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.model || ''}
                              onChange={(e) => handleFieldChange('model', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter model"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.model || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Manufacturer</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.manufacturer || ''}
                              onChange={(e) => handleFieldChange('manufacturer', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter manufacturer"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.manufacturer || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Serial Number</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.serialNumber || ''}
                              onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                              className="text-sm h-8 font-mono"
                              placeholder="Enter serial number"
                            />
                          ) : (
                            <p className="text-sm font-mono">{selectedAsset.serialNumber || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-yellow-100 rounded">
                          <DollarSign className="h-3 w-3 text-yellow-600" />
                        </div>
                        Financial Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Cost / Value</p>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedAsset?.value || 0}
                              onChange={(e) => handleFieldChange('value', parseFloat(e.target.value) || 0)}
                              className="text-sm h-8"
                              placeholder="0.00"
                            />
                          ) : (
                            <p className="text-sm font-bold text-green-600">{formatCurrency(selectedAsset.value)}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Purchase Date</p>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editedAsset?.purchaseDate || ''}
                              onChange={(e) => handleFieldChange('purchaseDate', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.purchaseDate ? formatDate(selectedAsset.purchaseDate) : 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Date Acquired</p>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editedAsset?.dateAcquired || ''}
                              onChange={(e) => handleFieldChange('dateAcquired', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.dateAcquired ? formatDate(selectedAsset.dateAcquired) : 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Purchased From</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.purchasedFrom || ''}
                              onChange={(e) => handleFieldChange('purchasedFrom', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter supplier/vendor"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.purchasedFrom || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Information */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-slate-100 rounded">
                          <FileText className="h-3 w-3 text-slate-600" />
                        </div>
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Created At</p>
                          <p className="text-sm text-muted-foreground">{selectedAsset.createdAt ? formatDateTime(selectedAsset.createdAt) : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                          <p className="text-sm text-muted-foreground">{selectedAsset.updatedAt ? formatDateTime(selectedAsset.updatedAt) : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Image URL</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.imageUrl || ''}
                              onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                              className="text-sm h-8"
                              placeholder="https://..."
                            />
                          ) : selectedAsset.imageUrl ? (
                            <a 
                              href={selectedAsset.imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block"
                            >
                              View Image
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">N/A</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Image File Name</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.imageFileName || ''}
                              onChange={(e) => handleFieldChange('imageFileName', e.target.value)}
                              className="text-sm h-8"
                              placeholder="filename.jpg"
                            />
                          ) : (
                            <p className="text-sm font-mono text-xs">{selectedAsset.imageFileName || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description & Notes */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-orange-100 rounded">
                          <FileText className="h-3 w-3 text-orange-600" />
                        </div>
                        Description & Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Description</p>
                      {isEditing ? (
                        <textarea
                          value={editedAsset?.description || ''}
                          onChange={(e) => handleFieldChange('description', e.target.value)}
                            className="w-full min-h-[80px] p-3 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Enter asset description..."
                        />
                      ) : (
                          <div className="bg-muted/30 p-3 rounded-md border">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {selectedAsset.description || 'No description provided'}
                          </p>
                        </div>
                      )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Additional Notes</p>
                        {isEditing ? (
                          <textarea
                            value={editedAsset?.notes || ''}
                            onChange={(e) => handleFieldChange('notes', e.target.value)}
                            className="w-full min-h-[80px] p-3 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Enter additional notes..."
                          />
                        ) : (
                          <div className="bg-muted/30 p-3 rounded-md border">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {selectedAsset.notes || 'No additional notes'}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
            )}
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Confirm Save Changes
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to save the changes to this asset? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={cancelSaveEdit}>
              Cancel
            </Button>
            <Button onClick={confirmSaveEdit}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Options Dialog */}
      <Dialog open={showQrOptionsDialog} onOpenChange={setShowQrOptionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Scan QR Code
            </DialogTitle>
            <DialogDescription>
              Choose how you want to scan the QR code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Button
                onClick={handleCameraScan}
                className="w-full flex items-center gap-4 p-4 h-auto justify-start"
                variant="outline"
              >
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                  <Camera className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">Use Camera</div>
                  <div className="text-xs text-muted-foreground">Scan QR code with your device camera</div>
                </div>
              </Button>
              
              <Button
                onClick={handleFileUploadScan}
                className="w-full flex items-center gap-4 p-4 h-auto justify-start"
                variant="outline"
              >
                <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">Upload Image</div>
                  <div className="text-xs text-muted-foreground">Upload a QR code image file</div>
                </div>
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowQrOptionsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Scan QR Code
            </DialogTitle>
            <DialogDescription>
              Point your camera at a QR code to scan an asset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div id="qr-reader" className="w-full"></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsQrScannerOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unrecognized QR Code Dialog */}
      <Dialog open={showUnrecognizedQrDialog} onOpenChange={setShowUnrecognizedQrDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              QR Code Not Recognized
            </DialogTitle>
            <DialogDescription>
              {unrecognizedQrData.includes('Unable to decode') 
                ? "The image doesn't contain a readable QR code or the QR code format is not supported."
                : "The scanned QR code doesn't contain a valid asset ID or the asset doesn't exist in the system."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Scanned Data:</div>
              <div className="text-sm break-words bg-background p-2 rounded border">
                {unrecognizedQrData}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">This could happen if:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {unrecognizedQrData.includes('Unable to decode') ? (
                  <>
                    <li>The image doesn't contain a QR code</li>
                    <li>The QR code is too blurry or damaged</li>
                    <li>The image format is not supported</li>
                    <li>The QR code is too small or too large</li>
                    <li>The image is corrupted or incomplete</li>
                  </>
                ) : (
                  <>
                    <li>The QR code is not from this system</li>
                    <li>The asset has been deleted</li>
                    <li>The QR code is corrupted or damaged</li>
                    <li>The asset ID format is incorrect</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUnrecognizedQrDialog(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setShowUnrecognizedQrDialog(false)
                  setShowQrOptionsDialog(true)
                }}
              >
                Scan Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        description="Are you sure you want to delete this asset? This action cannot be undone and will permanently remove the asset from your inventory."
        itemName={deletingAsset?.id || deletingAsset?.name}
      />
    </SidebarProvider>
  )
}
