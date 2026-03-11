import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FamilyMembersService } from './family-members.service';
import { Gender, Role } from '@prisma/client';
import { JwtPayload } from '../../middleware/auth.middleware';

const createMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  dateOfDeath: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  gender: z.nativeEnum(Gender),
  bio: z.string().optional(),
  isLiving: z.boolean().optional(),
});

export class FamilyMembersController {
  private readonly service: FamilyMembersService;

  constructor() {
    this.service = new FamilyMembersService();
  }

  getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const isLiving = req.query.isLiving !== undefined ? req.query.isLiving === 'true' : undefined;
      const result = await this.service.getMembers({ search, isLiving, page, limit });
      res.json({ data: result });
    } catch (err) { next(err); }
  };

  getMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const member = await this.service.getMember(req.params.id as string);
      res.json({ data: member });
    } catch (err) { next(err); }
  };

  createMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as JwtPayload;
      const data = createMemberSchema.parse(req.body);
      const member = await this.service.createMember(data, {
        id: user.sub,
        role: user.role,
        familyMemberId: user.familyMemberId,
      });
      res.status(201).json({ data: member });
    } catch (err) { next(err); }
  };

  updateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as JwtPayload;
      const data = createMemberSchema.partial().parse(req.body);
      const member = await this.service.updateMember(req.params.id as string, data, {
        id: user.sub,
        role: user.role,
        familyMemberId: user.familyMemberId,
      });
      res.json({ data: member });
    } catch (err) { next(err); }
  };

  deleteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteMember(req.params.id as string);
      res.status(204).send();
    } catch (err) { next(err); }
  };

  uploadPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as JwtPayload;
      if (!req.file) {
        res.status(400).json({ error: { code: 'NO_FILE', message: 'No file uploaded' } });
        return;
      }
      const photoUrl = `/api/files/${req.file.filename}`;
      const member = await this.service.updatePhoto(req.params.id as string, photoUrl, {
        id: user.sub,
        role: user.role,
        familyMemberId: user.familyMemberId,
      });
      res.json({ data: member });
    } catch (err) { next(err); }
  };
}
