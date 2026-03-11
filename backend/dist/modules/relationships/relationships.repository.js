"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipsRepository = void 0;
const prisma_1 = require("../../config/prisma");
class RelationshipsRepository {
    async findByMember(memberId) {
        return prisma_1.prisma.relationship.findMany({
            where: { OR: [{ fromMemberId: memberId }, { toMemberId: memberId }] },
            include: {
                fromMember: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
                toMember: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.relationship.findUnique({
            where: { id },
            include: {
                fromMember: { select: { id: true, firstName: true, lastName: true } },
                toMember: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async create(data) {
        return prisma_1.prisma.relationship.create({
            data,
            include: {
                fromMember: { select: { id: true, firstName: true, lastName: true } },
                toMember: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async delete(id) {
        return prisma_1.prisma.relationship.delete({ where: { id } });
    }
}
exports.RelationshipsRepository = RelationshipsRepository;
//# sourceMappingURL=relationships.repository.js.map