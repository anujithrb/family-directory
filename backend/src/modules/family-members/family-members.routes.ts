import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { FamilyMembersController } from './family-members.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';
import { env } from '../../config/env';

const router = Router();
const controller = new FamilyMembersController();

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/', authenticate, controller.getMembers);
router.get('/:id', authenticate, controller.getMember);
router.post('/', authenticate, controller.createMember);
router.patch('/:id', authenticate, controller.updateMember);
router.delete('/:id', authenticate, requireRole(Role.ADMIN), controller.deleteMember);
router.post('/:id/photo', authenticate, upload.single('photo'), controller.uploadPhoto);

export default router;
