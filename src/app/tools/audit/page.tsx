"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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
import { Search, ArrowLeft, Camera, CheckCircle, XCircle, AlertTriangle, Play, Pause, Square } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DataManager } from "@/lib/lists-data"

interface AuditItem {
  id: string
  assetId: string
  assetName: string
  category: string
  location: string
  status: string
  expectedLocation: string
  expectedStatus: string
  scanned: boolean
  verified: boolean
  notes?: string
  scannedAt?: string
}

export default function AuditPage() {
  const { formatDate } = useSystemSettings()
  const [isAuditing, setIsAuditing] = useState(false)
  const [scanInput, setScanInput] = useState("")
  const [auditItems, setAuditItems] = useState<AuditItem[]>([])
  const [currentAudit, setCurrentAudit] = useState<{
    id: string
    name: string
    startTime: string
    progress: number
  } | null>(null)

  // Mock audit data
  const mockAuditItems: AuditItem[] = [
    {
      id: "AUD-001",
      assetId: "AST-001",
      assetName: "MacBook Pro 16\"",
      category: "IT Equipment",
      location: "IT Storage Room",
      status: "Available",
      expectedLocation: "IT Storage Room",
      expectedStatus: "Available",
      scanned: false,
      verified: false
    },
    {
      id: "AUD-002",
      assetId: "AST-002",
      assetName: "Dell Monitor 27\"",
      category: "IT Equipment",
      location: "Office Floor 2",
      status: "In Use",
      expectedLocation: "Office Floor 2",
      expectedStatus: "In Use",
      scanned: false,
      verified: false
    },
    {
      id: "AUD-003",
      assetId: "AST-003",
      assetName: "Office Chair",
      category: "Furniture",
      location: "Office Floor 1",
      status: "Available",
      expectedLocation: "Office Floor 1",
      expectedStatus: "Available",
      scanned: false,
      verified: false
    },
    {
      id: "AUD-004",
      assetId: "AST-004",
      assetName: "Toyota Camry",
      category: "Vehicle",
      location: "Parking Garage",
      status: "In Use",
      expectedLocation: "Parking Garage",
      expectedStatus: "In Use",
      scanned: false,
      verified: false
    },
    {
      id: "AUD-005",
      assetId: "AST-005",
      assetName: "Projector",
      category: "IT Equipment",
      location: "Conference Room",
      status: "Maintenance",
      expectedLocation: "Conference Room",
      expectedStatus: "Available",
      scanned: false,
      verified: false
    }
  ]

  const startAudit = () => {
    const auditId = `AUDIT-${Date.now()}`
    const auditName = `Asset Audit - ${formatDate(new Date())}`
    
    setCurrentAudit({
      id: auditId,
      name: auditName,
      startTime: new Date().toISOString(),
      progress: 0
    })
    
    setAuditItems(mockAuditItems)
    setIsAuditing(true)
    toast.success("Audit started successfully!")
  }

  const pauseAudit = () => {
    setIsAuditing(false)
    toast.info("Audit paused")
  }

  const resumeAudit = () => {
    setIsAuditing(true)
    toast.info("Audit resumed")
  }

  const stopAudit = () => {
    setIsAuditing(false)
    setCurrentAudit(null)
    setAuditItems([])
    setScanInput("")
    toast.success("Audit completed!")
  }

  const handleScan = () => {
    if (!scanInput.trim()) {
      toast.error("Please enter an asset ID or scan a barcode")
      return
    }

    const assetId = scanInput.trim().toUpperCase()
    const itemIndex = auditItems.findIndex(item => item.assetId === assetId)
    
    if (itemIndex === -1) {
      toast.error(`Asset ${assetId} not found in audit list`)
      return
    }

    const item = auditItems[itemIndex]
    const updatedItems = [...auditItems]
    
    updatedItems[itemIndex] = {
      ...item,
      scanned: true,
      scannedAt: new Date().toISOString(),
      verified: item.location === item.expectedLocation && item.status === item.expectedStatus
    }

    setAuditItems(updatedItems)
    setScanInput("")

    // Update progress
    const scannedCount = updatedItems.filter(item => item.scanned).length
    const progress = (scannedCount / updatedItems.length) * 100
    
    if (currentAudit) {
      setCurrentAudit(prev => prev ? { ...prev, progress } : null)
    }

    if (updatedItems[itemIndex].verified) {
      toast.success(`Asset ${assetId} verified successfully!`)
    } else {
      toast.warning(`Asset ${assetId} location or status mismatch detected`)
    }
  }

  const getStatusColor = (item: AuditItem) => {
    if (!item.scanned) return "bg-gray-100 text-gray-800"
    if (item.verified) return "bg-green-100 text-green-800"
    return "bg-red-100 text-red-800"
  }

  const getStatusIcon = (item: AuditItem) => {
    if (!item.scanned) return <AlertTriangle className="h-4 w-4" />
    if (item.verified) return <CheckCircle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  const scannedCount = auditItems.filter(item => item.scanned).length
  const verifiedCount = auditItems.filter(item => item.verified).length
  const discrepancyCount = scannedCount - verifiedCount

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Audit</h1>
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
                  <BreadcrumbPage>Audit</BreadcrumbPage>
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
                  <h1 className="text-3xl font-bold tracking-tight">Asset Audit</h1>
                  <p className="text-muted-foreground">
                    Conduct audits by scanning barcodes/QR codes and verifying asset details
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Controls</CardTitle>
                <CardDescription>
                  Start, pause, or stop an asset audit session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {!currentAudit ? (
                    <Button onClick={startAudit} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Start New Audit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={isAuditing ? pauseAudit : resumeAudit}
                        variant={isAuditing ? "outline" : "default"}
                        className="flex items-center gap-2"
                      >
                        {isAuditing ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Pause Audit
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Resume Audit
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={stopAudit}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Stop Audit
                      </Button>
                    </div>
                  )}
                </div>

                {currentAudit && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Audit Progress</span>
                      <span>{currentAudit.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={currentAudit.progress} className="w-full" />
                    <div className="text-sm text-muted-foreground">
                      {currentAudit.name} • Started: {new Date(currentAudit.startTime).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scan Input */}
            {currentAudit && (
              <Card>
                <CardHeader>
                  <CardTitle>Scan Asset</CardTitle>
                  <CardDescription>
                    Enter asset ID manually or scan barcode/QR code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter Asset ID or scan barcode..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleScan()
                          }
                        }}
                      />
                    </div>
                    <Button onClick={handleScan} disabled={!scanInput.trim()}>
                      <Camera className="h-4 w-4 mr-2" />
                      Scan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audit Summary */}
            {currentAudit && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{auditItems.length}</div>
                    <div className="text-sm text-muted-foreground">Total Assets</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{scannedCount}</div>
                    <div className="text-sm text-muted-foreground">Scanned</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{discrepancyCount}</div>
                    <div className="text-sm text-muted-foreground">Discrepancies</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Audit Items */}
            {currentAudit && (
              <Card>
                <CardHeader>
                  <CardTitle>Audit Items</CardTitle>
                  <CardDescription>
                    Track the progress of each asset in the audit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Asset ID</TableHead>
                          <TableHead>Asset Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Expected Location</TableHead>
                          <TableHead>Actual Location</TableHead>
                          <TableHead>Expected Status</TableHead>
                          <TableHead>Actual Status</TableHead>
                          <TableHead>Scanned At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge className={getStatusColor(item)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(item)}
                                  {!item.scanned ? "Pending" : item.verified ? "Verified" : "Discrepancy"}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.assetId}</TableCell>
                            <TableCell>{item.assetName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.expectedLocation}</TableCell>
                            <TableCell className={item.location !== item.expectedLocation ? "text-red-600" : ""}>
                              {item.location}
                            </TableCell>
                            <TableCell>{item.expectedStatus}</TableCell>
                            <TableCell className={item.status !== item.expectedStatus ? "text-red-600" : ""}>
                              {item.status}
                            </TableCell>
                            <TableCell>
                              {item.scannedAt ? new Date(item.scannedAt).toLocaleTimeString() : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {!currentAudit && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>How to conduct an audit:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Click &quot;Start New Audit&quot; to begin</li>
                    <li>Use the scan input to enter asset IDs or scan barcodes</li>
                    <li>Verify that each asset is in the expected location and status</li>
                    <li>Review any discrepancies and update asset records as needed</li>
                    <li>Stop the audit when complete to generate a report</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}
