import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EventsService } from './events.service';
import { EventType } from '@prisma/client';

const createEventSchema = z.object({
  title: z.string().min(1),
  eventType: z.nativeEnum(EventType),
  date: z.string().datetime().transform((v) => new Date(v)),
  recurrenceRule: z.string().optional(),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export class EventsController {
  private readonly service: EventsService;

  constructor() {
    this.service = new EventsService();
  }

  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const eventType = req.query.eventType as EventType | undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const year = req.query.year ? Number(req.query.year) : undefined;
      const result = await this.service.getEvents({ eventType, page, limit, month, year });
      res.json({ data: result });
    } catch (err) { next(err); }
  };

  getEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await this.service.getEvent(req.params.id as string);
      res.json({ data: event });
    } catch (err) { next(err); }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createEventSchema.parse(req.body);
      const event = await this.service.createEvent(data);
      res.status(201).json({ data: event });
    } catch (err) { next(err); }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createEventSchema.partial().parse(req.body);
      const event = await this.service.updateEvent(req.params.id as string, data);
      res.json({ data: event });
    } catch (err) { next(err); }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteEvent(req.params.id as string);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}
