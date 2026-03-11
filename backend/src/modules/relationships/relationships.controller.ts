import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RelationshipsService } from './relationships.service';
import { RelationshipType } from '@prisma/client';

const createRelSchema = z.object({
  fromMemberId: z.string().cuid(),
  toMemberId: z.string().cuid(),
  type: z.nativeEnum(RelationshipType),
  startDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  endDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
});

export class RelationshipsController {
  private readonly service: RelationshipsService;

  constructor() {
    this.service = new RelationshipsService();
  }

  getRelationships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rels = await this.service.getRelationships(req.params.memberId as string);
      res.json({ data: rels });
    } catch (err) { next(err); }
  };

  addRelationship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createRelSchema.parse(req.body);
      const rel = await this.service.addRelationship(data);
      res.status(201).json({ data: rel });
    } catch (err) { next(err); }
  };

  removeRelationship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.removeRelationship(req.params.id as string);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}
