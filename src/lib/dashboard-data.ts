import { WidgetType, WidgetSize, Widget } from '@/types/widgets';

// Mock data for widgets
export const mockAssetStats = {
  totalAssets: 1247,
  activeAssets: 1156,
  maintenanceDue: 23,
  totalValue: 2847500
};

export const mockRecentAssets = [
  { id: 'AST-001', name: 'MacBook Pro 16"', category: 'IT Equipment', status: 'In Use', assignedTo: 'John Smith' },
  { id: 'AST-002', name: 'Dell Monitor 27"', category: 'IT Equipment', status: 'Available', assignedTo: 'Unassigned' },
  { id: 'AST-003', name: 'Office Chair', category: 'Furniture', status: 'In Use', assignedTo: 'Sarah Johnson' },
  { id: 'AST-004', name: 'Projector', category: 'IT Equipment', status: 'Maintenance', assignedTo: 'IT Department' },
  { id: 'AST-005', name: 'Toyota Camry', category: 'Vehicle', status: 'In Use', assignedTo: 'Mike Wilson' }
];

export const mockAssetLocations = [
  { location: 'Main Office', count: 456 },
  { location: 'Branch Office - Downtown', count: 234 },
  { location: 'Branch Office - Suburbs', count: 189 },
  { location: 'Central Warehouse', count: 178 },
  { location: 'Remote Sites', count: 190 }
];

export const mockMaintenanceAlerts = [
  { id: 'MA-001', asset: 'AST-001', type: 'Preventive', dueDate: '2024-01-15', priority: 'High' },
  { id: 'MA-002', asset: 'AST-004', type: 'Repair', dueDate: '2024-01-12', priority: 'Medium' },
  { id: 'MA-003', asset: 'AST-005', type: 'Inspection', dueDate: '2024-01-20', priority: 'Low' }
];

export const mockDepartments = [
  { name: 'IT Department', assetCount: 234, value: 1250000 },
  { name: 'Sales Department', assetCount: 89, value: 450000 },
  { name: 'Marketing Department', assetCount: 67, value: 320000 },
  { name: 'Operations Department', assetCount: 156, value: 780000 },
  { name: 'HR Department', assetCount: 45, value: 200000 }
];

// Default widget configurations
export const widgetConfigs = {
  'asset-stats': {
    type: 'asset-stats' as WidgetType,
    title: 'Asset Statistics',
    description: 'Overview of total assets, active assets, and maintenance alerts',
    icon: '📊',
    defaultSize: 'large' as WidgetSize
  },
  'recent-assets': {
    type: 'recent-assets' as WidgetType,
    title: 'Recent Assets',
    description: 'List of recently added or modified assets',
    icon: '📦',
    defaultSize: 'medium' as WidgetSize
  },
  'asset-location': {
    type: 'asset-location' as WidgetType,
    title: 'Asset Locations',
    description: 'Distribution of assets across different locations',
    icon: '📍',
    defaultSize: 'medium' as WidgetSize
  },
  'maintenance-alerts': {
    type: 'maintenance-alerts' as WidgetType,
    title: 'Maintenance Alerts',
    description: 'Upcoming maintenance schedules and alerts',
    icon: '⚠️',
    defaultSize: 'medium' as WidgetSize
  },
  'quick-actions': {
    type: 'quick-actions' as WidgetType,
    title: 'Quick Actions',
    description: 'Quick access to common asset management tasks',
    icon: '⚡',
    defaultSize: 'small' as WidgetSize
  },
  'asset-value-chart': {
    type: 'asset-value-chart' as WidgetType,
    title: 'Asset Value Chart',
    description: 'Chart showing asset values over time',
    icon: '📈',
    defaultSize: 'large' as WidgetSize
  },
  'department-overview': {
    type: 'department-overview' as WidgetType,
    title: 'Department Overview',
    description: 'Asset distribution across departments',
    icon: '🏢',
    defaultSize: 'medium' as WidgetSize
  },
  'asset-status-pie': {
    type: 'asset-status-pie' as WidgetType,
    title: 'Asset Status',
    description: 'Pie chart showing asset status distribution',
    icon: '🥧',
    defaultSize: 'small' as WidgetSize
  }
};

// Default dashboard layout
export const defaultWidgets: Widget[] = [
  {
    id: 'widget-1',
    type: 'asset-stats',
    title: 'Asset Statistics',
    size: 'large',
    position: { x: 0, y: 0 }
  },
  {
    id: 'widget-2',
    type: 'recent-assets',
    title: 'Recent Assets',
    size: 'medium',
    position: { x: 0, y: 1 }
  },
  {
    id: 'widget-3',
    type: 'quick-actions',
    title: 'Quick Actions',
    size: 'small',
    position: { x: 1, y: 1 }
  }
];
