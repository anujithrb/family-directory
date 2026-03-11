"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyMembersService = void 0;
const client_1 = require("@prisma/client");
const family_members_repository_1 = require("./family-members.repository");
const error_middleware_1 = require("../../middleware/error.middleware");
const prisma_1 = require("../../config/prisma");
class FamilyMembersService {
    repo;
    constructor() {
        this.repo = new family_members_repository_1.FamilyMembersRepository();
    }
    async getMembers(opts) {
        return this.repo.findAll(opts);
    }
    async getMember(id) {
        const member = await this.repo.findById(id);
        if (!member)
            throw new error_middleware_1.AppError(404, 'MEMBER_NOT_FOUND', 'Family member not found');
        return member;
    }
    /**
     * Create a family member with permission check for non-admins
     */
    async createMember(data, requestingUser) {
        if (requestingUser.role !== client_1.Role.ADMIN) {
            const perm = await prisma_1.prisma.userPermission.findUnique({
                where: { userId_permissionKey: { userId: requestingUser.id, permissionKey: 'CAN_ADD_RELATIVES' } },
            });
            if (!perm) {
                throw new error_middleware_1.AppError(403, 'FORBIDDEN', 'You do not have permission to add family members');
            }
        }
        return this.repo.create(data);
    }
    /**
     * Update a family member with permission check
     */
    async updateMember(id, data, requestingUser) {
        await this.getMember(id);
        if (requestingUser.role !== client_1.Role.ADMIN) {
            await this.checkRelationPermission(id, requestingUser);
        }
        return this.repo.update(id, data);
    }
    /**
     * Delete a family member (admin only)
     */
    async deleteMember(id) {
        await this.getMember(id);
        return this.repo.delete(id);
    }
    /**
     * Update profile photo
     */
    async updatePhoto(id, photoUrl, requestingUser) {
        await this.getMember(id);
        if (requestingUser.role !== client_1.Role.ADMIN) {
            await this.checkRelationPermission(id, requestingUser);
        }
        return this.repo.updatePhoto(id, photoUrl);
    }
    async checkRelationPermission(targetMemberId, user) {
        const relationships = await prisma_1.prisma.relationship.findMany({
            where: {
                OR: [
                    { fromMemberId: user.familyMemberId, toMemberId: targetMemberId },
                    { fromMemberId: targetMemberId, toMemberId: user.familyMemberId },
                ],
                type: { in: [client_1.RelationshipType.PARENT_OF, client_1.RelationshipType.SPOUSE_OF] },
            },
        });
        if (relationships.length === 0) {
            throw new error_middleware_1.AppError(403, 'FORBIDDEN', 'You can only edit direct relatives (parent, child, spouse)');
        }
    }
}
exports.FamilyMembersService = FamilyMembersService;
//# sourceMappingURL=family-members.service.js.map