import { Router } from 'express';
import { RelationshipsController } from './relationships.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new RelationshipsController();

router.get('/member/:memberId', authenticate, controller.getRelationships);
router.post('/', authenticate, requireRole(Role.ADMIN, Role.USER), controller.addRelationship);
router.delete('/:id', authenticate, requireRole(Role.ADMIN), controller.removeRelationship);

export default router;
