import { Response } from 'express';
import { ContactService } from '../services/contact.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const contactService = new ContactService();

export class ContactController {
  async getContacts(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await contactService.getContacts(req.user.businessProfileId, page, limit);

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getContact(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const contact = await contactService.getContactById(
        req.params.id,
        req.user.businessProfileId
      );

      res.json({ success: true, data: contact });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createContact(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const { phoneNumber, name } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const contact = await contactService.createContact(
        req.user.businessProfileId,
        phoneNumber,
        name
      );

      res.status(201).json({ success: true, data: contact });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateContact(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const contact = await contactService.updateContact(
        req.params.id,
        req.user.businessProfileId,
        req.body
      );

      res.json({ success: true, data: contact });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteContact(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      await contactService.deleteContact(req.params.id, req.user.businessProfileId);

      res.json({ success: true, message: 'Contact deleted' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTags(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const tags = await contactService.getTags(req.user.businessProfileId);

      res.json({ success: true, data: tags });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTag(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const { name, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      const tag = await contactService.createTag(req.user.businessProfileId, name, color);

      res.status(201).json({ success: true, data: tag });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addTagToContact(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const { tagId } = req.body;

      if (!tagId) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }

      await contactService.addTagToContact(req.params.id, tagId, req.user.businessProfileId);

      res.json({ success: true, message: 'Tag added to contact' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchContacts(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const searchTerm = req.query.q as string;

      if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
      }

      const contacts = await contactService.searchContacts(req.user.businessProfileId, searchTerm);

      res.json({ success: true, data: contacts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
