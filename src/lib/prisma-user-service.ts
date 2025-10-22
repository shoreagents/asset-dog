import { prisma } from '@/lib/prisma'
import { UserType, type User } from '@prisma/client'

export interface CreateUserData {
  id: string
  user_type: UserType
}

export interface UpdateUserData {
  id: string
  user_type?: UserType
}

export class PrismaUserService {
  // Create a new user
  async createUser(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data
    })
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { created_at: 'desc' }
    })
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    })
  }

  // Update user
  async updateUser(data: UpdateUserData): Promise<User> {
    const { id, ...updateData } = data
    return await prisma.user.update({
      where: { id },
      data: updateData
    })
  }

  // Delete user
  async deleteUser(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id }
    })
  }

  // Get user statistics
  async getUserStats(): Promise<{
    total: number
    admins: number
    users: number
  }> {
    const [total, admins, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { user_type: 'admin' } }),
      prisma.user.count({ where: { user_type: 'user' } })
    ])

    return {
      total,
      admins,
      users
    }
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true }
    })
    
    return user?.user_type === 'admin'
  }
}

// Export a singleton instance
export const prismaUserService = new PrismaUserService()

