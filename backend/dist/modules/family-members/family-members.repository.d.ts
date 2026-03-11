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
export declare class FamilyMembersRepository {
    findAll(opts: {
        search?: string;
        isLiving?: boolean;
        page: number;
        limit: number;
    }): Promise<{
        members: {
            id: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date | null;
            gender: import(".prisma/client").$Enums.Gender;
            photoUrl: string | null;
            isLiving: boolean;
        }[];
        total: number;
    }>;
    findById(id: string): Promise<({
        relationshipsFrom: ({
            toMember: {
                id: string;
                firstName: string;
                lastName: string;
                photoUrl: string | null;
            };
        } & {
            type: import(".prisma/client").$Enums.RelationshipType;
            id: string;
            createdAt: Date;
            fromMemberId: string;
            toMemberId: string;
            startDate: Date | null;
            endDate: Date | null;
        })[];
        relationshipsTo: ({
            fromMember: {
                id: string;
                firstName: string;
                lastName: string;
                photoUrl: string | null;
            };
        } & {
            type: import(".prisma/client").$Enums.RelationshipType;
            id: string;
            createdAt: Date;
            fromMemberId: string;
            toMemberId: string;
            startDate: Date | null;
            endDate: Date | null;
        })[];
        eventMembers: ({
            event: {
                date: Date;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                eventType: import(".prisma/client").$Enums.EventType;
                title: string;
                recurrenceRule: string | null;
                description: string | null;
            };
        } & {
            id: string;
            familyMemberId: string;
            eventId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        linkedUserId: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        dateOfDeath: Date | null;
        gender: import(".prisma/client").$Enums.Gender;
        photoUrl: string | null;
        bio: string | null;
        isLiving: boolean;
    }) | null>;
    create(data: CreateMemberDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        linkedUserId: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        dateOfDeath: Date | null;
        gender: import(".prisma/client").$Enums.Gender;
        photoUrl: string | null;
        bio: string | null;
        isLiving: boolean;
    }>;
    update(id: string, data: Partial<CreateMemberDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        linkedUserId: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        dateOfDeath: Date | null;
        gender: import(".prisma/client").$Enums.Gender;
        photoUrl: string | null;
        bio: string | null;
        isLiving: boolean;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        linkedUserId: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        dateOfDeath: Date | null;
        gender: import(".prisma/client").$Enums.Gender;
        photoUrl: string | null;
        bio: string | null;
        isLiving: boolean;
    }>;
    updatePhoto(id: string, photoUrl: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        linkedUserId: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        dateOfDeath: Date | null;
        gender: import(".prisma/client").$Enums.Gender;
        photoUrl: string | null;
        bio: string | null;
        isLiving: boolean;
    }>;
    getRelationships(memberId: string): Promise<({
        fromMember: {
            id: string;
            firstName: string;
            lastName: string;
        };
        toMember: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        type: import(".prisma/client").$Enums.RelationshipType;
        id: string;
        createdAt: Date;
        fromMemberId: string;
        toMemberId: string;
        startDate: Date | null;
        endDate: Date | null;
    })[]>;
}
//# sourceMappingURL=family-members.repository.d.ts.map