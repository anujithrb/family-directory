import { RelationshipType } from '@prisma/client';
export declare class RelationshipsService {
    private readonly repo;
    constructor();
    getRelationships(memberId: string): Promise<({
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
    /**
     * Add a relationship. Spouse relationships are always bidirectional.
     */
    addRelationship(data: {
        fromMemberId: string;
        toMemberId: string;
        type: RelationshipType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        type: import(".prisma/client").$Enums.RelationshipType;
        id: string;
        createdAt: Date;
        fromMemberId: string;
        toMemberId: string;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    removeRelationship(id: string): Promise<void>;
    private invalidateTreeCache;
}
//# sourceMappingURL=relationships.service.d.ts.map