import { Role, PermissionKey } from '@prisma/client';
export declare class UsersService {
    private readonly repo;
    constructor();
    getUsers(page: number, limit: number): Promise<{
        users: {
            familyMember: {
                firstName: string;
                lastName: string;
            };
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            familyMemberId: string;
            isActive: boolean;
            createdAt: Date;
            permissions: {
                permissionKey: import(".prisma/client").$Enums.PermissionKey;
                grantedAt: Date;
            }[];
        }[];
        total: number;
    }>;
    getUser(id: string): Promise<{
        familyMember: {
            firstName: string;
            lastName: string;
            photoUrl: string | null;
        };
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        familyMemberId: string;
        isActive: boolean;
        createdAt: Date;
        permissions: {
            id: string;
            permissionKey: import(".prisma/client").$Enums.PermissionKey;
            grantedAt: Date;
        }[];
    }>;
    updateUserRole(id: string, role: Role): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        familyMemberId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setUserActive(id: string, isActive: boolean): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        familyMemberId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    grantPermission(userId: string, permissionKey: PermissionKey, grantedBy: string): Promise<{
        id: string;
        userId: string;
        permissionKey: import(".prisma/client").$Enums.PermissionKey;
        grantedBy: string;
        grantedAt: Date;
    }>;
    revokePermission(userId: string, permissionKey: PermissionKey): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUserPermissions(userId: string): Promise<({
        grantedByUser: {
            email: string;
        };
    } & {
        id: string;
        userId: string;
        permissionKey: import(".prisma/client").$Enums.PermissionKey;
        grantedBy: string;
        grantedAt: Date;
    })[]>;
}
//# sourceMappingURL=users.service.d.ts.map