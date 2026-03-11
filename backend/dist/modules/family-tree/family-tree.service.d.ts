export interface TreeNode {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    gender: string;
    isLiving: boolean;
    dateOfBirth?: Date | null;
    dateOfDeath?: Date | null;
}
export interface TreeEdge {
    id: string;
    fromMemberId: string;
    toMemberId: string;
    type: string;
}
export interface FamilyTreeData {
    nodes: TreeNode[];
    edges: TreeEdge[];
}
export declare class FamilyTreeService {
    /**
     * Get the full family tree, cached in Redis
     */
    getFamilyTree(): Promise<FamilyTreeData>;
    /**
     * Invalidate the cached family tree
     */
    invalidateCache(): Promise<void>;
}
//# sourceMappingURL=family-tree.service.d.ts.map