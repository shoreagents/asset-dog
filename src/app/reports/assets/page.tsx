"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface ReportFilter {    
  category: string;
  location: string;
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  costRange: {
    min: string;
    max: string;
  };
  selectedFields: string[];
}

interface AssetData {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  purchaseDate: string;
  cost: number;
  assignedTo: string;
  department: string;
}

const availableFields = [
  { id: "id", label: "Asset ID" },
  { id: "name", label: "Asset Name" },
  { id: "category", label: "Category" },
  { id: "location", label: "Location" },
  { id: "status", label: "Status" },
  { id: "purchaseDate", label: "Purchase Date" },
  { id: "cost", label: "Cost" },
  { id: "assignedTo", label: "Assigned To" },
  { id: "department", label: "Department" },
];

const categories = ["IT Equipment", "Furniture", "Vehicles", "Tools", "Machinery"];
const locations = ["Main Office", "Warehouse", "Branch Office", "Remote"];
const statuses = ["Available", "Checked Out", "Under Maintenance", "Disposed", "Leased"];

export default function ReportsAssetsPage() {
  const [filters, setFilters] = useState<ReportFilter>({
    category: "",
    location: "",
    status: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    costRange: {
      min: "",
      max: "",
    },
    selectedFields: ["id", "name", "category", "location", "status"],
  });

  const [generatedReport, setGeneratedReport] = useState<AssetData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const mockAssets: AssetData[] = [
    {
      id: "AST-001",
      name: "Dell Laptop",
      category: "IT Equipment",
      location: "Main Office",
      status: "Available",
      purchaseDate: "2023-01-15",
      cost: 1200,
      assignedTo: "John Doe",
      department: "IT",
    },
    {
      id: "AST-002",
      name: "Office Chair",
      category: "Furniture",
      location: "Main Office",
      status: "Checked Out",
      purchaseDate: "2023-02-20",
      cost: 350,
      assignedTo: "Jane Smith",
      department: "HR",
    },
    {
      id: "AST-003",
      name: "Company Van",
      category: "Vehicles",
      location: "Warehouse",
      status: "Leased",
      purchaseDate: "2022-11-10",
      cost: 25000,
      assignedTo: "Delivery Team",
      department: "Operations",
    },
  ];

  const handleFieldToggle = (fieldId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldId)
        ? prev.selectedFields.filter(id => id !== fieldId)
        : [...prev.selectedFields, fieldId],
    }));
  };

  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      let filteredData = [...mockAssets];

      // Apply filters
      if (filters.category) {
        filteredData = filteredData.filter(asset => asset.category === filters.category);
      }
      if (filters.location) {
        filteredData = filteredData.filter(asset => asset.location === filters.location);
      }
      if (filters.status) {
        filteredData = filteredData.filter(asset => asset.status === filters.status);
      }
      if (filters.costRange.min) {
        filteredData = filteredData.filter(asset => asset.cost >= parseFloat(filters.costRange.min));
      }
      if (filters.costRange.max) {
        filteredData = filteredData.filter(asset => asset.cost <= parseFloat(filters.costRange.max));
      }

      setGeneratedReport(filteredData);
      setIsGenerating(false);
    }, 1000);
  };

  const exportReport = () => {
    const csvContent = [
      filters.selectedFields.join(","),
      ...generatedReport.map(asset => 
        filters.selectedFields.map(field => asset[field as keyof AssetData]).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asset-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/reports">
                    Reports
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Asset Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Asset Reports</h1>
                <p className="text-muted-foreground">
                  Generate custom reports with specific filters and data fields
                </p>
              </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Filters
              </CardTitle>
              <CardDescription>
                Customize your report with specific filters and data fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={filters.category || "all"} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, category: value === "all" ? "" : value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={filters.location || "all"} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, location: value === "all" ? "" : value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status || "all"} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost Range */}
              <div className="space-y-2">
                <Label>Cost Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.costRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      costRange: { ...prev.costRange, min: e.target.value }
                    }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.costRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      costRange: { ...prev.costRange, max: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Data Fields Selection */}
              <div className="space-y-2">
                <Label>Data Fields</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableFields.map(field => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={filters.selectedFields.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                      />
                      <Label htmlFor={field.id} className="text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Report Button */}
              <Button 
                onClick={generateReport} 
                className="w-full"
                disabled={isGenerating || filters.selectedFields.length === 0}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Filter className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Report Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Report Results</CardTitle>
                  <CardDescription>
                    {generatedReport.length} assets found
                  </CardDescription>
                </div>
                {generatedReport.length > 0 && (
                  <Button onClick={exportReport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedReport.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No report generated yet. Configure filters and click "Generate Report" to see results.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        {filters.selectedFields.map(fieldId => {
                          const field = availableFields.find(f => f.id === fieldId);
                          return (
                            <th key={fieldId} className="text-left p-2 font-medium">
                              {field?.label}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReport.map((asset, index) => (
                        <tr key={asset.id} className="border-b hover:bg-muted/50">
                          {filters.selectedFields.map(fieldId => (
                            <td key={fieldId} className="p-2">
                              {fieldId === "cost" 
                                ? `$${asset[fieldId as keyof AssetData].toLocaleString()}`
                                : asset[fieldId as keyof AssetData]
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
