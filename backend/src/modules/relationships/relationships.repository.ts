import { prisma } from '../../config/prisma';
import { RelationshipType } from '@prisma/client';

export class RelationshipsRepository {
  async findByMember(memberId: string) {
    return prisma.relationship.findMany({
      where: { OR: [{ fromMemberId: memberId }, { toMemberId: memberId }] },
      include: {
        fromMember: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        toMember: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.relationship.findUnique({
      where: { id },
      include: {
        fromMember: { select: { id: true, firstName: true, lastName: true } },
        toMember: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async create(data: {
    fromMemberId: string;
    toMemberId: string;
    type: RelationshipType;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.relationship.create({
      data,
      include: {
        fromMember: { select: { id: true, firstName: true, lastName: true } },
        toMember: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.relationship.delete({ where: { id } });
  }
}
