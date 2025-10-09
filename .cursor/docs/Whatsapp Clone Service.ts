// FILE: src/services/whatsapp.service.ts
import { Client, LocalAuth, Message as WAMessage } from 'whatsapp-web.js';
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';
import { EventEmitter } from 'events';

// Store active WhatsApp clients
const activeClients = new Map<string, Client>();
const clientEvents = new EventEmitter();

export class WhatsAppService {
  
  async initializeConnection(businessProfileId: string, phoneNumber: string) {
    try {
      // Check if connection already exists
      const existing: any = await query(
        'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND phone_number = ?',
        [businessProfileId, phoneNumber]
      );

      let connectionId: string;

      if (Array.isArray(existing) && existing.length > 0) {
        connectionId = existing[0].id;
        // Update status to pending
        await query(
          'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
          ['qr_pending', connectionId]
        );
      } else {
        // Create new connection record
        connectionId = uuidv4();
        await query(
          'INSERT INTO whatsapp_connections (id, business_profile_id, phone_number, status) VALUES (?, ?, ?, ?)',
          [connectionId, businessProfileId, phoneNumber, 'qr_pending']
        );
      }

      // Initialize WhatsApp client
      const sessionPath = path.join(
        process.cwd(),
        process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions',
        connectionId
      );

      // Create session directory if it doesn't exist
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

      // Store client
      activeClients.set(connectionId, client);

      // Setup event handlers
      this.setupClientEvents(client, connectionId, businessProfileId);

      // Initialize client
      await client.initialize();

      return { connectionId, status: 'qr_pending' };
    } catch (error: any) {
      logger.error('WhatsApp initialization error:', error);
      throw new Error('Failed to initialize WhatsApp connection');
    }
  }

  private setupClientEvents(client: Client, connectionId: string, businessProfileId: string) {
    // QR Code event
    client.on('qr', async (qr) => {
      logger.info(`QR Code generated for connection: ${connectionId}`);
      
      // Save QR code to database
      await query(
        'UPDATE whatsapp_connections SET qr_code = ?, status = ? WHERE id = ?',
        [qr, 'qr_pending', connectionId]
      );

      // Emit event for real-time updates
      clientEvents.emit('qr', { connectionId, qr });
    });

    // Ready event
    client.on('ready', async () => {
      logger.info(`WhatsApp client ready: ${connectionId}`);
      
      // Update connection status
      await query(
        'UPDATE whatsapp_connections SET status = ?, last_connected_at = NOW(), qr_code = NULL WHERE id = ?',
        ['connected', connectionId]
      );

      clientEvents.emit('ready', { connectionId });
    });

    // Message received event
    client.on('message', async (message: WAMessage) => {
      try {
        await this.handleIncomingMessage(message, businessProfileId);
      } catch (error) {
        logger.error('Error handling incoming message:', error);
      }
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      logger.warn(`WhatsApp disconnected: ${connectionId}, Reason: ${reason}`);
      
      await query(
        'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
        ['disconnected', connectionId]
      );

      activeClients.delete(connectionId);
      clientEvents.emit('disconnected', { connectionId, reason });
    });

    // Authentication failure
    client.on('auth_failure', async (msg) => {
      logger.error(`WhatsApp auth failure: ${connectionId}, ${msg}`);
      
      await query(
        'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
        ['disconnected', connectionId]
      );
    });
  }

  private async handleIncomingMessage(message: WAMessage, businessProfileId: string) {
    const contact = await message.getContact();
    const phoneNumber = contact.number;

    // Get or create contact
    let contactRecord: any = await query(
      'SELECT * FROM contacts WHERE business_profile_id = ? AND phone_number = ?',
      [businessProfileId, phoneNumber]
    );

    let contactId: string;

    if (!Array.isArray(contactRecord) || contactRecord.length === 0) {
      // Create new contact
      contactId = uuidv4();
      await query(
        `INSERT INTO contacts (id, business_profile_id, phone_number, name, first_message_at, last_message_at, total_messages)
         VALUES (?, ?, ?, ?, NOW(), NOW(), 1)`,
        [contactId, businessProfileId, phoneNumber, contact.pushname || phoneNumber]
      );
    } else {
      contactId = contactRecord[0].id;
      // Update contact
      await query(
        'UPDATE contacts SET last_message_at = NOW(), total_messages = total_messages + 1, name = ? WHERE id = ?',
        [contact.pushname || contactRecord[0].name, contactId]
      );
    }

    // Save message
    const messageId = uuidv4();
    await query(
      `INSERT INTO messages (id, business_profile_id, contact_id, whatsapp_message_id, direction, message_type, content, status, created_at)
       VALUES (?, ?, ?, ?, 'inbound', ?, ?, 'received', NOW())`,
      [messageId, businessProfileId, contactId, message.id._serialized, message.type, message.body]
    );

    // Emit event for real-time updates
    clientEvents.emit('message', {
      businessProfileId,
      contactId,
      message: {
        id: messageId,
        content: message.body,
        type: message.type,
        direction: 'inbound',
      },
    });

    logger.info(`Message saved: ${messageId} from ${phoneNumber}`);
  }

  async sendMessage(businessProfileId: string, phoneNumber: string, message: string) {
    try {
      // Get connection
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

      // Format phone number (remove + and add country code if needed)
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '') + '@c.us';

      // Send message
      const sentMessage = await client.sendMessage(formattedNumber, message);

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
      await query(
        `INSERT INTO messages (id, business_profile_id, contact_id, whatsapp_message_id, direction, message_type, content, status, created_at)
         VALUES (?, ?, ?, ?, 'outbound', 'text', ?, 'sent', NOW())`,
        [messageId, businessProfileId, contactId, sentMessage.id._serialized, message]
      );

      return {
        messageId,
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

  // Get event emitter for real-time updates
  getEventEmitter() {
    return clientEvents;
  }
}

// ============================================

// FILE: src/controllers/whatsapp.controller.ts
import { Response } from 'express';
import { WhatsAppService } from '../services/whatsapp.service';
import { AuthRequest } from '../middleware/auth.middleware';

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
}

// ============================================

// FILE: src/routes/whatsapp.routes.ts
import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const whatsappController = new WhatsAppController();

// All routes require authentication
router.use(authenticate);

router.post('/connect', (req, res) => whatsappController.connect(req, res));
router.get('/status', (req, res) => whatsappController.getStatus(req, res));
router.post('/disconnect', (req, res) => whatsappController.disconnect(req, res));
router.post('/send', (req, res) => whatsappController.sendMessage(req, res));

export default router;