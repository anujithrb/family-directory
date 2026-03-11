import { prisma } from '../../config/prisma';
import { Gender } from '@prisma/client';

export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
  gender: Gender;
  photoUrl?: string;
  bio?: string;
  isLiving?: boolean;
}

export class FamilyMembersRepository {
  async findAll(opts: { search?: string; isLiving?: boolean; page: number; limit: number }) {
    const { search, isLiving, page, limit } = opts;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (isLiving !== undefined) where.isLiving = isLiving;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.familyMember.findMany({
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
      prisma.familyMember.count({ where }),
    ]);

    return { members, total };
  }

  async findById(id: string) {
    return prisma.familyMember.findUnique({
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

  async create(data: CreateMemberDto) {
    return prisma.familyMember.create({ data });
  }

  async update(id: string, data: Partial<CreateMemberDto>) {
    return prisma.familyMember.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.familyMember.delete({ where: { id } });
  }

  async updatePhoto(id: string, photoUrl: string) {
    return prisma.familyMember.update({ where: { id }, data: { photoUrl } });
  }

  async getRelationships(memberId: string) {
    return prisma.relationship.findMany({
      where: { OR: [{ fromMemberId: memberId }, { toMemberId: memberId }] },
      include: {
        fromMember: { select: { id: true, firstName: true, lastName: true } },
        toMember: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
