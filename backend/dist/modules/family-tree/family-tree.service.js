"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyTreeService = void 0;
const prisma_1 = require("../../config/prisma");
const redis_1 = require("../../config/redis");
const CACHE_KEY = 'family-tree:all';
const CACHE_TTL = 3600; // 1 hour
class FamilyTreeService {
    /**
     * Get the full family tree, cached in Redis
     */
    async getFamilyTree() {
        const cached = await redis_1.redis.get(CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
        const [members, relationships] = await Promise.all([
            prisma_1.prisma.familyMember.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    photoUrl: true,
                    gender: true,
                    isLiving: true,
                    dateOfBirth: true,
                    dateOfDeath: true,
                },
                orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            }),
            prisma_1.prisma.relationship.findMany({
                select: {
                    id: true,
                    fromMemberId: true,
                    toMemberId: true,
                    type: true,
                },
            }),
        ]);
        const tree = {
            nodes: members,
            edges: relationships,
        };
        await redis_1.redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(tree));
        return tree;
    }
    /**
     * Invalidate the cached family tree
     */
    async invalidateCache() {
        await redis_1.redis.del(CACHE_KEY);
    }
}
exports.FamilyTreeService = FamilyTreeService;
//# sourceMappingURL=family-tree.service.js.map