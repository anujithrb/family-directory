import { RelationshipType } from '@prisma/client';
import { RelationshipsRepository } from './relationships.repository';
import { AppError } from '../../middleware/error.middleware';
import { prisma } from '../../config/prisma';
import { redis } from '../../config/redis';

export class RelationshipsService {
  private readonly repo: RelationshipsRepository;

  constructor() {
    this.repo = new RelationshipsRepository();
  }

  async getRelationships(memberId: string) {
    return this.repo.findByMember(memberId);
  }

  /**
   * Add a relationship. Spouse relationships are always bidirectional.
   */
  async addRelationship(data: {
    fromMemberId: string;
    toMemberId: string;
    type: RelationshipType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const [from, to] = await Promise.all([
      prisma.familyMember.findUnique({ where: { id: data.fromMemberId } }),
      prisma.familyMember.findUnique({ where: { id: data.toMemberId } }),
    ]);

    if (!from) throw new AppError(404, 'MEMBER_NOT_FOUND', `From member ${data.fromMemberId} not found`);
    if (!to) throw new AppError(404, 'MEMBER_NOT_FOUND', `To member ${data.toMemberId} not found`);

    if (data.type === RelationshipType.SPOUSE_OF) {
      const [rel1] = await prisma.$transaction([
        prisma.relationship.upsert({
          where: { fromMemberId_toMemberId_type: { fromMemberId: data.fromMemberId, toMemberId: data.toMemberId, type: data.type } },
          update: { startDate: data.startDate, endDate: data.endDate },
          create: { ...data },
        }),
        prisma.relationship.upsert({
          where: { fromMemberId_toMemberId_type: { fromMemberId: data.toMemberId, toMemberId: data.fromMemberId, type: data.type } },
          update: { startDate: data.startDate, endDate: data.endDate },
          create: { fromMemberId: data.toMemberId, toMemberId: data.fromMemberId, type: data.type, startDate: data.startDate, endDate: data.endDate },
        }),
      ]);
      await this.invalidateTreeCache();
      return rel1;
    }

    const rel = await prisma.relationship.upsert({
      where: { fromMemberId_toMemberId_type: { fromMemberId: data.fromMemberId, toMemberId: data.toMemberId, type: data.type } },
      update: { startDate: data.startDate, endDate: data.endDate },
      create: { ...data },
    });

    await this.invalidateTreeCache();
    return rel;
  }

  async removeRelationship(id: string) {
    const rel = await this.repo.findById(id);
    if (!rel) throw new AppError(404, 'RELATIONSHIP_NOT_FOUND', 'Relationship not found');

    if (rel.type === RelationshipType.SPOUSE_OF) {
      await prisma.relationship.deleteMany({
        where: {
          type: RelationshipType.SPOUSE_OF,
          OR: [
            { fromMemberId: rel.fromMemberId, toMemberId: rel.toMemberId },
            { fromMemberId: rel.toMemberId, toMemberId: rel.fromMemberId },
          ],
        },
      });
    } else {
      await this.repo.delete(id);
    }

    await this.invalidateTreeCache();
  }

  private async invalidateTreeCache() {
    await redis.del('family-tree:all');
  }
}
