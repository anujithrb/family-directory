import { Request, Response, NextFunction } from 'express';
export declare class FamilyMembersController {
    private readonly service;
    constructor();
    getMembers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadPhoto: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=family-members.controller.d.ts.map