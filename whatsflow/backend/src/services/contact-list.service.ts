/**
 * Contact List Service
 * Manages contact lists for broadcast campaigns
 */

import pool from '../config/database.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export interface ContactList {
  id: string;
  business_profile_id: string;
  name: string;
  description?: string;
  total_contacts: number;
  created_at: string;
  updated_at: string;
}

export interface ContactListMember {
  id: string;
  list_id: string;
  contact_id?: string;
  phone_number: string;
  full_name?: string;
  custom_fields?: Record<string, any>;
  opted_out: boolean;
  created_at: string;
}

export class ContactListService {
  /**
   * Get all contact lists for a business
   */
  async getAllLists(businessProfileId: string): Promise<ContactList[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM contact_lists
       WHERE business_profile_id = ?
       ORDER BY created_at DESC`,
      [businessProfileId]
    );

    return rows as ContactList[];
  }

  /**
   * Get a single contact list by ID
   */
  async getListById(listId: string, businessProfileId: string): Promise<ContactList> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM contact_lists WHERE id = ? AND business_profile_id = ?',
      [listId, businessProfileId]
    );

    if (rows.length === 0) {
      throw new Error('Contact list not found');
    }

    return rows[0] as ContactList;
  }

  /**
   * Create a new contact list
   */
  async createList(
    businessProfileId: string,
    data: {
      name: string;
      description?: string;
    }
  ): Promise<ContactList> {
    const listId = uuidv4();

    await pool.query<ResultSetHeader>(
      `INSERT INTO contact_lists (id, business_profile_id, name, description)
       VALUES (?, ?, ?, ?)`,
      [listId, businessProfileId, data.name, data.description || null]
    );

    logger.info(`Contact list created: ${listId}`);

    return this.getListById(listId, businessProfileId);
  }

  /**
   * Update a contact list
   */
  async updateList(
    listId: string,
    businessProfileId: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<ContactList> {
    await this.getListById(listId, businessProfileId);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length === 0) {
      return this.getListById(listId, businessProfileId);
    }

    values.push(listId, businessProfileId);

    await pool.query<ResultSetHeader>(
      `UPDATE contact_lists SET ${updates.join(', ')}
       WHERE id = ? AND business_profile_id = ?`,
      values
    );

    logger.info(`Contact list updated: ${listId}`);

    return this.getListById(listId, businessProfileId);
  }

  /**
   * Delete a contact list
   */
  async deleteList(listId: string, businessProfileId: string): Promise<void> {
    await this.getListById(listId, businessProfileId);

    await pool.query<ResultSetHeader>(
      'DELETE FROM contact_lists WHERE id = ? AND business_profile_id = ?',
      [listId, businessProfileId]
    );

    logger.info(`Contact list deleted: ${listId}`);
  }

  /**
   * Get members of a contact list
   */
  async getListMembers(
    listId: string,
    businessProfileId: string,
    options: {
      page?: number;
      limit?: number;
      excludeOptedOut?: boolean;
    } = {}
  ): Promise<{ members: ContactListMember[]; total: number }> {
    await this.getListById(listId, businessProfileId);

    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE list_id = ?';
    const params: any[] = [listId];

    if (options.excludeOptedOut) {
      whereClause += ' AND opted_out = FALSE';
    }

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM contact_list_members ${whereClause}`,
      params
    );

    const total = countRows[0].total;

