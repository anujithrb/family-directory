import { Router } from 'express';
import { FamilyTreeController } from './family-tree.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new FamilyTreeController();

router.get('/', authenticate, controller.getTree);

export default router;
