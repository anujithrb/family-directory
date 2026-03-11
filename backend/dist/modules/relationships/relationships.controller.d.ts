import { Request, Response, NextFunction } from 'express';
export declare class RelationshipsController {
    private readonly service;
    constructor();
    getRelationships: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addRelationship: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeRelationship: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=relationships.controller.d.ts.map