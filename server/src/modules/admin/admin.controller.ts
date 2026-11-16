import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';

export const adminController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboard();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;

      const result = await adminService.getUsers(page, limit, search);
      res.json({
        success: true,
        data: result.users,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleSuspension(req: Request, res: Response, next: NextFunction) {
    try {
      const { isSuspended } = req.body;
      const updated = await adminService.toggleSuspension(req.params.userId, isSuspended);
      res.json({
        success: true,
        message: isSuspended ? 'User has been suspended' : 'User suspension lifted',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async moderateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await adminService.moderateListing(req.params.listingId, status);
      res.json({
        success: true,
        message: `Listing moderation updated: status set to ${status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const reports = await adminService.getReports(status);
      res.json({ success: true, data: reports });
    } catch (err) {
      next(err);
    }
  },

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, adminNotes } = req.body;
      const resolved = await adminService.resolveReport(
        req.params.id,
        status,
        adminNotes || '',
        req.user!.id
      );
      res.json({
        success: true,
        message: `Report marked as ${status}`,
        data: resolved,
      });
    } catch (err) {
      next(err);
    }
  },
};

