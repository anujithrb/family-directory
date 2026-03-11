import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UsersService } from './users.service';
import { Role, PermissionKey } from '@prisma/client';

const updateRoleSchema = z.object({ role: z.nativeEnum(Role) });
const permissionSchema = z.object({ permissionKey: z.nativeEnum(PermissionKey) });

export class UsersController {
  private readonly service: UsersService;

  constructor() {
    this.service = new UsersService();
  }

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.service.getUsers(page, limit);
      res.json({ data: result });
    } catch (err) { next(err); }
  };

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getUser(req.params.id as string);
      res.json({ data: user });
    } catch (err) { next(err); }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role } = updateRoleSchema.parse(req.body);
      const user = await this.service.updateUserRole(req.params.id as string, role);
      res.json({ data: user });
    } catch (err) { next(err); }
  };

  setActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
      const user = await this.service.setUserActive(req.params.id as string, isActive);
      res.json({ data: user });
    } catch (err) { next(err); }
  };

  grantPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { permissionKey } = permissionSchema.parse(req.body);
      const perm = await this.service.grantPermission(req.params.id as string, permissionKey, req.user!.sub);
      res.status(201).json({ data: perm });
    } catch (err) { next(err); }
  };

  revokePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { permissionKey } = permissionSchema.parse(req.body);
      await this.service.revokePermission(req.params.id as string, permissionKey);
      res.json({ data: { message: 'Permission revoked' } });
    } catch (err) { next(err); }
  };

  getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const perms = await this.service.getUserPermissions(req.params.id as string);
      res.json({ data: perms });
    } catch (err) { next(err); }
  };
}
