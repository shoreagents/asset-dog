"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useDashboard } from "@/hooks/use-dashboard"
import { AddWidgetDialog } from "@/components/add-widget-dialog"
import { DraggableWidgetContainer } from "@/components/draggable-widget-container"
import { SortableProvider } from "@/components/sortable-provider"
import { Settings, BarChart3 } from "lucide-react"
import { DragEndEvent } from "@dnd-kit/core"

export default function Page() {
  const { 
    widgets, 
    addWidget, 
    removeWidget, 
    reorderWidgets,
    getWidgetComponent, 
    getAvailableWidgets 
  } = useDashboard()

  const availableWidgets = getAvailableWidgets()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      reorderWidgets(active.id as string, over?.id as string)
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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">
          {/* Dashboard Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your asset management system • Drag widgets to customize layout
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AddWidgetDialog 
                availableWidgets={availableWidgets}
                onAddWidget={addWidget}
              />
            </div>
          </div>
          
              <Separator />

              {/* Widgets Grid */}
          <SortableProvider 
            onDragEnd={handleDragEnd}
            items={widgets.map(w => w.id)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => {
                const WidgetComponent = getWidgetComponent(widget.type)
                return (
                  <DraggableWidgetContainer
                    key={widget.id}
                    widget={widget}
                    onRemove={removeWidget}
                  >
                    <WidgetComponent />
                  </DraggableWidgetContainer>
                )
              })}
            </div>
          </SortableProvider>

          {/* Empty State */}
          {widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No widgets added yet</h3>
              <p className="text-muted-foreground mb-4">
                Add widgets to customize your dashboard and monitor your assets
              </p>
              <AddWidgetDialog 
                availableWidgets={availableWidgets}
                onAddWidget={addWidget}
              />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}



