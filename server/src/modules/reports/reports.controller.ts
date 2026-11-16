import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service.js';

export const reportsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId, reason, details } = req.body;
      const report = await reportsService.fileReport({
        reporterId: req.user!.id,
        targetType,
        targetId,
        reason,
        details,
      });
      res.status(201).json({
        success: true,
        message: 'Report submitted. Our moderation team will review this shortly.',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  },
};

