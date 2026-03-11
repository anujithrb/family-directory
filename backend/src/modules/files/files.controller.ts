import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';

export class FilesController {
  /**
   * Serve a file by filename
   */
  serveFile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const filename = req.params.filename as string;
      // Prevent path traversal
      const safeName = path.basename(filename);
      const filePath = path.resolve(env.UPLOAD_DIR, safeName);

      if (!fs.existsSync(filePath)) {
        return next(new AppError(404, 'FILE_NOT_FOUND', 'File not found'));
      }

      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  };
}
