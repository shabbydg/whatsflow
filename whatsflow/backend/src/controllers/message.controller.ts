import { Response } from 'express';
import { MessageService } from '../services/message.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const messageService = new MessageService();

export class MessageController {
  async getMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const contactId = req.query.contactId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await messageService.getMessages(
        req.user.businessProfileId,
        contactId,
        page,
        limit
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getConversation(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const { contactId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      const messages = await messageService.getConversation(
        req.user.businessProfileId,
        contactId,
        limit
      );

      res.json({ success: true, data: messages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const days = parseInt(req.query.days as string) || 7;

      const stats = await messageService.getMessageStats(req.user.businessProfileId, days);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
