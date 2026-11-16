import { Request, Response, NextFunction } from 'express';
import { categoriesRepository } from './categories.repository.js';

export const categoriesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoriesRepository.getAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },
};

