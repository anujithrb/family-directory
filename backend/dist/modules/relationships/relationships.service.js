"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipsService = void 0;
const client_1 = require("@prisma/client");
const relationships_repository_1 = require("./relationships.repository");
const error_middleware_1 = require("../../middleware/error.middleware");
const prisma_1 = require("../../config/prisma");
const redis_1 = require("../../config/redis");
class RelationshipsService {
    repo;
    constructor() {
        this.repo = new relationships_repository_1.RelationshipsRepository();
    }
    async getRelationships(memberId) {
        return this.repo.findByMember(memberId);
    }
    /**
     * Add a relationship. Spouse relationships are always bidirectional.
     */
    async addRelationship(data) {
        const [from, to] = await Promise.all([
            prisma_1.prisma.familyMember.findUnique({ where: { id: data.fromMemberId } }),
            prisma_1.prisma.familyMember.findUnique({ where: { id: data.toMemberId } }),
        ]);
        if (!from)
            throw new error_middleware_1.AppError(404, 'MEMBER_NOT_FOUND', `From member ${data.fromMemberId} not found`);
        if (!to)
            throw new error_middleware_1.AppError(404, 'MEMBER_NOT_FOUND', `To member ${data.toMemberId} not found`);
        if (data.type === client_1.RelationshipType.SPOUSE_OF) {
            const [rel1] = await prisma_1.prisma.$transaction([
                prisma_1.prisma.relationship.upsert({
                    where: { fromMemberId_toMemberId_type: { fromMemberId: data.fromMemberId, toMemberId: data.toMemberId, type: data.type } },
                    update: { startDate: data.startDate, endDate: data.endDate },
                    create: { ...data },
                }),
                prisma_1.prisma.relationship.upsert({
                    where: { fromMemberId_toMemberId_type: { fromMemberId: data.toMemberId, toMemberId: data.fromMemberId, type: data.type } },
                    update: { startDate: data.startDate, endDate: data.endDate },
                    create: { fromMemberId: data.toMemberId, toMemberId: data.fromMemberId, type: data.type, startDate: data.startDate, endDate: data.endDate },
                }),
            ]);
            await this.invalidateTreeCache();
            return rel1;
        }
        const rel = await prisma_1.prisma.relationship.upsert({
            where: { fromMemberId_toMemberId_type: { fromMemberId: data.fromMemberId, toMemberId: data.toMemberId, type: data.type } },
            update: { startDate: data.startDate, endDate: data.endDate },
            create: { ...data },
        });
        await this.invalidateTreeCache();
        return rel;
    }
    async removeRelationship(id) {
        const rel = await this.repo.findById(id);
        if (!rel)
            throw new error_middleware_1.AppError(404, 'RELATIONSHIP_NOT_FOUND', 'Relationship not found');
        if (rel.type === client_1.RelationshipType.SPOUSE_OF) {
            await prisma_1.prisma.relationship.deleteMany({
                where: {
                    type: client_1.RelationshipType.SPOUSE_OF,
                    OR: [
                        { fromMemberId: rel.fromMemberId, toMemberId: rel.toMemberId },
                        { fromMemberId: rel.toMemberId, toMemberId: rel.fromMemberId },
                    ],
                },
            });
        }
        else {
            await this.repo.delete(id);
        }
        await this.invalidateTreeCache();
    }
    async invalidateTreeCache() {
        await redis_1.redis.del('family-tree:all');
    }
}
exports.RelationshipsService = RelationshipsService;
//# sourceMappingURL=relationships.service.js.map