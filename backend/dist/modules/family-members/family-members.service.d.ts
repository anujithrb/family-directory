import { Role } from '@prisma/client';
import { CreateMemberDto } from './family-members.repository';
export declare class FamilyMembersService {
    private readonly repo;
    constructor();
    getMembers(opts: {
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
    getMember(id: string): Promise<{
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
    }>;
    /**
     * Create a family member with permission check for non-admins
     */
    createMember(data: CreateMemberDto, requestingUser: {
        id: string;
        role: Role;
        familyMemberId: string;
    }): Promise<{
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
    /**
     * Update a family member with permission check
     */
    updateMember(id: string, data: Partial<CreateMemberDto>, requestingUser: {
        id: string;
        role: Role;
        familyMemberId: string;
    }): Promise<{
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
    /**
     * Delete a family member (admin only)
     */
    deleteMember(id: string): Promise<{
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
    /**
     * Update profile photo
     */
    updatePhoto(id: string, photoUrl: string, requestingUser: {
        id: string;
        role: Role;
        familyMemberId: string;
    }): Promise<{
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
    private checkRelationPermission;
}
//# sourceMappingURL=family-members.service.d.ts.map