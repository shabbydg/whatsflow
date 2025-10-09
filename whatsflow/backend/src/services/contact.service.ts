import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class ContactService {
  async getContacts(businessProfileId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const contacts: any = await query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM contact_tags ct WHERE ct.contact_id = c.id) as tag_count,
              wc.device_name
       FROM contacts c
       LEFT JOIN whatsapp_connections wc ON c.last_device_id = wc.id
       WHERE c.business_profile_id = ?
       ORDER BY c.last_message_at DESC
       LIMIT ? OFFSET ?`,
      [businessProfileId, limit, offset]
    );

    const totalResult: any = await query(
      'SELECT COUNT(*) as total FROM contacts WHERE business_profile_id = ?',
      [businessProfileId]
    );

    const total = Array.isArray(totalResult) ? totalResult[0].total : 0;

    return {
      contacts: Array.isArray(contacts) ? contacts : [],
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
    const contacts: any = await query(
      'SELECT id FROM contacts WHERE id = ? AND business_profile_id = ?',
      [contactId, businessProfileId]
    );

    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new Error('Contact not found');
    }

    const tags: any = await query(
      'SELECT id FROM tags WHERE id = ? AND business_profile_id = ?',
      [tagId, businessProfileId]
    );

    if (!Array.isArray(tags) || tags.length === 0) {
      throw new Error('Tag not found');
    }

    await query(
      'INSERT IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)',
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
