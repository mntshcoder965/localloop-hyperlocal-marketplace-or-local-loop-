import { Request, Response, NextFunction } from 'express';
import { conversationsService } from './conversations.service.js';

export const conversationsController = {
  async getOrCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.body;
      if (!listingId) {
        res.status(400).json({ success: false, message: 'listingId is required' });
        return;
      }
      const convo = await conversationsService.getOrCreate(listingId, req.user!.id);
      res.json({ success: true, data: convo });
    } catch (err) {
      next(err);
    }
  },

  async getMyConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const convos = await conversationsService.getMyConversations(req.user!.id);
      res.json({ success: true, data: convos });
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const result = await conversationsService.getMessages(req.params.id, req.user!.id, limit, offset);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'Message content cannot be empty' });
        return;
      }
      const result = await conversationsService.sendMessage(req.params.id, req.user!.id, content);
      res.status(201).json({ success: true, data: result.message });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await conversationsService.markAsRead(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Messages marked as read' });
    } catch (err) {
      next(err);
    }
  },
};

