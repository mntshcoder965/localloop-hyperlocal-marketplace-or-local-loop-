import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service.js';

export const notificationsController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationsService.getMyNotifications(req.user!.id);
      res.json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAsRead(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  },
};

