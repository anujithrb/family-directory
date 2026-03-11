import { Request, Response, NextFunction } from 'express';
import { FamilyTreeService } from './family-tree.service';

export class FamilyTreeController {
  private readonly service: FamilyTreeService;

  constructor() {
    this.service = new FamilyTreeService();
  }

  getTree = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tree = await this.service.getFamilyTree();
      res.json({ data: tree });
    } catch (err) { next(err); }
  };
}