    // Get members
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM contact_list_members
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      members: rows as ContactListMember[],
      total,
    };
  }

  /**
   * Add a single contact to a list
   */
  async addContactToList(
    listId: string,
    businessProfileId: string,
    data: {
      phone_number: string;
      full_name?: string;
      contact_id?: string;
      custom_fields?: Record<string, any>;
    }
  ): Promise<ContactListMember> {
    await this.getListById(listId, businessProfileId);

    const memberId = uuidv4();

    await pool.query<ResultSetHeader>(
      `INSERT INTO contact_list_members
       (id, list_id, contact_id, phone_number, full_name, custom_fields)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       custom_fields = VALUES(custom_fields),
       contact_id = VALUES(contact_id)`,
      [
        memberId,
        listId,
        data.contact_id || null,
        data.phone_number,
        data.full_name || null,
        data.custom_fields ? JSON.stringify(data.custom_fields) : null,
      ]
    );

    // Update total count
    await this.updateListCount(listId);

    logger.info(`Contact added to list: ${listId}`);

    return this.getMemberById(memberId);
  }

  /**
   * Add multiple contacts to a list (bulk import)
   */
  async addMultipleContacts(
    listId: string,
    businessProfileId: string,
    contacts: Array<{
      phone_number: string;
      full_name?: string;
      custom_fields?: Record<string, any>;
    }>
  ): Promise<{ added: number; errors: string[] }> {
    await this.getListById(listId, businessProfileId);

    let added = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        await this.addContactToList(listId, businessProfileId, contact);
        added++;
      } catch (error: any) {
        errors.push(`${contact.phone_number}: ${error.message}`);
      }
    }

    await this.updateListCount(listId);

    logger.info(`Bulk import to list ${listId}: ${added} added, ${errors.length} errors`);

    return { added, errors };
  }

  /**
   * Remove a contact from a list
   */
  async removeContactFromList(
    listId: string,
    memberId: string,
    businessProfileId: string
  ): Promise<void> {
    await this.getListById(listId, businessProfileId);

    await pool.query<ResultSetHeader>(
      'DELETE FROM contact_list_members WHERE id = ? AND list_id = ?',
      [memberId, listId]
    );

    // Update total count
    await this.updateListCount(listId);

    logger.info(`Contact removed from list: ${listId}`);
  }

  /**
   * Mark a contact as opted out
   */
  async markOptedOut(memberId: string, optedOut: boolean = true): Promise<void> {
    await pool.query<ResultSetHeader>(
      'UPDATE contact_list_members SET opted_out = ? WHERE id = ?',
      [optedOut, memberId]
    );

    logger.info(`Contact opt-out status updated: ${memberId} = ${optedOut}`);
  }

  /**
   * Get a member by ID
   */
  private async getMemberById(memberId: string): Promise<ContactListMember> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM contact_list_members WHERE id = ?',
      [memberId]
    );

    if (rows.length === 0) {
      throw new Error('Member not found');
    }

    const member = rows[0] as any;

    // Parse custom_fields JSON
    if (member.custom_fields && typeof member.custom_fields === 'string') {
      member.custom_fields = JSON.parse(member.custom_fields);
    }

    return member as ContactListMember;
  }

  /**
   * Update the total contact count for a list
   */
  private async updateListCount(listId: string): Promise<void> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM contact_list_members WHERE list_id = ? AND opted_out = FALSE',
      [listId]
    );

    const count = rows[0].count;

    await pool.query<ResultSetHeader>(
      'UPDATE contact_lists SET total_contacts = ? WHERE id = ?',
      [count, listId]
    );
  }

  /**
   * Parse CSV data and return contact array
   */
  parseCsvData(csvText: string): Array<{
    phone_number: string;
    full_name?: string;
    custom_fields?: Record<string, any>;
  }> {
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('number'));
    const nameIndex = headers.findIndex(h => h.includes('name'));

    if (phoneIndex === -1) {
      throw new Error('CSV must contain a phone number column');
    }

    const contacts: Array<{
      phone_number: string;
      full_name?: string;
      custom_fields?: Record<string, any>;
    }> = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      if (values.length < headers.length) continue;

      const phoneNumber = values[phoneIndex];
      if (!phoneNumber) continue;

      const contact: any = {
        phone_number: phoneNumber,
      };

      if (nameIndex !== -1 && values[nameIndex]) {
        contact.full_name = values[nameIndex];
      }

      // Add other columns as custom fields
      const customFields: Record<string, any> = {};
      headers.forEach((header, index) => {
        if (index !== phoneIndex && index !== nameIndex && values[index]) {
          customFields[header] = values[index];
        }
      });

      if (Object.keys(customFields).length > 0) {
        contact.custom_fields = customFields;
      }

      contacts.push(contact);
    }

    return contacts;
  }
}

export const contactListService = new ContactListService();
