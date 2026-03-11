import { prisma } from '../../config/prisma';
import { redis } from '../../config/redis';

const CACHE_KEY = 'family-tree:all';
const CACHE_TTL = 3600; // 1 hour

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

export class FamilyTreeService {
  /**
   * Get the full family tree, cached in Redis
   */
  async getFamilyTree(): Promise<FamilyTreeData> {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as FamilyTreeData;
    }

    const [members, relationships] = await Promise.all([
      prisma.familyMember.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          gender: true,
          isLiving: true,
          dateOfBirth: true,
          dateOfDeath: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.relationship.findMany({
        select: {
          id: true,
          fromMemberId: true,
          toMemberId: true,
          type: true,
        },
      }),
    ]);

    const tree: FamilyTreeData = {
      nodes: members,
      edges: relationships,
    };

    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(tree));

    return tree;
  }

  /**
   * Invalidate the cached family tree
   */
  async invalidateCache(): Promise<void> {
    await redis.del(CACHE_KEY);
  }
}
