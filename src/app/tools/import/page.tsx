"use client"

import { useState, useCallback } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Upload, ArrowLeft, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DataManager } from "@/lib/lists-data"

interface ImportedAsset {
  assetId: string
  name: string
  category: string
  location: string
  status: string
  value: number
  purchaseDate: string
  assignedTo?: string
  department?: string
  serialNumber?: string
  manufacturer?: string
  model?: string
  description?: string
  notes?: string
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importedData, setImportedData] = useState<ImportedAsset[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please select a valid CSV or Excel file")
      return
    }

    setFile(selectedFile)
    setImportedData([])
    setErrors([])
    processFile(selectedFile)
  }, [])

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulate file processing
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Mock imported data - in real implementation, this would parse the actual file
      const mockData: ImportedAsset[] = [
        {
          assetId: "AST-101",
          name: "Dell Laptop XPS 13",
          category: "IT Equipment",
          location: "IT Storage Room",
          status: "Available",
          value: 1200,
          purchaseDate: "2024-01-15",
          assignedTo: "John Doe",
          department: "IT",
          serialNumber: "DLX2024001",
          manufacturer: "Dell Technologies",
          model: "XPS 13",
          description: "High-performance laptop for development",
          notes: "New purchase"
        },
        {
          assetId: "AST-102",
          name: "Office Chair Ergonomic",
          category: "Furniture",
          location: "Office Floor 1",
          status: "In Use",
          value: 350,
          purchaseDate: "2024-01-20",
          assignedTo: "Jane Smith",
          department: "Operations",
          serialNumber: "CHAIR2024002",
          manufacturer: "OfficeMax",
          model: "Ergonomic Pro",
          description: "Ergonomic office chair with lumbar support",
          notes: "Assigned to new employee"
        },
        {
          assetId: "AST-103",
          name: "HP LaserJet Printer",
          category: "Office Equipment",
          location: "Office Floor 2",
          status: "Available",
          value: 450,
          purchaseDate: "2024-02-01",
          department: "Administration",
          serialNumber: "HP2024003",
          manufacturer: "HP Inc.",
          model: "LaserJet Pro",
          description: "Network printer for office use",
          notes: "Shared office printer"
        }
      ]

      setImportedData(mockData)
      toast.success("File processed successfully!")
    } catch (error) {
      console.error("Error processing file:", error)
      toast.error("Error processing file. Please try again.")
      setErrors(["Failed to process file. Please check the file format and try again."])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (importedData.length === 0) {
      toast.error("No data to import")
      return
    }

    setIsImporting(true)
    setProgress(0)

    try {
      const dataManager = DataManager.getInstance()
      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < importedData.length; i++) {
        try {
          await dataManager.addAsset({
            name: importedData[i].name,
            category: importedData[i].category,
            location: importedData[i].location,
            status: importedData[i].status as "Available" | "In Use" | "Maintenance" | "Disposed",
            value: importedData[i].value,
            purchaseDate: importedData[i].purchaseDate,
            assignedTo: importedData[i].assignedTo || null,
            department: importedData[i].department || "Unassigned",
            serialNumber: importedData[i].serialNumber,
            manufacturer: importedData[i].manufacturer,
            model: importedData[i].model,
            description: importedData[i].description,
            notes: importedData[i].notes
          })
          successCount++
        } catch (error) {
          errorCount++
          console.error(`Error importing asset ${importedData[i].assetId}:`, error)
        }

        setProgress(((i + 1) / importedData.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} assets!`)
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} assets failed to import`)
      }

      // Clear the imported data after successful import
      setImportedData([])
      setFile(null)
    } catch (error) {
      console.error("Error during import:", error)
      toast.error("Import failed. Please try again.")
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "Asset ID,Name,Category,Location,Status,Value,Purchase Date,Assigned To,Department,Serial Number,Manufacturer,Model,Description,Notes\nAST-001,MacBook Pro 16\",IT Equipment,IT Storage Room,Available,2500,2024-01-15,John Doe,IT,MBP2024001,Apple Inc.,MacBook Pro 16-inch,High-performance laptop,New purchase"
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asset-import-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Import</h1>
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
                  <BreadcrumbPage>Import</BreadcrumbPage>
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
                  <h1 className="text-3xl font-bold tracking-tight">Import Assets</h1>
                  <p className="text-muted-foreground">
                    Upload bulk asset data from spreadsheets (CSV/Excel)
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>
                  Select a CSV or Excel file containing asset data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Choose File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isProcessing || isImporting}
                  />
                </div>

                {file && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing file...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            {importedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview Data</CardTitle>
                  <CardDescription>
                    Review the data before importing. {importedData.length} assets found.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Assigned To</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importedData.map((asset, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{asset.assetId}</TableCell>
                            <TableCell>{asset.name}</TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>{asset.location}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                                asset.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                                asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {asset.status}
                              </span>
                            </TableCell>
                            <TableCell>${asset.value.toLocaleString()}</TableCell>
                            <TableCell>{asset.assignedTo || 'Unassigned'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImportedData([])
                        setFile(null)
                        setErrors([])
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="flex items-center gap-2"
                    >
                      {isImporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Import {importedData.length} Assets
                        </>
                      )}
                    </Button>
                  </div>

                  {isImporting && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Importing assets...</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}

