// FILE: src/services/contact.service.ts
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class ContactService {
  async getContacts(businessProfileId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const contacts: any = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM contact_tags ct WHERE ct.contact_id = c.id) as tag_count,
              (SELECT COUNT(*) FROM messages m WHERE m.contact_id = c.id) as message_count
       FROM contacts c
       WHERE c.business_profile_id = ?
       ORDER BY c.last_message_at DESC NULLS LAST
       LIMIT ? OFFSET ?`,
      [businessProfileId, limit, offset]
    );

    const totalResult: any = await query(
      'SELECT COUNT(*) as total FROM contacts WHERE business_profile_id = ?',
      [businessProfileId]
    );

    const total = Array.isArray(totalResult) ? totalResult[0].total : 0;

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContactById(contactId: string, businessProfileId: string) {
    const contacts: any = await query(
      'SELECT * FROM contacts WHERE id = ? AND business_profile_id = ?',
      [contactId, businessProfileId]
    );

    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new Error('Contact not found');
    }

    // Get tags
    const tags: any = await query(
      `SELECT t.* FROM tags t
       INNER JOIN contact_tags ct ON ct.tag_id = t.id
       WHERE ct.contact_id = ?`,
      [contactId]
    );

    return {
      ...contacts[0],
      tags: Array.isArray(tags) ? tags : [],
    };
  }

  async createContact(businessProfileId: string, phoneNumber: string, name?: string) {
    // Check if contact already exists
    const existing: any = await query(
      'SELECT id FROM contacts WHERE business_profile_id = ? AND phone_number = ?',
      [businessProfileId, phoneNumber]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      throw new Error('Contact already exists');
    }

    const contactId = uuidv4();
    await query(
      'INSERT INTO contacts (id, business_profile_id, phone_number, name) VALUES (?, ?, ?, ?)',
      [contactId, businessProfileId, phoneNumber, name || phoneNumber]
    );

    return await this.getContactById(contactId, businessProfileId);
  }

  async updateContact(contactId: string, businessProfileId: string, data: any) {
    const { name, metadata } = data;

    await query(
      'UPDATE contacts SET name = ?, metadata = ? WHERE id = ? AND business_profile_id = ?',
      [name, JSON.stringify(metadata || {}), contactId, businessProfileId]
    );

    return await this.getContactById(contactId, businessProfileId);
  }

  async deleteContact(contactId: string, businessProfileId: string) {
    await query(
      'DELETE FROM contacts WHERE id = ? AND business_profile_id = ?',
      [contactId, businessProfileId]
    );

    return { success: true };
  }

  async addTagToContact(contactId: string, tagId: string, businessProfileId: string) {
    // Verify contact belongs to business
    const contacts: any = await query(
      'SELECT id FROM contacts WHERE id = ? AND business_profile_id = ?',
      [contactId, businessProfileId]
    );

    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new Error('Contact not found');
    }

    // Verify tag belongs to business
    const tags: any = await query(
      'SELECT id FROM tags WHERE id = ? AND business_profile_id = ?',
      [tagId, businessProfileId]
    );

    if (!Array.isArray(tags) || tags.length === 0) {
      throw new Error('Tag not found');
    }

    // Add tag to contact (ignore if already exists)
    await query(
      'INSERT IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)',
      [contactId, tagId]
    );

    return { success: true };
  }

  async removeTagFromContact(contactId: string, tagId: string, businessProfileId: string) {
    await query(
      'DELETE FROM contact_tags WHERE contact_id = ? AND tag_id = ?',
      [contactId, tagId]
    );

    return { success: true };
  }

  async getTags(businessProfileId: string) {
    const tags: any = await query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM contact_tags ct WHERE ct.tag_id = t.id) as contact_count
       FROM tags t
       WHERE t.business_profile_id = ?
       ORDER BY t.name`,
      [businessProfileId]
    );

    return Array.isArray(tags) ? tags : [];
  }

  async createTag(businessProfileId: string, name: string, color: string = '#3B82F6') {
    const tagId = uuidv4();
    await query(
      'INSERT INTO tags (id, business_profile_id, name, color) VALUES (?, ?, ?, ?)',
      [tagId, businessProfileId, name, color]
    );

    const result: any = await query('SELECT * FROM tags WHERE id = ?', [tagId]);
    return Array.isArray(result) ? result[0] : null;
  }

  async deleteTag(tagId: string, businessProfileId: string) {
    await query(
      'DELETE FROM tags WHERE id = ? AND business_profile_id = ?',
      [tagId, businessProfileId]
    );

    return { success: true };
  }

  async searchContacts(businessProfileId: string, searchTerm: string) {
    const contacts: any = await query(
      `SELECT * FROM contacts 
       WHERE business_profile_id = ? 
       AND (name LIKE ? OR phone_number LIKE ?)
       ORDER BY last_message_at DESC
       LIMIT 50`,
      [businessProfileId, `%${searchTerm}%`, `%${searchTerm}%`]
    );

    return Array.isArray(contacts) ? contacts : [];
  }
}

