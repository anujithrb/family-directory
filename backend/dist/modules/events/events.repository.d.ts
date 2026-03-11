import { EventType } from '@prisma/client';
export interface CreateEventDto {
    title: string;
    eventType: EventType;
    date: Date;
    recurrenceRule?: string;
    description?: string;
    memberIds?: string[];
}
export declare class EventsRepository {
    findAll(opts: {
        eventType?: EventType;
        page: number;
        limit: number;
        month?: number;
        year?: number;
    }): Promise<{
        events: ({
            eventMembers: ({
                familyMember: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                familyMemberId: string;
                eventId: string;
            })[];
        } & {
            date: Date;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            eventType: import(".prisma/client").$Enums.EventType;
            title: string;
            recurrenceRule: string | null;
            description: string | null;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        eventMembers: ({
            familyMember: {
                id: string;
                firstName: string;
                lastName: string;
                photoUrl: string | null;
            };
        } & {
            id: string;
            familyMemberId: string;
            eventId: string;
        })[];
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventType: import(".prisma/client").$Enums.EventType;
        title: string;
        recurrenceRule: string | null;
        description: string | null;
    }) | null>;
    create(data: CreateEventDto): Promise<{
        eventMembers: ({
            familyMember: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            familyMemberId: string;
            eventId: string;
        })[];
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventType: import(".prisma/client").$Enums.EventType;
        title: string;
        recurrenceRule: string | null;
        description: string | null;
    }>;
    update(id: string, data: Partial<CreateEventDto>): Promise<{
        eventMembers: ({
            familyMember: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            familyMemberId: string;
            eventId: string;
        })[];
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventType: import(".prisma/client").$Enums.EventType;
        title: string;
        recurrenceRule: string | null;
        description: string | null;
    }>;
    delete(id: string): Promise<{
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventType: import(".prisma/client").$Enums.EventType;
        title: string;
        recurrenceRule: string | null;
        description: string | null;
    }>;
}
//# sourceMappingURL=events.repository.d.ts.map