import { prisma } from '@/lib/prisma'
import { AssetStatus, type Asset, type MaintenanceRecord } from '@prisma/client'

export interface CreateAssetData {
  asset_tag_id: string
  name?: string
  description?: string
  serial_number?: string
  brand?: string
  model?: string
  cost?: number
  purchase_date?: Date
  date_acquired?: Date
  category?: string
  sub_category?: string
  location?: string
  site?: string
  department?: string
  status?: AssetStatus
  assigned_to?: string
  asset_type?: string
  notes?: string
  image_url?: string
  image_file_name?: string
}

export interface UpdateAssetData extends Partial<CreateAssetData> {
  id: string
}

export class PrismaAssetService {
  // Create a new asset
  async createAsset(data: CreateAssetData): Promise<Asset> {
    return await prisma.asset.create({
      data: {
        ...data,
        cost: data.cost ? Number(data.cost) : undefined,
      }
    })
  }

  // Get all assets with optional filtering
  async getAssets(options?: {
    search?: string
    status?: AssetStatus
    category?: string
    department?: string
    limit?: number
    offset?: number
  }): Promise<Asset[]> {
    const where: any = {}

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { asset_tag_id: { contains: options.search, mode: 'insensitive' } }
      ]
    }

    if (options?.status) {
      where.status = options.status
    }

    if (options?.category) {
      where.category = options.category
    }

    if (options?.department) {
      where.department = options.department
    }

    return await prisma.asset.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    })
  }

  // Get asset by ID
  async getAssetById(id: string): Promise<Asset | null> {
    return await prisma.asset.findUnique({
      where: { id }
    })
  }

  // Get asset by asset_tag_id
  async getAssetByTagId(assetTagId: string): Promise<Asset | null> {
    return await prisma.asset.findUnique({
      where: { asset_tag_id: assetTagId }
    })
  }

  // Update asset
  async updateAsset(data: UpdateAssetData): Promise<Asset> {
    const { id, ...updateData } = data
    return await prisma.asset.update({
      where: { id },
      data: {
        ...updateData,
        cost: updateData.cost ? Number(updateData.cost) : undefined,
      }
    })
  }

  // Delete asset
  async deleteAsset(id: string): Promise<Asset> {
    return await prisma.asset.delete({
      where: { id }
    })
  }

  // Get assets with maintenance records
  async getAssetsWithMaintenance(): Promise<(Asset & { maintenance_records: MaintenanceRecord[] })[]> {
    return await prisma.asset.findMany({
      include: {
        maintenance_records: true
      },
      orderBy: { created_at: 'desc' }
    })
  }

  // Get asset statistics
  async getAssetStats(): Promise<{
    total: number
    byStatus: Record<string, number>
    byCategory: Record<string, number>
  }> {
    const [total, statusCounts, categoryCounts] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.asset.groupBy({
        by: ['category'],
        _count: { category: true }
      })
    ])

    const byStatus = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const byCategory = categoryCounts.reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = item._count.category
      }
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      byStatus,
      byCategory
    }
  }
}

// Export a singleton instance
export const prismaAssetService = new PrismaAssetService()

