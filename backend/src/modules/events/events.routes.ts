import { Router } from 'express';
import { EventsController } from './events.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new EventsController();

router.get('/', authenticate, controller.getEvents);
router.get('/:id', authenticate, controller.getEvent);
router.post('/', authenticate, requireRole(Role.ADMIN, Role.USER), controller.createEvent);
router.patch('/:id', authenticate, requireRole(Role.ADMIN, Role.USER), controller.updateEvent);
router.delete('/:id', authenticate, requireRole(Role.ADMIN), controller.deleteEvent);

export default router;
