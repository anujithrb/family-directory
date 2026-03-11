import { Request, Response, NextFunction } from 'express';
export declare class UsersController {
    private readonly service;
    constructor();
    getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    setActive: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    grantPermission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    revokePermission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map