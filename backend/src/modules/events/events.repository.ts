import { prisma } from '../../config/prisma';
import { EventType } from '@prisma/client';

export interface CreateEventDto {
  title: string;
  eventType: EventType;
  date: Date;
  recurrenceRule?: string;
  description?: string;
  memberIds?: string[];
}

export class EventsRepository {
  async findAll(opts: { eventType?: EventType; page: number; limit: number; month?: number; year?: number }) {
    const { eventType, page, limit, month, year } = opts;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (eventType) where.eventType = eventType;
    if (month !== undefined && year !== undefined) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          eventMembers: {
            include: {
              familyMember: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        eventMembers: {
          include: {
            familyMember: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
          },
        },
      },
    });
  }

  async create(data: CreateEventDto) {
    const { memberIds, ...eventData } = data;
    return prisma.event.create({
      data: {
        ...eventData,
        eventMembers: memberIds ? {
          create: memberIds.map((familyMemberId) => ({ familyMemberId })),
        } : undefined,
      },
      include: {
        eventMembers: {
          include: { familyMember: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
  }

  async update(id: string, data: Partial<CreateEventDto>) {
    const { memberIds, ...eventData } = data;
    return prisma.event.update({
      where: { id },
      data: eventData,
      include: {
        eventMembers: {
          include: { familyMember: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.event.delete({ where: { id } });
  }
}
