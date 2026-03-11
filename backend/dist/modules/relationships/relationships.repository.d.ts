import { RelationshipType } from '@prisma/client';
export declare class RelationshipsRepository {
    findByMember(memberId: string): Promise<({
        fromMember: {
            id: string;
            firstName: string;
            lastName: string;
            photoUrl: string | null;
        };
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
    })[]>;
    findById(id: string): Promise<({
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
    }) | null>;
    create(data: {
        fromMemberId: string;
        toMemberId: string;
        type: RelationshipType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
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
    }>;
    delete(id: string): Promise<{
        type: import(".prisma/client").$Enums.RelationshipType;
        id: string;
        createdAt: Date;
        fromMemberId: string;
        toMemberId: string;
        startDate: Date | null;
        endDate: Date | null;
    }>;
}
//# sourceMappingURL=relationships.repository.d.ts.map