"use client"

import { IMPORTED_FIELDS_ANALYSIS, FIELD_MAPPING, IMPORTED_FIELD_NAMES } from './imported-fields-analysis'

export interface AssetField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea'
  label: string
  description?: string
  required: boolean
  included: boolean
  options?: string[] // For select/checkbox types
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  categories?: string[]
}

export interface StandardAssetField extends AssetField {
  isStandard: true
  example?: string
}

export interface CustomAssetField extends AssetField {
  isStandard: false
  dataType: string
}

export type AnyAssetField = StandardAssetField | CustomAssetField

class AssetFieldManager {
  private static instance: AssetFieldManager
  private fields: AnyAssetField[] = []
  private listeners: ((fields: AnyAssetField[]) => void)[] = []

  private constructor() {
    this.loadFields()
  }

  static getInstance(): AssetFieldManager {
    if (!AssetFieldManager.instance) {
      AssetFieldManager.instance = new AssetFieldManager()
    }
    return AssetFieldManager.instance
  }

  // Load fields from localStorage
  private loadFields(): void {
    if (typeof window === 'undefined') return

    try {
      const savedFields = localStorage.getItem('asset-fields-config')
      if (savedFields) {
        this.fields = JSON.parse(savedFields)
        // Ensure proper field categorization
        this.ensureFieldCategorization()
      } else {
        this.initializeDefaultFields()
      }
    } catch (error) {
      console.error('Error loading asset fields:', error)
      this.initializeDefaultFields()
    }
  }

  // Ensure fields are properly categorized
  private ensureFieldCategorization(): void {
    this.fields = this.fields.map(field => {
      // If field doesn't have isStandard property, determine it
      if (field.isStandard === undefined) {
        const isDefaultField = IMPORTED_FIELDS_ANALYSIS.matchedFields.some(
          match => match.default === field.name
        )
        return {
          ...field,
          isStandard: isDefaultField
        }
      }
      return field
    })
    this.saveFields()
  }

