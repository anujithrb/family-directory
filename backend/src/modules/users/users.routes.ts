import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new UsersController();

router.use(authenticate, requireRole(Role.ADMIN));

router.get('/', controller.getUsers);
router.get('/:id', controller.getUser);
router.patch('/:id/role', controller.updateRole);
router.patch('/:id/active', controller.setActive);
router.get('/:id/permissions', controller.getPermissions);
router.post('/:id/permissions', controller.grantPermission);
router.delete('/:id/permissions', controller.revokePermission);

export default router;
