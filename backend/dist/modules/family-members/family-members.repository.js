"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyMembersRepository = void 0;
const prisma_1 = require("../../config/prisma");
class FamilyMembersRepository {
    async findAll(opts) {
        const { search, isLiving, page, limit } = opts;
        const skip = (page - 1) * limit;
        const where = {};
        if (isLiving !== undefined)
            where.isLiving = isLiving;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [members, total] = await Promise.all([
            prisma_1.prisma.familyMember.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    gender: true,
                    photoUrl: true,
                    isLiving: true,
                },
            }),
            prisma_1.prisma.familyMember.count({ where }),
        ]);
        return { members, total };
    }
    async findById(id) {
        return prisma_1.prisma.familyMember.findUnique({
            where: { id },
            include: {
                relationshipsFrom: {
                    include: { toMember: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
                },
                relationshipsTo: {
                    include: { fromMember: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
                },
                eventMembers: { include: { event: true } },
            },
        });
    }
    async create(data) {
        return prisma_1.prisma.familyMember.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.familyMember.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma_1.prisma.familyMember.delete({ where: { id } });
    }
    async updatePhoto(id, photoUrl) {
        return prisma_1.prisma.familyMember.update({ where: { id }, data: { photoUrl } });
    }
    async getRelationships(memberId) {
        return prisma_1.prisma.relationship.findMany({
            where: { OR: [{ fromMemberId: memberId }, { toMemberId: memberId }] },
            include: {
                fromMember: { select: { id: true, firstName: true, lastName: true } },
                toMember: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
}
exports.FamilyMembersRepository = FamilyMembersRepository;
//# sourceMappingURL=family-members.repository.js.map