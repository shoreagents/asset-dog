import { prisma } from '@/lib/prisma'
import { MaintenanceStatus, type MaintenanceRecord, type Asset } from '@prisma/client'

export interface CreateMaintenanceData {
  asset_id: string
  maintenance_title: string
  maintenance_details?: string
  maintenance_due_date: Date
  maintenance_by: string
  status?: MaintenanceStatus
  maintenance_cost?: number
  is_repeating?: boolean
}

export interface UpdateMaintenanceData extends Partial<CreateMaintenanceData> {
  id: string
}

export class PrismaMaintenanceService {
  // Create a new maintenance record
  async createMaintenance(data: CreateMaintenanceData): Promise<MaintenanceRecord> {
    return await prisma.maintenanceRecord.create({
      data: {
        ...data,
        maintenance_cost: data.maintenance_cost ? Number(data.maintenance_cost) : undefined,
      }
    })
  }

  // Get all maintenance records
  async getMaintenanceRecords(options?: {
    assetId?: string
    status?: MaintenanceStatus
    limit?: number
    offset?: number
  }): Promise<MaintenanceRecord[]> {
    const where: any = {}

    if (options?.assetId) {
      where.asset_id = options.assetId
    }

    if (options?.status) {
      where.status = options.status
    }

    return await prisma.maintenanceRecord.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    })
  }

  // Get maintenance record by ID
  async getMaintenanceById(id: string): Promise<MaintenanceRecord | null> {
    return await prisma.maintenanceRecord.findUnique({
      where: { id }
    })
  }

  // Update maintenance record
  async updateMaintenance(data: UpdateMaintenanceData): Promise<MaintenanceRecord> {
    const { id, ...updateData } = data
    return await prisma.maintenanceRecord.update({
      where: { id },
      data: {
        ...updateData,
        maintenance_cost: updateData.maintenance_cost ? Number(updateData.maintenance_cost) : undefined,
      }
    })
  }

  // Delete maintenance record
  async deleteMaintenance(id: string): Promise<MaintenanceRecord> {
    return await prisma.maintenanceRecord.delete({
      where: { id }
    })
  }

  // Get maintenance records with asset information
  async getMaintenanceWithAssets(): Promise<(MaintenanceRecord & { asset: Asset })[]> {
    return await prisma.maintenanceRecord.findMany({
      include: {
        asset: true
      },
      orderBy: { created_at: 'desc' }
    })
  }

  // Get overdue maintenance records
  async getOverdueMaintenance(): Promise<MaintenanceRecord[]> {
    const today = new Date()
    return await prisma.maintenanceRecord.findMany({
      where: {
        maintenance_due_date: {
          lt: today
        },
        status: {
          in: ['scheduled', 'in_progress']
        }
      },
      include: {
        asset: true
      },
      orderBy: { maintenance_due_date: 'asc' }
    })
  }

  // Get maintenance statistics
  async getMaintenanceStats(): Promise<{
    total: number
    byStatus: Record<string, number>
    overdue: number
    upcoming: number
  }> {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [total, statusCounts, overdue, upcoming] = await Promise.all([
      prisma.maintenanceRecord.count(),
      prisma.maintenanceRecord.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.maintenanceRecord.count({
        where: {
          maintenance_due_date: { lt: today },
          status: { in: ['scheduled', 'in_progress'] }
        }
      }),
      prisma.maintenanceRecord.count({
        where: {
          maintenance_due_date: { 
            gte: today,
            lte: nextWeek 
          },
          status: { in: ['scheduled', 'in_progress'] }
        }
      })
    ])

    const byStatus = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      byStatus,
      overdue,
      upcoming
    }
  }
}

// Export a singleton instance
export const prismaMaintenanceService = new PrismaMaintenanceService()

