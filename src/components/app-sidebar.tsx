"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Package,
  Users,
  FileText,
  BarChart3,
  Shield,
  Plus,
  UserCheck,
  UserMinus,
  Move,
  Calendar,
  ArrowLeftRight,
  Trash2,
  Wrench,
  ShieldCheck,
  List,
  ClipboardList,
  Building2,
  MapPin,
  FolderOpen,
  Building,
  Database,
  Activity,
  Table,
  Archive,
  Cog,
  LayoutDashboard,
  FileEdit,
  Mail,
  Folder,
  MapPin as MapPinIcon,
  ArrowRight,
  Layers,
  Grid3X3,
  CheckSquare,
  Grid,
  Box,
  Settings,
  Layout,
  PenTool,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Asset Dog dashboard data
const data = {
  user: {
    name: "Asset Manager",
    email: "admin@assetdog.com",
    avatar: "/avatars/user.jpg",
  },
  company: {
    name: "Asset Dog",
    plan: "Enterprise",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Recent Activity",
          url: "/dashboard/activity",
        },
      ],
    },
    {
      title: "Assets",
      url: "/assets",
      icon: Package,
      items: [
        {
          title: "All Assets",
          url: "/assets",
        },
        {
          title: "Add Asset",
          url: "/assets/add",
          icon: Plus,
        },
        {
          title: "Check Out",
          url: "/assets/checkout",
          icon: UserCheck,
        },
        {
          title: "Check In",
          url: "/assets/checkin",
          icon: UserMinus,
        },
        {
          title: "Move Asset",
          url: "/assets/move",
          icon: Move,
        },
        {
          title: "Reserve Asset",
          url: "/assets/reserve",
          icon: Calendar,
        },
        {
          title: "Lease Asset",
          url: "/assets/lease",
          icon: ArrowLeftRight,
        },
        {
          title: "Lease Return",
          url: "/assets/lease-return",
          icon: ArrowLeftRight,
        },
        {
          title: "Dispose Asset",
          url: "/assets/dispose",
          icon: Trash2,
        },
        {
          title: "Maintenance",
          url: "/assets/maintenance",
          icon: Wrench,
        },
      ],
    },
    {
      title: "Lists",
      url: "/lists",
      icon: List,
      items: [
        {
          title: "List of Assets",
          url: "/lists/assets",
          icon: Package,
        },
        {
          title: "List of Maintenances",
          url: "/lists/maintenances",
          icon: Wrench,
        },
        {
          title: "List of Warranties",
          url: "/lists/warranties",
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/users",
        },
        {
          title: "Departments",
          url: "/users/departments",
        },
        {
          title: "Roles",
          url: "/users/roles",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      items: [
        {
          title: "Overview",
          url: "/reports",
        },
        {
          title: "Automated Reports",
          url: "/reports/automated",
        },
        {
          title: "Custom Reports",
          url: "/reports/custom",
        },
        {
          title: "Asset Reports",
          url: "/reports/assets",
        },
        {
          title: "Audit Reports",
          url: "/reports/audit",
        },
        {
          title: "Check-Out Reports",
          url: "/reports/checkout",
        },
        {
          title: "Depreciation Reports",
          url: "/reports/depreciation",
        },
        {
          title: "Insurance Reports",
          url: "/reports/insurance",
        },
        {
          title: "Leased Asset Reports",
          url: "/reports/leased",
        },
        {
          title: "Maintenance Reports",
          url: "/reports/maintenance",
        },
        {
          title: "Reservation Reports",
          url: "/reports/reservation",
        },
        {
          title: "Status Reports",
          url: "/reports/status",
        },
        {
          title: "Transaction Reports",
          url: "/reports/transaction",
        },
        {
          title: "Other Reports",
          url: "/reports/other",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Security",
          url: "/settings/security",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
        {
          title: "Backup",
          url: "/settings/backup",
        },
      ],
    },
    {
      title: "Setup",
      url: "/setup",
      icon: Cog,
      items: [
        {
          title: "Company Info.",
          url: "/setup/company-info",
          icon: Folder,
        },
        {
          title: "Sites",
          url: "/setup/sites",
          icon: MapPinIcon,
        },
        {
          title: "Locations",
          url: "/setup/locations",
          icon: ArrowRight,
        },
        {
          title: "Categories",
          url: "/setup/categories",
          icon: Layers,
        },
        {
          title: "Departments",
          url: "/setup/departments",
          icon: Layers,
        },
        {
          title: "Databases",
          url: "/setup/databases",
          icon: Database,
          items: [
            {
              title: "Assets Table",
              url: "/setup/databases/assets-table",
              icon: Layers,
            },
            {
              title: "Persons/Employees",
              url: "/setup/databases/persons-employees",
              icon: Users,
            },
            {
              title: "Customers Table",
              url: "/setup/databases/customers-table",
              icon: UserCheck,
            },
            {
              title: "Maintenance Table",
              url: "/setup/databases/maintenance-table",
              icon: Wrench,
            },
            {
              title: "Warranties Table",
              url: "/setup/databases/warranties-table",
              icon: Shield,
            },
            {
              title: "Contract Table",
              url: "/setup/databases/contract-table",
              icon: FileText,
            },
          ],
        },
        {
          title: "Events",
          url: "/setup/events",
          icon: CheckSquare,
        },
        {
          title: "Table Options",
          url: "/setup/table-options",
          icon: Grid,
        },
        {
          title: "Inventory",
          url: "/setup/inventory",
          icon: Box,
        },
        {
          title: "Options",
          url: "/setup/options",
          icon: Layers,
        },
        {
          title: "Manage Dashboard",
          url: "/setup/manage-dashboard",
          icon: Layout,
        },
        {
          title: "Customize Forms",
          url: "/setup/customize-forms",
          icon: PenTool,
          items: [
            {
              title: "Form Builder",
              url: "/setup/customize-forms/builder",
              icon: PenTool,
            },
            {
              title: "Form Templates",
              url: "/setup/customize-forms/templates",
              icon: FileText,
            },
          ],
        },
        {
          title: "Customize Emails",
          url: "/setup/customize-emails",
          icon: Mail,
        },
      ],
    },
    {
      title: "Tools",
      url: "/tools",
      icon: Wrench,
      items: [
        {
          title: "Import",
          url: "/tools/import",
          icon: Plus,
        },
        {
          title: "Export",
          url: "/tools/export",
          icon: FileText,
        },
        {
          title: "Documents Gallery",
          url: "/tools/documents",
          icon: FileText,
        },
        {
          title: "Image Gallery",
          url: "/tools/images",
          icon: GalleryVerticalEnd,
        },
        {
          title: "Audit",
          url: "/tools/audit",
          icon: ShieldCheck,
        },
      ],
    },
  ],
  projects: [
    {
      name: "IT Asset Management",
      url: "/projects/it-assets",
      icon: Shield,
    },
    {
      name: "Office Equipment",
      url: "/projects/office",
      icon: Frame,
    },
    {
      name: "Vehicle Fleet",
      url: "/projects/fleet",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          {/* Company Logo Placeholder */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GalleryVerticalEnd className="h-4 w-4 text-primary-foreground" />
          </div>
          
          {/* Company Name */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {data.company.name}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {data.company.plan}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

