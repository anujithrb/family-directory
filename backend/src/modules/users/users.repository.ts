import { prisma } from '../../config/prisma';
import { Role, PermissionKey } from '@prisma/client';

export class UsersRepository {
  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          familyMemberId: true,
          isActive: true,
          createdAt: true,
          familyMember: { select: { firstName: true, lastName: true } },
          permissions: { select: { permissionKey: true, grantedAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { users, total };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        familyMemberId: true,
        isActive: true,
        createdAt: true,
        familyMember: { select: { firstName: true, lastName: true, photoUrl: true } },
        permissions: { select: { id: true, permissionKey: true, grantedAt: true } },
      },
    });
  }

  async updateRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  }

  async setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  }

  async grantPermission(userId: string, permissionKey: PermissionKey, grantedBy: string) {
    return prisma.userPermission.upsert({
      where: { userId_permissionKey: { userId, permissionKey } },
      update: { grantedBy, grantedAt: new Date() },
      create: { userId, permissionKey, grantedBy },
    });
  }

  async revokePermission(userId: string, permissionKey: PermissionKey) {
    return prisma.userPermission.deleteMany({
      where: { userId, permissionKey },
    });
  }

  async getUserPermissions(userId: string) {
    return prisma.userPermission.findMany({
      where: { userId },
      include: { grantedByUser: { select: { email: true } } },
    });
  }
}