// ============================================

// FILE: src/services/message.service.ts
import { query } from '../config/database';

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

// ============================================

// FILE: src/routes/contact.routes.ts
import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const contactController = new ContactController();

router.use(authenticate);

router.get('/', (req, res) => contactController.getContacts(req, res));
router.get('/search', (req, res) => contactController.searchContacts(req, res));
router.get('/tags', (req, res) => contactController.getTags(req, res));
router.post('/tags', (req, res) => contactController.createTag(req, res));
router.get('/:id', (req, res) => contactController.getContact(req, res));
router.post('/', (req, res) => contactController.createContact(req, res));
router.put('/:id', (req, res) => contactController.updateContact(req, res));
router.delete('/:id', (req, res) => contactController.deleteContact(req, res));
router.post('/:id/tags', (req, res) => contactController.addTagToContact(req, res));

export default router;

// ============================================

// FILE: src/routes/message.routes.ts
import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const messageController = new MessageController();

router.use(authenticate);

router.get('/', (req, res) => messageController.getMessages(req, res));
router.get('/stats', (req, res) => messageController.getStats(req, res));
router.get('/conversation/:contactId', (req, res) => messageController.getConversation(req, res));

export default router;Service {
  async getMessages(
    businessProfileId: string,
    contactId?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT m.*, c.name as contact_name, c.phone_number
      FROM messages m
      INNER JOIN contacts c ON c.id = m.contact_id
      WHERE m.business_profile_id = ?
    `;
    const params: any[] = [businessProfileId];

    if (contactId) {
      sql += ' AND m.contact_id = ?';
      params.push(contactId);
    }

    sql += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const messages: any = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM messages WHERE business_profile_id = ?';
    const countParams: any[] = [businessProfileId];

    if (contactId) {
      countSql += ' AND contact_id = ?';
      countParams.push(contactId);
    }

    const totalResult: any = await query(countSql, countParams);
    const total = Array.isArray(totalResult) ? totalResult[0].total : 0;

    return {
      messages: Array.isArray(messages) ? messages : [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConversation(businessProfileId: string, contactId: string, limit: number = 100) {
    const messages: any = await query(
      `SELECT * FROM messages
       WHERE business_profile_id = ? AND contact_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [businessProfileId, contactId, limit]
    );

    return Array.isArray(messages) ? messages.reverse() : [];
  }

  async getMessageStats(businessProfileId: string, days: number = 7) {
    const stats: any = await query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as total,
         SUM(CASE WHEN direction = 'inbound' THEN 1 ELSE 0 END) as received,
         SUM(CASE WHEN direction = 'outbound' THEN 1 ELSE 0 END) as sent
       FROM messages
       WHERE business_profile_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [businessProfileId, days]
    );

    return Array.isArray(stats) ? stats : [];
  }
}

// ============================================

// FILE: src/controllers/contact.controller.ts
import { Response } from 'express';
import { ContactService } from '../services/contact.service';
import { AuthRequest } from '../middleware/auth.middleware';

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

// ============================================

// FILE: src/controllers/message.controller.ts
import { Response } from 'express';
import { MessageService } from '../services/message.service';
import { AuthRequest } from '../middleware/auth.middleware';

const messageService = new MessageService();

export class Message