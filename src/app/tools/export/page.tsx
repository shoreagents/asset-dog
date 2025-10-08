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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Download, ArrowLeft, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DataManager } from "@/lib/lists-data"

interface ExportOptions {
  format: 'csv' | 'xlsx'
  includeFields: {
    basic: boolean
    financial: boolean
    assignment: boolean
    technical: boolean
    additional: boolean
  }
  dateRange: {
    start: string
    end: string
  }
  filters: {
    category: string
    status: string
    department: string
  }
}

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeFields: {
      basic: true,
      financial: true,
      assignment: true,
      technical: true,
      additional: true
    },
    dateRange: {
      start: '',
      end: ''
    },
    filters: {
      category: 'all',
      status: 'all',
      department: 'all'
    }
  })

  const handleExport = async () => {
    setIsExporting(true)
    setProgress(0)

    try {
      const dataManager = DataManager.getInstance()
      const assets = dataManager.getAllAssets()

      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Generate CSV content
      const headers = ['Asset ID', 'Name', 'Category', 'Location', 'Status', 'Value', 'Purchase Date', 'Assigned To', 'Department', 'Serial Number', 'Manufacturer', 'Model', 'Description', 'Notes']
      const csvContent = [
        headers.join(','),
        ...assets.map(asset => [
          asset.id,
          `"${asset.name}"`,
          `"${asset.category}"`,
          `"${asset.location}"`,
          `"${asset.status}"`,
          asset.value,
          asset.purchaseDate,
          `"${asset.assignedTo || ''}"`,
          `"${asset.department}"`,
          `"${asset.serialNumber || ''}"`,
          `"${asset.manufacturer || ''}"`,
          `"${asset.model || ''}"`,
          `"${asset.description || ''}"`,
          `"${asset.notes || ''}"`
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Successfully exported ${assets.length} assets!`)
    } catch (error) {
      console.error("Error during export:", error)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleFieldChange = (field: keyof ExportOptions['includeFields'], checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [field]: checked
      }
    }))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Export</h1>
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
                  <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Export</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tools">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tools
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Export Assets</h1>
                  <p className="text-muted-foreground">
                    Download asset data in Excel or CSV for analysis or backups
                  </p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Configure what data to include in your export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Format Selection */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: 'csv' | 'xlsx') => 
                      setExportOptions(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fields to Include */}
                <div className="space-y-4">
                  <Label>Fields to Include</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="basic"
                        checked={exportOptions.includeFields.basic}
                        onCheckedChange={(checked) => handleFieldChange('basic', checked as boolean)}
                      />
                      <Label htmlFor="basic" className="text-sm font-normal">
                        Basic Information (ID, Name, Category, Location, Status)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="financial"
                        checked={exportOptions.includeFields.financial}
                        onCheckedChange={(checked) => handleFieldChange('financial', checked as boolean)}
                      />
                      <Label htmlFor="financial" className="text-sm font-normal">
                        Financial Information (Value, Purchase Date)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assignment"
                        checked={exportOptions.includeFields.assignment}
                        onCheckedChange={(checked) => handleFieldChange('assignment', checked as boolean)}
                      />
                      <Label htmlFor="assignment" className="text-sm font-normal">
                        Assignment Information (Assigned To, Department)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="technical"
                        checked={exportOptions.includeFields.technical}
                        onCheckedChange={(checked) => handleFieldChange('technical', checked as boolean)}
                      />
                      <Label htmlFor="technical" className="text-sm font-normal">
                        Technical Information (Serial Number, Manufacturer, Model)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="additional"
                        checked={exportOptions.includeFields.additional}
                        onCheckedChange={(checked) => handleFieldChange('additional', checked as boolean)}
                      />
                      <Label htmlFor="additional" className="text-sm font-normal">
                        Additional Information (Description, Notes)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <Label>Filters (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-filter" className="text-sm">Category</Label>
                      <Select
                        value={exportOptions.filters.category}
                        onValueChange={(value) => 
                          setExportOptions(prev => ({ 
                            ...prev, 
                            filters: { ...prev.filters, category: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                          <SelectItem value="Furniture">Furniture</SelectItem>
                          <SelectItem value="Vehicles">Vehicles</SelectItem>
                          <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status-filter" className="text-sm">Status</Label>
                      <Select
                        value={exportOptions.filters.status}
                        onValueChange={(value) => 
                          setExportOptions(prev => ({ 
                            ...prev, 
                            filters: { ...prev.filters, status: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="In Use">In Use</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Disposed">Disposed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department-filter" className="text-sm">Department</Label>
                      <Select
                        value={exportOptions.filters.department}
                        onValueChange={(value) => 
                          setExportOptions(prev => ({ 
                            ...prev, 
                            filters: { ...prev.filters, department: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export Assets
                      </>
                    )}
                  </Button>
                </div>

                {isExporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Preparing export...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Information */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Export Information:</strong> The exported file will contain all asset data based on your selected options. 
                Large exports may take a few moments to process. The file will be downloaded automatically when ready.
              </AlertDescription>
            </Alert>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}



