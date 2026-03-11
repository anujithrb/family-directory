import { Role, RelationshipType } from '@prisma/client';
import { FamilyMembersRepository, CreateMemberDto } from './family-members.repository';
import { AppError } from '../../middleware/error.middleware';
import { prisma } from '../../config/prisma';

export class FamilyMembersService {
  private readonly repo: FamilyMembersRepository;

  constructor() {
    this.repo = new FamilyMembersRepository();
  }

  async getMembers(opts: { search?: string; isLiving?: boolean; page: number; limit: number }) {
    return this.repo.findAll(opts);
  }

  async getMember(id: string) {
    const member = await this.repo.findById(id);
    if (!member) throw new AppError(404, 'MEMBER_NOT_FOUND', 'Family member not found');
    return member;
  }

  /**
   * Create a family member with permission check for non-admins
   */
  async createMember(
    data: CreateMemberDto,
    requestingUser: { id: string; role: Role; familyMemberId: string },
  ) {
    if (requestingUser.role !== Role.ADMIN) {
      const perm = await prisma.userPermission.findUnique({
        where: { userId_permissionKey: { userId: requestingUser.id, permissionKey: 'CAN_ADD_RELATIVES' } },
      });
      if (!perm) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to add family members');
      }
    }
    return this.repo.create(data);
  }

  /**
   * Update a family member with permission check
   */
  async updateMember(
    id: string,
    data: Partial<CreateMemberDto>,
    requestingUser: { id: string; role: Role; familyMemberId: string },
  ) {
    await this.getMember(id);

    if (requestingUser.role !== Role.ADMIN) {
      await this.checkRelationPermission(id, requestingUser);
    }

    return this.repo.update(id, data);
  }

  /**
   * Delete a family member (admin only)
   */
  async deleteMember(id: string) {
    await this.getMember(id);
    return this.repo.delete(id);
  }

  /**
   * Update profile photo
   */
  async updatePhoto(id: string, photoUrl: string, requestingUser: { id: string; role: Role; familyMemberId: string }) {
    await this.getMember(id);
    if (requestingUser.role !== Role.ADMIN) {
      await this.checkRelationPermission(id, requestingUser);
    }
    return this.repo.updatePhoto(id, photoUrl);
  }

  private async checkRelationPermission(
    targetMemberId: string,
    user: { id: string; familyMemberId: string },
  ) {
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { fromMemberId: user.familyMemberId, toMemberId: targetMemberId },
          { fromMemberId: targetMemberId, toMemberId: user.familyMemberId },
        ],
        type: { in: [RelationshipType.PARENT_OF, RelationshipType.SPOUSE_OF] },
      },
    });

    if (relationships.length === 0) {
      throw new AppError(403, 'FORBIDDEN', 'You can only edit direct relatives (parent, child, spouse)');
    }
  }
}
