// FILE: src/services/whatsapp.service.ts (ENHANCED VERSION)
// Replace the existing whatsapp.service.ts with this enhanced version

import { Client, LocalAuth, Message as WAMessage, MessageMedia } from 'whatsapp-web.js';
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';
import { EventEmitter } from 'events';
import { io } from '../app';

const activeClients = new Map<string, Client>();
const clientEvents = new EventEmitter();

export class WhatsAppService {
  
  async initializeConnection(businessProfileId: string, phoneNumber: string) {
    try {
      const existing: any = await query(
        'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND phone_number = ?',
        [businessProfileId, phoneNumber]
      );

      let connectionId: string;

      if (Array.isArray(existing) && existing.length > 0) {
        connectionId = existing[0].id;
        await query(
          'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
          ['qr_pending', connectionId]
        );
      } else {
        connectionId = uuidv4();
        await query(
          'INSERT INTO whatsapp_connections (id, business_profile_id, phone_number, status) VALUES (?, ?, ?, ?)',
          [connectionId, businessProfileId, phoneNumber, 'qr_pending']
        );
      }

      const sessionPath = path.join(
        process.cwd(),
        process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions',
        connectionId
      );

      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
      }

      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: connectionId,
          dataPath: sessionPath,
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      });

      activeClients.set(connectionId, client);
      this.setupClientEvents(client, connectionId, businessProfileId);
      await client.initialize();

      return { connectionId, status: 'qr_pending' };
    } catch (error: any) {
      logger.error('WhatsApp initialization error:', error);
      throw new Error('Failed to initialize WhatsApp connection');
    }
  }

  private setupClientEvents(client: Client, connectionId: string, businessProfileId: string) {
    client.on('qr', async (qr) => {
      logger.info(`QR Code generated for connection: ${connectionId}`);
      await query(
        'UPDATE whatsapp_connections SET qr_code = ?, status = ? WHERE id = ?',
        [qr, 'qr_pending', connectionId]
      );

      // Emit to specific business profile room
      io.to(`business-${businessProfileId}`).emit('whatsapp:qr', { connectionId, qr });
    });

    client.on('ready', async () => {
      logger.info(`WhatsApp client ready: ${connectionId}`);
      await query(
        'UPDATE whatsapp_connections SET status = ?, last_connected_at = NOW(), qr_code = NULL WHERE id = ?',
        ['connected', connectionId]
      );

      io.to(`business-${businessProfileId}`).emit('whatsapp:connected', { connectionId });
    });

    // ENHANCED: Handle all message types including media
    client.on('message', async (message: WAMessage) => {
      try {
        await this.handleIncomingMessage(message, businessProfileId, connectionId);
      } catch (error) {
        logger.error('Error handling incoming message:', error);
      }
    });

    // ENHANCED: Message acknowledgment (sent, delivered, read)
    client.on('message_ack', async (message: WAMessage, ack) => {
      try {
        let status = 'sent';
        if (ack === 2) status = 'delivered';
        if (ack === 3) status = 'read';

        await query(
          'UPDATE messages SET status = ? WHERE whatsapp_message_id = ?',
          [status, message.id._serialized]
        );

        // Emit real-time status update
        io.to(`business-${businessProfileId}`).emit('message:status', {
          messageId: message.id._serialized,
          status,
        });
      } catch (error) {
        logger.error('Error updating message status:', error);
      }
    });

    // ENHANCED: Typing indicator
    client.on('change_state', async (state) => {
      // Emit typing status
      io.to(`business-${businessProfileId}`).emit('contact:typing', { state });
    });

    client.on('disconnected', async (reason) => {
      logger.warn(`WhatsApp disconnected: ${connectionId}, Reason: ${reason}`);
      await query(
        'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
        ['disconnected', connectionId]
      );
      activeClients.delete(connectionId);
      io.to(`business-${businessProfileId}`).emit('whatsapp:disconnected', { connectionId, reason });
    });

    client.on('auth_failure', async (msg) => {
      logger.error(`WhatsApp auth failure: ${connectionId}, ${msg}`);
      await query(
        'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
        ['disconnected', connectionId]
      );
    });
  }

  private async handleIncomingMessage(message: WAMessage, businessProfileId: string, connectionId: string) {
    const contact = await message.getContact();
    const phoneNumber = contact.number;
    const chat = await message.getChat();

    // Get or create contact
    let contactRecord: any = await query(
      'SELECT * FROM contacts WHERE business_profile_id = ? AND phone_number = ?',
      [businessProfileId, phoneNumber]
    );

    let contactId: string;

    if (!Array.isArray(contactRecord) || contactRecord.length === 0) {
      contactId = uuidv4();
      await query(
        `INSERT INTO contacts (id, business_profile_id, phone_number, name, profile_pic_url, first_message_at, last_message_at, total_messages)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 1)`,
        [contactId, businessProfileId, phoneNumber, contact.pushname || phoneNumber, contact.profilePicUrl || null]
      );
    } else {
      contactId = contactRecord[0].id;
      await query(
        'UPDATE contacts SET last_message_at = NOW(), total_messages = total_messages + 1, name = ?, profile_pic_url = ? WHERE id = ?',
        [contact.pushname || contactRecord[0].name, contact.profilePicUrl || contactRecord[0].profile_pic_url, contactId]
      );
    }

    // Handle media download
    let mediaUrl = null;
    let mediaData = null;

    if (message.hasMedia) {
      try {
        const media = await message.downloadMedia();
        if (media) {
          // Save media to disk or cloud storage
          const mediaDir = path.join(process.cwd(), 'uploads', 'media');
          if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
          }

          const fileName = `${uuidv4()}.${media.mimetype.split('/')[1]}`;
          const filePath = path.join(mediaDir, fileName);
          
          // Convert base64 to buffer and save
          const buffer = Buffer.from(media.data, 'base64');
          fs.writeFileSync(filePath, buffer);
          
          mediaUrl = `/uploads/media/${fileName}`;
          mediaData = media.mimetype;
        }
      } catch (error) {
        logger.error('Error downloading media:', error);
      }
    }

    // Save message
    const messageId = uuidv4();
    await query(
      `INSERT INTO messages (id, business_profile_id, contact_id, whatsapp_message_id, direction, message_type, content, media_url, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'inbound', ?, ?, ?, 'received', ?, NOW())`,
      [
        messageId,
        businessProfileId,
        contactId,
        message.id._serialized,
        message.type,
        message.body,
        mediaUrl,
        JSON.stringify({ mimetype: mediaData, hasQuotedMsg: message.hasQuotedMsg })
      ]
    );

    // Emit real-time message to frontend
    io.to(`business-${businessProfileId}`).emit('message:new', {
      id: messageId,
      contactId,
      contact: {
        id: contactId,
        name: contact.pushname || phoneNumber,
        phone_number: phoneNumber,
        profile_pic_url: contact.profilePicUrl,
      },
      whatsapp_message_id: message.id._serialized,
      direction: 'inbound',
      message_type: message.type,
      content: message.body,
      media_url: mediaUrl,
      status: 'received',
      created_at: new Date(),
    });

    logger.info(`Message received and emitted: ${messageId} from ${phoneNumber}`);
  }

  async sendMessage(
    businessProfileId: string,
    phoneNumber: string,
    message: string,
    mediaPath?: string,
    quotedMessageId?: string
  ) {
    try {
      const connections: any = await query(
        'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND status = ?',
        [businessProfileId, 'connected']
      );

      if (!Array.isArray(connections) || connections.length === 0) {
        throw new Error('No active WhatsApp connection found');
      }

      const connectionId = connections[0].id;
      const client = activeClients.get(connectionId);

      if (!client) {
        throw new Error('WhatsApp client not initialized');
      }

      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '') + '@c.us';

      let sentMessage: WAMessage;

      // Send with media if provided
      if (mediaPath) {
        const media = MessageMedia.fromFilePath(mediaPath);
        sentMessage = await client.sendMessage(formattedNumber, media, {
          caption: message || '',
        });
      } else {
        // Send text message with optional quote
        const options: any = {};
        if (quotedMessageId) {
          // Get quoted message
          const chat = await client.getChatById(formattedNumber);
          const messages = await chat.fetchMessages({ limit: 100 });
          const quotedMsg = messages.find((m: any) => m.id._serialized === quotedMessageId);
          if (quotedMsg) {
            options.quotedMessageId = quotedMsg.id;
          }
        }
        sentMessage = await client.sendMessage(formattedNumber, message, options);
      }

      // Get or create contact
      let contactRecord: any = await query(
        'SELECT * FROM contacts WHERE business_profile_id = ? AND phone_number = ?',
        [businessProfileId, phoneNumber]
      );

      let contactId: string;

      if (!Array.isArray(contactRecord) || contactRecord.length === 0) {
        contactId = uuidv4();
        await query(
          `INSERT INTO contacts (id, business_profile_id, phone_number, last_message_at, total_messages)
           VALUES (?, ?, ?, NOW(), 1)`,
          [contactId, businessProfileId, phoneNumber]
        );
      } else {
        contactId = contactRecord[0].id;
        await query(
          'UPDATE contacts SET last_message_at = NOW(), total_messages = total_messages + 1 WHERE id = ?',
          [contactId]
        );
      }

      // Save message to database
      const messageId = uuidv4();
      const messageType = mediaPath ? 'media' : 'text';
      
      await query(
        `INSERT INTO messages (id, business_profile_id, contact_id, whatsapp_message_id, direction, message_type, content, media_url, status, created_at)
         VALUES (?, ?, ?, ?, 'outbound', ?, ?, ?, 'sent', NOW())`,
        [messageId, businessProfileId, contactId, sentMessage.id._serialized, messageType, message, mediaPath || null]
      );

      // Emit real-time message to frontend
      io.to(`business-${businessProfileId}`).emit('message:sent', {
        id: messageId,
        contactId,
        whatsapp_message_id: sentMessage.id._serialized,
        direction: 'outbound',
        message_type: messageType,
        content: message,
        media_url: mediaPath,
        status: 'sent',
        created_at: new Date(),
      });

      return {
        messageId,
        whatsappMessageId: sentMessage.id._serialized,
        status: 'sent',
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Error sending message:', error);
      throw new Error('Failed to send message: ' + error.message);
    }
  }

  async getConnectionStatus(businessProfileId: string) {
    const connections: any = await query(
      'SELECT * FROM whatsapp_connections WHERE business_profile_id = ?',
      [businessProfileId]
    );

    if (!Array.isArray(connections) || connections.length === 0) {
      return { status: 'not_connected', qrCode: null };
    }

    const connection = connections[0];
    return {
      status: connection.status,
      phoneNumber: connection.phone_number,
      qrCode: connection.qr_code,
      lastConnected: connection.last_connected_at,
    };
  }

  async disconnect(businessProfileId: string) {
    const connections: any = await query(
      'SELECT * FROM whatsapp_connections WHERE business_profile_id = ?',
      [businessProfileId]
    );

    if (Array.isArray(connections) && connections.length > 0) {
      const connectionId = connections[0].id;
      const client = activeClients.get(connectionId);

      if (client) {
        await client.destroy();
        activeClients.delete(connectionId);
      }

      await query(
        'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
        ['disconnected', connectionId]
      );
    }

    return { success: true };
  }

  // NEW: Mark messages as read
  async markAsRead(businessProfileId: string, contactId: string) {
    try {
      const contact: any = await query(
        'SELECT phone_number FROM contacts WHERE id = ? AND business_profile_id = ?',
        [contactId, businessProfileId]
      );

      if (!Array.isArray(contact) || contact.length === 0) {
        throw new Error('Contact not found');
      }

      const connections: any = await query(
        'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND status = ?',
        [businessProfileId, 'connected']
      );

      if (Array.isArray(connections) && connections.length > 0) {
        const client = activeClients.get(connections[0].id);
        if (client) {
          const formattedNumber = contact[0].phone_number.replace(/[^0-9]/g, '') + '@c.us';
          const chat = await client.getChatById(formattedNumber);
          await chat.sendSeen();
        }
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Error marking as read:', error);
      throw error;
    }
  }

  getEventEmitter() {
    return clientEvents;
  }
}