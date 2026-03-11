import { Request, Response, NextFunction } from 'express';
export declare class EventsController {
    private readonly service;
    constructor();
    getEvents: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=events.controller.d.ts.map