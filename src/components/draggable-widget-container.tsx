"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, GripVertical } from 'lucide-react'
import { Widget, WidgetSize } from '@/types/widgets'
import { widgetConfigs } from '@/lib/dashboard-data'
import { useEffect, useState } from 'react'

interface DraggableWidgetContainerProps {
  widget: Widget
  onRemove: (id: string) => void
  children: React.ReactNode
}

export function DraggableWidgetContainer({ widget, onRemove, children }: DraggableWidgetContainerProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id })

  const config = widgetConfigs[widget.type]
  
  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-2'
      case 'large': return 'col-span-3'
      default: return 'col-span-2'
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Render static version during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`${getSizeClasses(widget.size)} group`}>
        <Card className="h-full hover:shadow-md transition-all duration-300 ease-in-out">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <CardTitle className="text-lg">{widget.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="outline" className="text-xs">
                  {widget.size}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled
                >
                  <GripVertical className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(widget.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {config.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`${getSizeClasses(widget.size)} group sortable-item`}
    >
      <Card className="h-full hover:shadow-md transition-all duration-300 ease-in-out">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="text-xs">
                {widget.size}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 drag-handle"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(widget.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