  // Save fields to localStorage
  private saveFields(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('asset-fields-config', JSON.stringify(this.fields))
      this.notifyListeners()
    } catch (error) {
      console.error('Error saving asset fields:', error)
    }
  }

  // Initialize default standard fields and imported fields
  private initializeDefaultFields(): void {
    this.fields = []
    
    // Add matched default fields (connected to imported data)
    this.addMatchedDefaultFields()
    
    // Add unmatched imported fields as custom fields
    this.addImportedFieldsAsCustom()
    
    this.saveFields()
  }

  // Add default fields that have matches in imported data
  private addMatchedDefaultFields(): void {
    const matchedFields = IMPORTED_FIELDS_ANALYSIS.matchedFields
    
    matchedFields.forEach(match => {
      const fieldConfig = this.getDefaultFieldConfig(match.default)
      if (fieldConfig) {
        const standardField: StandardAssetField = {
          ...fieldConfig,
          isStandard: true
        }
        this.fields.push(standardField)
      }
    })
  }

  // Add imported fields that don't match defaults as custom fields
  private addImportedFieldsAsCustom(): void {
    const unmatchedImportedFields = IMPORTED_FIELDS_ANALYSIS.unmatchedImportedFields
    
    unmatchedImportedFields.forEach(fieldName => {
      const fieldConfig = this.getImportedFieldConfig(fieldName)
      if (fieldConfig) {
        const customField: CustomAssetField = {
          ...fieldConfig,
          isStandard: false,
          dataType: this.getDataTypeForField(fieldName)
        }
        this.fields.push(customField)
      }
    })
  }

  // Get default field configuration
  private getDefaultFieldConfig(fieldName: string): Omit<StandardAssetField, 'isStandard'> | null {
    const fieldConfigs: Record<string, Omit<StandardAssetField, 'isStandard'>> = {
      'assetTagId': {
        id: 'asset-tag-id',
        name: 'assetTagId',
        type: 'text',
        label: 'Asset Tag ID',
        description: 'Unique asset identifier',
        required: true,
        included: true,
        example: 'PT2021-0994',
        placeholder: 'Enter asset tag ID'
      },
      'description': {
        id: 'asset-description',
        name: 'description',
        type: 'textarea',
        label: 'Asset Description',
        description: 'Description of the asset',
        required: true,
        included: true,
        example: 'SEE SUB-CATEGORY',
        placeholder: 'Enter asset description'
      },
      'purchaseDate': {
        id: 'purchase-date',
        name: 'purchaseDate',
        type: 'date',
        label: 'Purchase Date',
        description: 'Date asset was purchased',
        required: false,
        included: true,
        example: '04/09/2021',
        placeholder: 'Select purchase date'
      },
      'cost': {
        id: 'cost',
        name: 'value',
        type: 'number',
        label: 'Cost',
        description: 'Cost of the asset',
        required: false,
        included: true,
        example: '18000',
        placeholder: 'Enter cost',
        validation: {
          min: 0,
          message: 'Cost must be a positive number'
        }
      },
      'brand': {
        id: 'brand',
        name: 'brand',
        type: 'text',
        label: 'Brand',
        description: 'Manufacturer of the asset',
        required: false,
        included: true,
        example: 'ARUBA',
        placeholder: 'Enter brand name'
      },
      'model': {
        id: 'model',
        name: 'model',
        type: 'text',
        label: 'Model',
        description: 'Model name of the asset',
        required: false,
        included: true,
        example: 'ARUBA 6100 48G 4SFP+ Switch JL676A',
        placeholder: 'Enter model name'
      }
    }
    
    return fieldConfigs[fieldName] || null
  }

  // Get imported field configuration
  private getImportedFieldConfig(fieldName: string): Omit<CustomAssetField, 'isStandard' | 'dataType'> | null {
    const fieldConfigs: Record<string, Omit<CustomAssetField, 'isStandard' | 'dataType'>> = {
      'name': {
        id: 'asset-name',
        name: 'name',
        type: 'text',
        label: 'Asset Name',
        description: 'Name of the asset',
        required: false,
        included: true,
        placeholder: 'Enter asset name'
      },
      'category': {
        id: 'category',
        name: 'category',
        type: 'select',
        label: 'Category',
        description: 'Asset category',
        required: false,
        included: true,
        options: ['COMPUTER - MAIN ITEMS', 'OFFICE FURNITURE', 'NETWORK DEVICE', 'FIRE EQUIPMENT', 'HARDWARE AND OFFICE ESSENTIALS', 'PHOTOGRAPHY AND VIDEOGRAPHY', 'COMMUNICATION AND WATCHES', 'OFFICE ELECTRONICS AND KITCHEN EQUIPMENT', 'COMPUTER ACCESSORIES'],
        placeholder: 'Select category'
      },
      'subCategory': {
        id: 'sub-category',
        name: 'subCategory',
        type: 'text',
        label: 'Sub Category',
        description: 'Asset sub-category',
        required: false,
        included: true,
        placeholder: 'Enter sub-category'
      },
      'location': {
        id: 'location',
        name: 'location',
        type: 'text',
        label: 'Location',
        description: 'Physical location of the asset',
        required: false,
        included: true,
        placeholder: 'Enter location'
      },
      'site': {
        id: 'site',
        name: 'site',
        type: 'text',
        label: 'Site',
        description: 'Site where asset is located',
        required: false,
        included: true,
        placeholder: 'Enter site'
      },
      'status': {
        id: 'status',
        name: 'status',
        type: 'select',
        label: 'Status',
        description: 'Current status of the asset',
        required: false,
        included: true,
        options: ['Available', 'In Use', 'Maintenance', 'Disposed'],
        placeholder: 'Select status'
      },
      'dateAcquired': {
        id: 'date-acquired',
        name: 'dateAcquired',
        type: 'date',
        label: 'Date Acquired',
        description: 'Date when asset was acquired',
        required: false,
        included: true,
        placeholder: 'Select date acquired'
      },
      'assignedTo': {
        id: 'assigned-to',
        name: 'assignedTo',
        type: 'text',
        label: 'Assigned To',
        description: 'Person or department assigned to the asset',
        required: false,
        included: true,
        placeholder: 'Enter assigned person/department'
      },
      'department': {
        id: 'department',
        name: 'department',
        type: 'text',
        label: 'Department',
        description: 'Department responsible for the asset',
        required: false,
        included: true,
        placeholder: 'Enter department'
      },
      'notes': {
        id: 'notes',
        name: 'notes',
        type: 'textarea',
        label: 'Notes',
        description: 'Additional notes about the asset',
        required: false,
        included: true,
        placeholder: 'Enter notes'
      },
      'additionalInformation': {
        id: 'additional-information',
        name: 'additionalInformation',
        type: 'textarea',
        label: 'Additional Information',
        description: 'Additional information about the asset',
        required: false,
        included: true,
        placeholder: 'Enter additional information'
      },
      'auditedApril2021': {
        id: 'audited-april-2021',
        name: 'auditedApril2021',
        type: 'text',
        label: 'Audited April 2021',
        description: 'Audit status for April 2021',
        required: false,
        included: true,
        placeholder: 'Enter audit status'
      },
      'assetType': {
        id: 'asset-type',
        name: 'assetType',
        type: 'select',
        label: 'Asset Type',
        description: 'Type of asset',
        required: false,
        included: true,
        options: ['IT ASSETS', 'NON-IT ASSETS'],
        placeholder: 'Select asset type'
      },
      'depreciableAsset': {
        id: 'depreciable-asset',
        name: 'depreciableAsset',
        type: 'select',
        label: 'Depreciable Asset',
        description: 'Whether the asset is depreciable',
        required: false,
        included: true,
        options: ['Yes', 'No'],
        placeholder: 'Select if depreciable'
      },
      'salvageValue': {
        id: 'salvage-value',
        name: 'salvageValue',
        type: 'number',
        label: 'Salvage Value',
        description: 'Salvage value of the asset',
        required: false,
        included: true,
        placeholder: 'Enter salvage value'
      },
      'depreciationMethod': {
        id: 'depreciation-method',
        name: 'depreciationMethod',
        type: 'select',
        label: 'Depreciation Method',
        description: 'Method used for depreciation',
        required: false,
        included: true,
        options: ['Straight Line', 'Declining Balance', 'Sum of Years'],
        placeholder: 'Select depreciation method'
      }
    }
    
    return fieldConfigs[fieldName] || null
  }

  // Get data type for imported field
  private getDataTypeForField(fieldName: string): string {
    const dataTypeMap: Record<string, string> = {
      'name': 'Text',
      'category': 'Dropdown list',
      'subCategory': 'Text',
      'location': 'Text',
      'site': 'Text',
      'status': 'Dropdown list',
      'dateAcquired': 'Date',
      'assignedTo': 'Text',
      'department': 'Text',
      'notes': 'Text',
      'additionalInformation': 'Text',
      'auditedApril2021': 'Text',
      'assetType': 'Dropdown list',
      'depreciableAsset': 'Dropdown list',
      'salvageValue': 'Numeric',
      'depreciationMethod': 'Dropdown list'
    }
    
    return dataTypeMap[fieldName] || 'Text'
  }

  // Get all fields
  getFields(): AnyAssetField[] {
    return [...this.fields]
  }

  // Get only included fields (for form generation)
  getIncludedFields(): AnyAssetField[] {
    return this.fields.filter(field => field.included)
  }

  // Get required fields
  getRequiredFields(): AnyAssetField[] {
    return this.fields.filter(field => field.included && field.required)
  }

  // Update field configuration
  updateField(fieldId: string, updates: Partial<AnyAssetField>): void {
    const fieldIndex = this.fields.findIndex(field => field.id === fieldId)
    if (fieldIndex !== -1) {
      this.fields[fieldIndex] = { ...this.fields[fieldIndex], ...updates }
      this.saveFields()
    }
  }

  // Add custom field
  addCustomField(field: Omit<CustomAssetField, 'id'>): void {
    const newField: CustomAssetField = {
      ...field,
      id: `custom-${Date.now()}`,
      isStandard: false
    }
    this.fields.push(newField)
    this.saveFields()
  }

  // Remove custom field
  removeCustomField(fieldId: string): void {
    this.fields = this.fields.filter(field => field.id !== fieldId)
    this.saveFields()
  }

  // Toggle field inclusion
  toggleFieldInclusion(fieldId: string): void {
    const field = this.fields.find(field => field.id === fieldId)
    if (field) {
      field.included = !field.included
      this.saveFields()
    }
  }

  // Toggle field requirement
  toggleFieldRequirement(fieldId: string): void {
    const field = this.fields.find(field => field.id === fieldId)
    if (field) {
      field.required = !field.required
      this.saveFields()
    }
  }

  // Subscribe to field changes
  subscribe(listener: (fields: AnyAssetField[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.fields]))
  }

  // Reset to default configuration
  resetToDefault(): void {
    // Clear existing fields and localStorage
    this.fields = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('asset-fields-config')
    }
    this.initializeDefaultFields()
  }

  // Reset to include imported data
  resetToIncludeImportedData(): void {
    // Clear existing fields and localStorage
    this.fields = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('asset-fields-config')
    }
    this.initializeDefaultFields()
  }

  // Export configuration
  exportConfiguration(): string {
    return JSON.stringify(this.fields, null, 2)
  }

  // Import configuration
  importConfiguration(config: string): boolean {
    try {
      const importedFields = JSON.parse(config)
      if (Array.isArray(importedFields)) {
        this.fields = importedFields
        this.saveFields()
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing configuration:', error)
      return false
    }
  }
}

export default AssetFieldManager
