import { query } from '../config/database.js';

export class MessageService {
  async getMessages(
    businessProfileId: string,
    contactId?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT m.*, c.name as contact_name, c.phone_number, wc.device_name
      FROM messages m
      INNER JOIN contacts c ON c.id = m.contact_id
      LEFT JOIN whatsapp_connections wc ON m.device_id = wc.id
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
      `SELECT m.*, wc.device_name
       FROM messages m
       LEFT JOIN whatsapp_connections wc ON m.device_id = wc.id
       WHERE m.business_profile_id = ? AND m.contact_id = ?
       ORDER BY m.created_at DESC
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
