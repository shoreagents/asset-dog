import { CENTRALIZED_ASSETS, AssetData } from './centralized-assets'
import { Asset } from './imported-asset'
import { IMPORTED_ASSETS } from './imported-data'

// Re-export the comprehensive Asset interface from imported-asset
export { Asset } from './imported-asset'

export interface Maintenance {
  id: string
  assetId: string
  assetName: string
  type: "Preventive" | "Repair" | "Emergency"
  status: "Scheduled" | "In Progress" | "Completed" | "Overdue"
  scheduledDate: string
  completedDate: string | null
  technician: string
  cost: number
  description: string
  nextDue?: string | null
  priority?: "Low" | "Medium" | "High"
  notes?: string
}

export interface Warranty {
  id: string
  assetId: string
  assetName: string
  vendor: string
  type: "Manufacturer" | "Extended" | "Service"
  startDate: string
  endDate: string
  status: "Active" | "Expired" | "Expiring Soon"
  coverage: string
  contactInfo: string
  referenceNumber: string
  notes?: string
  cost?: number
}

// Data management utilities
export class DataManager {
  private static instance: DataManager
  private assets: Asset[] = []
  private maintenances: Maintenance[] = []
  private warranties: Warranty[] = []

  private constructor() {
    this.loadInitialData()
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  private loadInitialData() {
    // Use imported data as the primary source of truth
    this.assets = [...IMPORTED_ASSETS]
    this.maintenances = this.getDefaultMaintenances()
    this.warranties = this.getDefaultWarranties()
    
    // Load additional data from localStorage if available (for maintenances and warranties)
    if (typeof window !== 'undefined') {
      try {
        const savedMaintenances = localStorage.getItem('asset-dog-maintenances')
        const savedWarranties = localStorage.getItem('asset-dog-warranties')

        if (savedMaintenances) {
          this.maintenances = JSON.parse(savedMaintenances)
        }
        if (savedWarranties) {
          this.warranties = JSON.parse(savedWarranties)
        }
      } catch (error) {
        console.warn('Failed to load additional data from localStorage:', error)
      }
    }
  }

  private convertCentralizedAssets(): Asset[] {
    return CENTRALIZED_ASSETS.map(assetData => ({
      id: assetData.id,
      name: assetData.name,
      category: assetData.category,
      location: assetData.location,
      status: assetData.status,
      value: assetData.value,
      purchaseDate: assetData.purchaseDate,
      assignedTo: assetData.assignedTo,
      department: assetData.department,
      serialNumber: assetData.serialNumber,
      model: assetData.model,
      manufacturer: assetData.manufacturer,
      notes: assetData.notes
    }))
  }

  private saveData() {
    // Only save to localStorage if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    try {
      // Only save maintenances and warranties - assets come from centralized source
      localStorage.setItem('asset-dog-maintenances', JSON.stringify(this.maintenances))
      localStorage.setItem('asset-dog-warranties', JSON.stringify(this.warranties))
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error)
    }
  }

  private correctAssetData(asset: Asset): Asset {
    let correctedStatus = asset.status
    let correctedName = asset.name
    
    // If asset is assigned to someone but status is Available, change to In Use
    if (asset.assignedTo && asset.assignedTo.trim() !== '' && asset.assignedTo !== '0' && asset.status === 'Available') {
      correctedStatus = 'In Use'
    }
    
    // If name is "SEE SUB-CATEGORY", use subCategory or model/brand instead
    if (asset.name === 'SEE SUB-CATEGORY') {
      if (asset.subCategory && asset.subCategory.trim() !== '') {
        correctedName = asset.subCategory
      } else if (asset.model && asset.model.trim() !== '') {
        correctedName = asset.model
      } else if (asset.brand && asset.brand.trim() !== '') {
        correctedName = asset.brand
      } else if (asset.description && asset.description !== 'SEE SUB-CATEGORY') {
        correctedName = asset.description
      }
    }
    
    return {
      ...asset,
      name: correctedName,
      status: correctedStatus as "Available" | "In Use" | "Maintenance" | "Disposed"
    }
  }

  // Asset methods - always get fresh data from imported assets
  getAssets(): Asset[] {
    // Apply data corrections to imported assets
    this.assets = IMPORTED_ASSETS.map(asset => this.correctAssetData(asset))
    
    // Also include additional assets from localStorage, but ensure no duplicates
    if (typeof window !== 'undefined') {
      try {
        const additionalAssets = JSON.parse(localStorage.getItem('asset-dog-additional-assets') || '[]')
        const importedIds = new Set(IMPORTED_ASSETS.map(asset => asset.id))
        const uniqueAdditionalAssets = additionalAssets.filter((asset: Asset) => !importedIds.has(asset.id))
        this.assets = [...this.assets, ...uniqueAdditionalAssets]
      } catch (error) {
        console.warn('Failed to load additional assets:', error)
      }
    }
    
    // Remove duplicate assets based on multiple criteria
    const seenAssets = new Map<string, Asset>()
    const duplicatesRemoved: string[] = []
    
    this.assets = this.assets.filter((asset) => {
      // Create a unique key based on multiple fields to catch true duplicates
      const uniqueKey = `${asset.id}_${asset.name}_${asset.brand}_${asset.model}_${asset.serialNumber}`
      
      if (seenAssets.has(uniqueKey)) {
        duplicatesRemoved.push(`${asset.id} (${asset.name})`)
        return false
      }
      seenAssets.set(uniqueKey, asset)
      return true
    })
    
    if (duplicatesRemoved.length > 0) {
      console.warn(`Removed ${duplicatesRemoved.length} duplicate assets:`, duplicatesRemoved)
    }
    
    return [...this.assets]
  }

  getAsset(id: string): Asset | undefined {
    // Apply same deduplication logic as in getAssets
    const correctedAssets = IMPORTED_ASSETS.map(asset => this.correctAssetData(asset))
    
    // Include additional assets from localStorage
    let allAssets = [...correctedAssets]
    if (typeof window !== 'undefined') {
      try {
        const additionalAssets = JSON.parse(localStorage.getItem('asset-dog-additional-assets') || '[]')
        const importedIds = new Set(IMPORTED_ASSETS.map(asset => asset.id))
        const uniqueAdditionalAssets = additionalAssets.filter((asset: Asset) => !importedIds.has(asset.id))
        allAssets = [...allAssets, ...uniqueAdditionalAssets]
      } catch (error) {
        console.warn('Failed to load additional assets:', error)
      }
    }
    
    // Remove duplicates and find the asset (same logic as getAssets)
    const seenAssets = new Map<string, Asset>()
    const deduplicatedAssets = allAssets.filter((asset) => {
      const uniqueKey = `${asset.id}_${asset.name}_${asset.brand}_${asset.model}_${asset.serialNumber}`
      
      if (seenAssets.has(uniqueKey)) {
        return false
      }
      seenAssets.set(uniqueKey, asset)
      return true
    })
    
    return deduplicatedAssets.find(asset => asset.id === id)
  }

  addAsset(asset: Omit<Asset, 'id'>): Asset {
    // For now, we'll just return the asset with a generated ID
    // In a real application, this would make an API call to add to the centralized system
    const newAsset: Asset = {
      ...asset,
      id: this.generateId()
    }
    
    // Store in localStorage for persistence until next page load
    if (typeof window !== 'undefined') {
      try {
        const additionalAssets = JSON.parse(localStorage.getItem('asset-dog-additional-assets') || '[]')
        additionalAssets.push(newAsset)
        localStorage.setItem('asset-dog-additional-assets', JSON.stringify(additionalAssets))
      } catch (error) {
        console.warn('Failed to save additional asset:', error)
      }
    }
    
    return newAsset
  }

  updateAsset(id: string, updates: Partial<Asset>): Asset | null {
    // Check centralized assets first
    this.assets = this.convertCentralizedAssets()
    const centralizedAsset = this.assets.find(asset => asset.id === id)
    
    if (centralizedAsset) {
      // For centralized assets, we can't directly modify them
      // In a real application, this would make an API call
      console.warn('Cannot modify centralized asset directly. This would require an API call.')
      return null
    }
    
    // Check additional assets in localStorage
    if (typeof window !== 'undefined') {
      try {
        const additionalAssets = JSON.parse(localStorage.getItem('asset-dog-additional-assets') || '[]')
        const index = additionalAssets.findIndex((asset: Asset) => asset.id === id)
        
        if (index !== -1) {
          additionalAssets[index] = { ...additionalAssets[index], ...updates }
          localStorage.setItem('asset-dog-additional-assets', JSON.stringify(additionalAssets))
          return additionalAssets[index]
        }
      } catch (error) {
        console.warn('Failed to update additional asset:', error)
      }
    }
    
    return null
  }

  deleteAsset(id: string): boolean {
    // Check centralized assets first
    this.assets = this.convertCentralizedAssets()
    const centralizedAsset = this.assets.find(asset => asset.id === id)
    
    if (centralizedAsset) {
      // For centralized assets, we can't directly delete them
      // In a real application, this would make an API call
      console.warn('Cannot delete centralized asset directly. This would require an API call.')
      return false
    }
    
    // Check additional assets in localStorage
    if (typeof window !== 'undefined') {
      try {
        const additionalAssets = JSON.parse(localStorage.getItem('asset-dog-additional-assets') || '[]')
        const index = additionalAssets.findIndex((asset: Asset) => asset.id === id)
        
        if (index !== -1) {
          additionalAssets.splice(index, 1)
          localStorage.setItem('asset-dog-additional-assets', JSON.stringify(additionalAssets))
          return true
        }
      } catch (error) {
        console.warn('Failed to delete additional asset:', error)
      }
    }
    
    return false
  }

  // Maintenance methods
  getMaintenances(): Maintenance[] {
    return [...this.maintenances]
  }

  getMaintenance(id: string): Maintenance | undefined {
    return this.maintenances.find(maintenance => maintenance.id === id)
  }

  addMaintenance(maintenance: Omit<Maintenance, 'id'>): Maintenance {
    const newMaintenance: Maintenance = {
      ...maintenance,
      id: this.generateId()
    }
    this.maintenances.push(newMaintenance)
    this.saveData()
    return newMaintenance
  }

  updateMaintenance(id: string, updates: Partial<Maintenance>): Maintenance | null {
    const index = this.maintenances.findIndex(maintenance => maintenance.id === id)
    if (index === -1) return null
    
    this.maintenances[index] = { ...this.maintenances[index], ...updates }
    this.saveData()
    return this.maintenances[index]
  }

  deleteMaintenance(id: string): boolean {
    const index = this.maintenances.findIndex(maintenance => maintenance.id === id)
    if (index === -1) return false

    this.maintenances.splice(index, 1)
    this.saveData()
    return true
  }

  // Warranty methods
  getWarranties(): Warranty[] {
    return [...this.warranties]
  }

  getWarranty(id: string): Warranty | undefined {
    return this.warranties.find(warranty => warranty.id === id)
  }

  addWarranty(warranty: Omit<Warranty, 'id'>): Warranty {
    const newWarranty: Warranty = {
      ...warranty,
      id: this.generateId()
    }
    this.warranties.push(newWarranty)
    this.saveData()
    return newWarranty
  }

  updateWarranty(id: string, updates: Partial<Warranty>): Warranty | null {
    const index = this.warranties.findIndex(warranty => warranty.id === id)
    if (index === -1) return null
    
    this.warranties[index] = { ...this.warranties[index], ...updates }
    this.saveData()
    return this.warranties[index]
  }

  deleteWarranty(id: string): boolean {
    const index = this.warranties.findIndex(warranty => warranty.id === id)
    if (index === -1) return false

    this.warranties.splice(index, 1)
    this.saveData()
    return true
  }

  // Utility methods
  private generateId(): string {
    // For Lists feature, always use AST prefix for all records
    const existingIds = [
      ...this.assets.map(a => a.id),
      ...this.maintenances.map(m => m.id),
      ...this.warranties.map(w => w.id)
    ]
    
    let counter = Math.max(
      ...existingIds.map(id => {
        const match = id.match(/AST-(\d+)/)
        return match ? parseInt(match[1]) : 0
      }),
      15 // Start from AST-016 since we have assets up to AST-015
    ) + 1
    
    let newId: string
    
    do {
      newId = `AST-${counter.toString().padStart(3, '0')}`
      counter++
    } while (existingIds.includes(newId))
    
    return newId
  }

  private getDefaultMaintenances(): Maintenance[] {
    return [
      {
        id: "AST-016",
        assetId: "AST-001",
        assetName: "MacBook Pro 16\"",
        type: "Preventive",
        status: "Completed",
        scheduledDate: "2024-01-15",
        completedDate: "2024-01-15",
        technician: "Tech Solutions Inc.",
        cost: 150,
        description: "Regular maintenance and cleaning",
        nextDue: "2024-04-15",
        priority: "Medium"
      },
      {
        id: "AST-017",
        assetId: "AST-005",
        assetName: "Projector",
        type: "Repair",
        status: "In Progress",
        scheduledDate: "2024-01-20",
        completedDate: null,
        technician: "AV Repair Co.",
        cost: 0,
        description: "Bulb replacement and calibration",
        nextDue: null,
        priority: "High"
      },
      {
        id: "AST-018",
        assetId: "AST-004",
        assetName: "Toyota Camry",
        type: "Preventive",
        status: "Scheduled",
        scheduledDate: "2024-02-01",
        completedDate: null,
        technician: "AutoCare Center",
        cost: 0,
        description: "Oil change and tire rotation",
        nextDue: "2024-05-01",
        priority: "Medium"
      },
      {
        id: "AST-019",
        assetId: "AST-002",
        assetName: "Dell Monitor 27\"",
        type: "Repair",
        status: "Completed",
        scheduledDate: "2024-01-10",
        completedDate: "2024-01-10",
        technician: "Monitor Repair Services",
        cost: 75,
        description: "Screen calibration and cable replacement",
        nextDue: null,
        priority: "Low"
      },
      {
        id: "AST-020",
        assetId: "AST-007",
        assetName: "Laptop Dell XPS",
        type: "Preventive",
        status: "Overdue",
        scheduledDate: "2024-01-05",
        completedDate: null,
        technician: "IT Support Team",
        cost: 0,
        description: "System update and hardware check",
        nextDue: "2024-04-05",
        priority: "High"
      },
    ]
  }

  private getDefaultWarranties(): Warranty[] {
    return [
      {
        id: "AST-021",
        assetId: "AST-001",
        assetName: "MacBook Pro 16\"",
        vendor: "Apple Inc.",
        type: "Manufacturer",
        startDate: "2022-01-15",
        endDate: "2025-01-15",
        status: "Active",
        coverage: "Hardware defects and manufacturing issues",
        contactInfo: "support@apple.com",
        referenceNumber: "APP-2022-001234",
        notes: "Includes AppleCare+ coverage",
        cost: 299
      },
      {
        id: "AST-022",
        assetId: "AST-002",
        assetName: "Dell Monitor 27\"",
        vendor: "Dell Technologies",
        type: "Manufacturer",
        startDate: "2022-03-20",
        endDate: "2024-03-20",
        status: "Expired",
        coverage: "Hardware defects and dead pixels",
        contactInfo: "warranty@dell.com",
        referenceNumber: "DELL-2022-567890",
        notes: "Standard 2-year warranty",
        cost: 0
      },
      {
        id: "AST-023",
        assetId: "AST-004",
        assetName: "Toyota Camry",
        vendor: "Toyota Motor Corporation",
        type: "Manufacturer",
        startDate: "2020-05-15",
        endDate: "2025-05-15",
        status: "Active",
        coverage: "Powertrain and basic warranty",
        contactInfo: "warranty@toyota.com",
        referenceNumber: "TOY-2020-789012",
        notes: "5-year powertrain warranty",
        cost: 0
      },
      {
        id: "AST-024",
        assetId: "AST-005",
        assetName: "Projector",
        vendor: "Epson America",
        type: "Extended",
        startDate: "2021-08-30",
        endDate: "2024-08-30",
        status: "Active",
        coverage: "Extended warranty for lamp and electronics",
        contactInfo: "support@epson.com",
        referenceNumber: "EPS-2021-345678",
        notes: "Extended warranty purchased separately",
        cost: 199
      },
      {
        id: "AST-025",
        assetId: "AST-007",
        assetName: "Laptop Dell XPS",
        vendor: "Dell Technologies",
        type: "Manufacturer",
        startDate: "2023-02-14",
        endDate: "2026-02-14",
        status: "Active",
        coverage: "Hardware defects and accidental damage",
        contactInfo: "premium@dell.com",
        referenceNumber: "DELL-2023-901234",
        notes: "Premium support with accidental damage protection",
        cost: 0
      },
    ]
  }

  // Export functionality
  exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (typeof window === 'undefined') {
      console.warn('CSV export is only available in the browser')
      return
    }

    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}