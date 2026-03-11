"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsRepository = void 0;
const prisma_1 = require("../../config/prisma");
class EventsRepository {
    async findAll(opts) {
        const { eventType, page, limit, month, year } = opts;
        const skip = (page - 1) * limit;
        const where = {};
        if (eventType)
            where.eventType = eventType;
        if (month !== undefined && year !== undefined) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            where.date = { gte: start, lte: end };
        }
        const [events, total] = await Promise.all([
            prisma_1.prisma.event.findMany({
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
            prisma_1.prisma.event.count({ where }),
        ]);
        return { events, total };
    }
    async findById(id) {
        return prisma_1.prisma.event.findUnique({
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
    async create(data) {
        const { memberIds, ...eventData } = data;
        return prisma_1.prisma.event.create({
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
    async update(id, data) {
        const { memberIds, ...eventData } = data;
        return prisma_1.prisma.event.update({
            where: { id },
            data: eventData,
            include: {
                eventMembers: {
                    include: { familyMember: { select: { id: true, firstName: true, lastName: true } } },
                },
            },
        });
    }
    async delete(id) {
        return prisma_1.prisma.event.delete({ where: { id } });
    }
}
exports.EventsRepository = EventsRepository;
//# sourceMappingURL=events.repository.js.map