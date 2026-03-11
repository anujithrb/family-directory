"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const prisma_1 = require("../../config/prisma");
class UsersRepository {
    async findAll(page, limit) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
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
            prisma_1.prisma.user.count(),
        ]);
        return { users, total };
    }
    async findById(id) {
        return prisma_1.prisma.user.findUnique({
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
    async updateRole(id, role) {
        return prisma_1.prisma.user.update({ where: { id }, data: { role } });
    }
    async setActive(id, isActive) {
        return prisma_1.prisma.user.update({ where: { id }, data: { isActive } });
    }
    async grantPermission(userId, permissionKey, grantedBy) {
        return prisma_1.prisma.userPermission.upsert({
            where: { userId_permissionKey: { userId, permissionKey } },
            update: { grantedBy, grantedAt: new Date() },
            create: { userId, permissionKey, grantedBy },
        });
    }
    async revokePermission(userId, permissionKey) {
        return prisma_1.prisma.userPermission.deleteMany({
            where: { userId, permissionKey },
        });
    }
    async getUserPermissions(userId) {
        return prisma_1.prisma.userPermission.findMany({
            where: { userId },
            include: { grantedByUser: { select: { email: true } } },
        });
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=users.repository.js.map