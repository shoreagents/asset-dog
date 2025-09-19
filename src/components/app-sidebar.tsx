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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
  teams: [
    {
      name: "Asset Dog",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "IT Department",
      logo: AudioWaveform,
      plan: "Professional",
    },
    {
      name: "Operations",
      logo: Command,
      plan: "Standard",
    },
  ],
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
        <TeamSwitcher teams={data.teams} />
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

