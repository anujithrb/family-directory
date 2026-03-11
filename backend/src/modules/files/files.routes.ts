import { Router } from 'express';
import { FilesController } from './files.controller';

const router = Router();
const controller = new FilesController();

router.get('/:filename', controller.serveFile);

export default router;
