// Widget types and interfaces
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  data?: any;
}

export type WidgetType = 
  | 'asset-stats'
  | 'recent-assets'
  | 'asset-location'
  | 'maintenance-alerts'
  | 'quick-actions'
  | 'asset-value-chart'
  | 'department-overview'
  | 'asset-status-pie';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetConfig {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
}
