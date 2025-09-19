"use client"

import { useState, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { Widget, WidgetType, WidgetSize } from '@/types/widgets'
import { widgetConfigs, defaultWidgets } from '@/lib/dashboard-data'

// Widget component imports
import { AssetStatsWidget } from '@/components/widgets/asset-stats-widget'
import { RecentAssetsWidget } from '@/components/widgets/recent-assets-widget'
import { MaintenanceAlertsWidget } from '@/components/widgets/maintenance-alerts-widget'
import { QuickActionsWidget } from '@/components/widgets/quick-actions-widget'
import { AssetLocationWidget } from '@/components/widgets/asset-location-widget'
import { DepartmentOverviewWidget } from '@/components/widgets/department-overview-widget'
import { AssetStatusPieWidget } from '@/components/widgets/asset-status-pie-widget'
import { AssetValueChartWidget } from '@/components/widgets/asset-value-chart-widget'

// Widget component mapping
const widgetComponents = {
  'asset-stats': AssetStatsWidget,
  'recent-assets': RecentAssetsWidget,
  'maintenance-alerts': MaintenanceAlertsWidget,
  'quick-actions': QuickActionsWidget,
  'asset-location': AssetLocationWidget,
  'department-overview': DepartmentOverviewWidget,
  'asset-status-pie': AssetStatusPieWidget,
  'asset-value-chart': AssetValueChartWidget,
}

export function useDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets)

  const addWidget = useCallback((type: WidgetType) => {
    const config = widgetConfigs[type]
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: config.title,
      size: config.defaultSize,
      position: { x: 0, y: widgets.length }
    }
    setWidgets(prev => [...prev, newWidget])
  }, [widgets.length])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id))
  }, [])

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ))
  }, [])

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setWidgets(prev => {
      const oldIndex = prev.findIndex(widget => widget.id === activeId)
      const newIndex = prev.findIndex(widget => widget.id === overId)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const getWidgetComponent = useCallback((type: WidgetType) => {
    return widgetComponents[type]
  }, [])

  const getAvailableWidgets = useCallback(() => {
    const usedTypes = new Set(widgets.map(w => w.type))
    return Object.entries(widgetConfigs).filter(([type]) => !usedTypes.has(type as WidgetType))
  }, [widgets])

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    getWidgetComponent,
    getAvailableWidgets,
    widgetConfigs
  }
}
