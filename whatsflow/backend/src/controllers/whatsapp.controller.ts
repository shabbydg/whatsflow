import { Response } from 'express';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const whatsappService = new WhatsAppService();

export class WhatsAppController {
  async connect(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const result = await whatsappService.initializeConnection(
        req.user.businessProfileId,
        phoneNumber
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const status = await whatsappService.getConnectionStatus(
        req.user.businessProfileId
      );

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async disconnect(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      await whatsappService.disconnect(req.user.businessProfileId);

      res.json({
        success: true,
        message: 'Disconnected successfully',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const { phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required' });
      }

      const result = await whatsappService.sendMessage(
        req.user.businessProfileId,
        phoneNumber,
        message
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async syncContacts(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const result = await whatsappService.syncContacts(req.user.businessProfileId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
