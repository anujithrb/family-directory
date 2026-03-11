import { EventType } from '@prisma/client';
import { CreateEventDto } from './events.repository';
export declare class EventsService {
    private readonly repo;
    constructor();
    getEvents(opts: {
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
    getEvent(id: string): Promise<{
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
    }>;
    createEvent(data: CreateEventDto): Promise<{
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
    updateEvent(id: string, data: Partial<CreateEventDto>): Promise<{
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
    deleteEvent(id: string): Promise<{
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
//# sourceMappingURL=events.service.d.ts.map