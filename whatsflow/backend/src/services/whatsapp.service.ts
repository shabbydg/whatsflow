import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
  WAMessage,
  Contact as BaileysContact,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';
import { io } from '../app.js';
import QRCode from 'qrcode';
import { aiChatService } from './ai/chat.service.js';
import { aiManager } from './ai/ai-manager.service.js';
import { emailService } from './email.service.js';

const activeSockets = new Map<string, WASocket>();
const reconnectionAttempts = new Map<string, number>();
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 5000; // 5 seconds

export class WhatsAppService {

  /**
   * Send disconnect alert email if enabled for device
   */
  private async sendDisconnectAlert(connectionId: string) {
    try {
      const result: any = await query(
        `SELECT
          wc.device_name,
          wc.phone_number,
          wc.email_on_disconnect,
          bp.user_id
         FROM whatsapp_connections wc
         JOIN business_profiles bp ON wc.business_profile_id = bp.id
         WHERE wc.id = ?`,
        [connectionId]
      );

      if (Array.isArray(result) && result.length > 0) {
        const device = result[0];

        if (device.email_on_disconnect) {
          logger.info(`Sending disconnect alert for device ${connectionId}`);

          await emailService.sendDeviceDisconnectAlert(
            device.user_id,
            connectionId,
            {
              deviceName: device.device_name || 'WhatsApp Device',
              phoneNumber: device.phone_number || 'Unknown',
              disconnectedAt: new Date(),
            }
          );
        }
      }
    } catch (error) {
      logger.error('Error sending disconnect alert:', error);
      // Don't throw - we don't want email failures to break the disconnect flow
    }
  }

  /**
   * Initialize all existing connections on server start
   */
  async initializeAllConnections() {
    try {
      const connections: any = await query(
        "SELECT * FROM whatsapp_connections WHERE status IN ('connected', 'qr_pending')"
      );

      if (Array.isArray(connections) && connections.length > 0) {
        logger.info(`Found ${connections.length} existing connections to restore`);

        for (const conn of connections) {
          try {
            // Check if session files exist
            const sessionPath = path.join(
              process.cwd(),
              process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions',
              conn.id
            );

            if (fs.existsSync(sessionPath)) {
              logger.info(`Restoring connection for device: ${conn.device_name || conn.phone_number}`);
              await this.restoreConnection(conn.business_profile_id, conn.phone_number, conn.id);
            } else {
              logger.warn(`Session files not found for ${conn.device_name}, marking as disconnected`);
              await query(
                'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
                ['disconnected', conn.id]
              );
            }
          } catch (error) {
            logger.error(`Failed to restore connection ${conn.id}:`, error);
          }
        }
      } else {
        logger.info('No existing connections to restore');
      }
    } catch (error) {
      logger.error('Error initializing connections:', error);
    }
  }

  /**
   * Restore an existing connection using saved session
   */
  async restoreConnection(businessProfileId: string, phoneNumber: string, connectionId?: string) {
    try {
      logger.info(`Attempting to restore connection for ${phoneNumber}...`);

      const existing: any = await query(
        'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND phone_number = ?',
        [businessProfileId, phoneNumber]
      );

      if (!Array.isArray(existing) || existing.length === 0) {
        throw new Error('Connection not found in database');
      }

      const connId = connectionId || existing[0].id;
      const sessionPath = path.join(
        process.cwd(),
        process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions',
        connId
      );

      logger.info(`Session path: ${sessionPath}, exists: ${fs.existsSync(sessionPath)}`);

      if (!fs.existsSync(sessionPath)) {
        logger.warn(`No session found for ${connId}, need to reinitialize`);
        return await this.initializeConnection(businessProfileId, phoneNumber);
      }

      logger.info(`Restoring socket for connection ${connId}...`);
      const result = await this.createSocket(businessProfileId, phoneNumber, connId, sessionPath);
      logger.info(`✅ Successfully restored connection ${connId}`);
      return result;
    } catch (error: any) {
      logger.error('Error restoring connection:', error);
      throw error;
    }
  }

  /**
   * Delete existing connection and session files
   */
  async deleteConnection(businessProfileId: string, phoneNumber: string) {
    try {
      const existing: any = await query(
        'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND phone_number = ?',
        [businessProfileId, phoneNumber]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        const connectionId = existing[0].id;

        // Close active socket if exists
        const sock = activeSockets.get(connectionId);
        if (sock) {
          try {
            await sock.logout();
          } catch (e) {
            // Ignore logout errors
          }
          activeSockets.delete(connectionId);
        }

        // Delete session files
        const sessionPath = path.join(
          process.cwd(),
          process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions',
          connectionId
        );

        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          logger.info(`Deleted session files for connection: ${connectionId}`);
        }

        // Update database to reset status
        await query(
          'UPDATE whatsapp_connections SET status = ?, qr_code = NULL WHERE id = ?',
          ['qr_pending', connectionId]
        );
      }
    } catch (error: any) {
      logger.error('Error deleting connection:', error);
      // Don't throw - allow initialization to proceed
    }
  }

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
          'UPDATE whatsapp_connections SET status = ?, qr_code = NULL WHERE id = ?',
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

      return await this.createSocket(businessProfileId, phoneNumber, connectionId, sessionPath);
    } catch (error: any) {
      logger.error('WhatsApp initialization error:', error);
      throw new Error('Failed to initialize WhatsApp connection');
    }
  }

  /**
   * Create WhatsApp socket connection
   */
  private async createSocket(
    businessProfileId: string,
    phoneNumber: string,
    connectionId: string,
    sessionPath: string
  ) {
    try {
      // Get latest Baileys version
      const { version, isLatest } = await fetchLatestBaileysVersion();
      logger.info(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

      // Load auth state
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      // Create Baileys-compatible logger
      const createBaileysLogger = (): any => ({
        level: 'silent',
        trace: (...args: any[]) => {},
        debug: (...args: any[]) => {},
        info: (...args: any[]) => {},
        warn: (...args: any[]) => {},
        error: (...args: any[]) => {},
        fatal: (...args: any[]) => {},
        child: (bindings: any) => createBaileysLogger(),
      });

      const baileysLogger = createBaileysLogger();

      // Create socket
      const sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, baileysLogger as any),
        },
        printQRInTerminal: false,
        logger: baileysLogger as any,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        browser: ['WhatsFlow', 'Chrome', '110.0.0'],
        getMessage: async (key) => {
          // Return undefined to allow Baileys to fetch from server if needed
          return undefined;
        },
      });

      // Track if we've sent the first QR code to prevent updates during pairing
      let firstQrSent = false;

      // Handle connection updates
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        logger.info(`Connection update for ${connectionId}:`, { connection, hasQr: !!qr, error: lastDisconnect?.error });

        if (qr && !firstQrSent) {
          // Only update QR code if we haven't sent the first one yet
          // This prevents QR code from changing while user is scanning/pairing
          const qrDataUrl = await QRCode.toDataURL(qr);
          logger.info(`QR Code generated for connection: ${connectionId}`);

          await query(
            'UPDATE whatsapp_connections SET qr_code = ?, status = ? WHERE id = ?',
            [qrDataUrl, 'qr_pending', connectionId]
          );

          firstQrSent = true;
          logger.info(`First QR code sent, will not update again to allow pairing to complete`);
        } else if (qr && firstQrSent) {
          logger.info(`Ignoring new QR code to allow current pairing attempt to complete`);
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          logger.error(`Connection closed for ${connectionId}`, {
            statusCode,
            reason: DisconnectReason[statusCode as number] || 'Unknown',
            shouldReconnect,
            error: lastDisconnect?.error
          });

          // Remove from active sockets
          activeSockets.delete(connectionId);

          if (shouldReconnect) {
            // Get current reconnection attempt count
            const attempts = reconnectionAttempts.get(connectionId) || 0;

            if (attempts < MAX_RECONNECTION_ATTEMPTS) {
              reconnectionAttempts.set(connectionId, attempts + 1);

              logger.info(`Attempting reconnection ${attempts + 1}/${MAX_RECONNECTION_ATTEMPTS} for ${connectionId}`);

              // Update status to show reconnecting
              await query(
                'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
                ['reconnecting', connectionId]
              );

              // Attempt reconnection with exponential backoff
              const delay = RECONNECTION_DELAY * Math.pow(2, attempts);
              setTimeout(async () => {
                try {
                  await this.restoreConnection(businessProfileId, phoneNumber, connectionId);
                } catch (error) {
                  logger.error(`Reconnection attempt failed for ${connectionId}:`, error);
                }
              }, delay);
            } else {
              // Max reconnection attempts reached
              logger.error(`Max reconnection attempts reached for ${connectionId}`);
              await query(
                'UPDATE whatsapp_connections SET status = ?, qr_code = NULL WHERE id = ?',
                ['disconnected', connectionId]
              );
              reconnectionAttempts.delete(connectionId);

              // Send disconnect alert
              await this.sendDisconnectAlert(connectionId);
            }
          } else {
            // Logged out, mark as disconnected
            logger.info(`Device logged out: ${connectionId}`);
            await query(
              'UPDATE whatsapp_connections SET status = ?, qr_code = NULL WHERE id = ?',
              ['disconnected', connectionId]
            );
            reconnectionAttempts.delete(connectionId);

            // Send disconnect alert
            await this.sendDisconnectAlert(connectionId);
          }
        } else if (connection === 'open') {
          logger.info(`WhatsApp connected successfully: ${connectionId}`);

          // Reset reconnection attempts on successful connection
          reconnectionAttempts.delete(connectionId);

          await query(
            'UPDATE whatsapp_connections SET status = ?, last_connected_at = NOW(), qr_code = NULL WHERE id = ?',
            ['connected', connectionId]
          );

          activeSockets.set(connectionId, sock);

          // Emit connection success event
          io.to(`business-${businessProfileId}`).emit('whatsapp-connected', {
            connectionId,
            phoneNumber,
            timestamp: new Date(),
          });
        }
      });

      // Save credentials on update
      sock.ev.on('creds.update', saveCreds);

      // Handle incoming messages
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        logger.info(`📨 Received messages.upsert event for connection ${connectionId}: type=${type}, count=${messages.length}`);
        if (type === 'notify') {
          for (const msg of messages) {
            logger.info(`Processing message from ${msg.key.remoteJid}, fromMe=${msg.key.fromMe}`);
            await this.handleIncomingMessage(msg, businessProfileId, connectionId);
          }
        } else {
          logger.info(`Ignoring messages.upsert with type=${type}`);
        }
      });

      // Debug: Log all events to see what Baileys is emitting
      const originalEmit = sock.ev.emit.bind(sock.ev);
      sock.ev.emit = function(event: any, ...args: any[]) {
        if (event !== 'creds.update' && event !== 'connection.update') {
          logger.info(`🔔 Baileys event emitted: ${event}`);
        }
        return originalEmit(event, ...args);
      };

      logger.info(`✅ Message listener registered for connection ${connectionId}`);

      return { connectionId, status: 'qr_pending' };
    } catch (error: any) {
      logger.error('Socket creation error:', error);
      throw error;
    }
  }

  private async handleIncomingMessage(message: WAMessage, businessProfileId: string, deviceId: string) {
    try {
      // Process both incoming and outgoing text messages
      if (message.message) {
        const remoteJid = message.key.remoteJid;
        // Skip groups, newsletters, and broadcast lists
        if (!remoteJid || remoteJid.includes('@g.us') || remoteJid.includes('@newsletter') || remoteJid.includes('@broadcast')) return;

        // Extract phone number from JID (handles both @s.whatsapp.net and @lid formats)
        const phoneNumber = remoteJid.replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0];

        // Extract message content based on type
        let messageText = message.message.conversation ||
                         message.message.extendedTextMessage?.text || '';
        let mediaType: string | null = null;
        let mediaUrl: string | null = null;

        // Handle different message types
        if (message.message.imageMessage) {
          mediaType = 'image';
          messageText = message.message.imageMessage.caption || '[Image]';
          // We'll process the image below
        } else if (message.message.audioMessage) {
          mediaType = 'audio';
          messageText = '[Voice Note]';
          // We'll process the audio below
        } else if (message.message.videoMessage) {
          mediaType = 'video';
          messageText = message.message.videoMessage.caption || '[Video]';
        } else if (message.message.documentMessage) {
          mediaType = 'document';
          messageText = `[Document: ${message.message.documentMessage.fileName || 'file'}]`;
        }

        if (!messageText && !mediaType) return;

        const isFromMe = message.key.fromMe;
        const direction = isFromMe ? 'outbound' : 'inbound';
        const status = isFromMe ? 'sent' : 'received';

        // Get or create contact
        let contactRecord: any = await query(
          'SELECT * FROM contacts WHERE business_profile_id = ? AND phone_number = ?',
          [businessProfileId, phoneNumber]
        );

        let contactId: string;

        if (!Array.isArray(contactRecord) || contactRecord.length === 0) {
          contactId = uuidv4();
          await query(
            `INSERT INTO contacts (id, business_profile_id, phone_number, name, first_message_at, last_message_at, total_messages, last_device_id)
             VALUES (?, ?, ?, ?, NOW(), NOW(), 1, ?)`,
            [contactId, businessProfileId, phoneNumber, phoneNumber, deviceId]
          );
        } else {
          contactId = contactRecord[0].id;
          await query(
            'UPDATE contacts SET last_message_at = NOW(), total_messages = total_messages + 1, last_device_id = ? WHERE id = ?',
            [deviceId, contactId]
          );
        }

        // Check if message already exists (to avoid duplicates from our own API sends)
        const existingMsg: any = await query(
          'SELECT id FROM messages WHERE whatsapp_message_id = ? AND business_profile_id = ?',
          [message.key.id, businessProfileId]
        );

        if (Array.isArray(existingMsg) && existingMsg.length > 0) {
          logger.info(`Message ${message.key.id} already exists, skipping save`);
          return;
        }

        // Save message with device_id
        const messageId = uuidv4();
        await query(
          `INSERT INTO messages (id, business_profile_id, contact_id, device_id, whatsapp_message_id, direction, message_type, content, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'text', ?, ?, NOW())`,
          [messageId, businessProfileId, contactId, deviceId, message.key.id, direction, messageText, status]
        );

        // Emit Socket.IO event
        const room = `business-${businessProfileId}`;
        logger.info(`Emitting new-message event to room: ${room} (${direction})`);
        io.to(room).emit('new-message', {
          id: messageId,
          business_profile_id: businessProfileId,
          contact_id: contactId,
          device_id: deviceId,
          whatsapp_message_id: message.key.id,
          direction,
          message_type: 'text',
          content: messageText,
          status,
          created_at: new Date(),
        });

        logger.info(`✅ Message saved and emitted: ${messageId} ${direction} ${isFromMe ? 'to' : 'from'} ${phoneNumber}`);

        // AI Auto-Reply: Only respond to inbound messages (not our own)
        if (!isFromMe && direction === 'inbound') {
          // Process media if present
          let processedText = messageText;
          const socket = activeSockets.get(deviceId);

          if (socket && mediaType && !isFromMe) {
            try {
              if (mediaType === 'audio') {
                // Download and transcribe voice note
                logger.info('🎤 Processing voice note...');
                const buffer = await this.downloadMediaMessage(message, socket);
                if (buffer) {
                  const transcription = await this.transcribeAudio(buffer);
                  processedText = transcription || messageText;
                  logger.info(`✅ Voice note transcribed: "${processedText}"`);
                }
              } else if (mediaType === 'image') {
                // Download and analyze image
                logger.info('🖼️  Processing image...');
                const buffer = await this.downloadMediaMessage(message, socket);
                if (buffer) {
                  const imageAnalysis = await this.analyzeImage(buffer, message.message.imageMessage?.caption);
                  processedText = imageAnalysis || messageText;
                  logger.info(`✅ Image analyzed: "${processedText.substring(0, 100)}..."`);
                }
              }
            } catch (mediaError) {
              logger.error('Error processing media:', mediaError);
              // Continue with original text if media processing fails
            }
          }

          // Check if AI should respond for this device
          const shouldRespond = await aiChatService.shouldAIRespond(deviceId);

          if (shouldRespond) {
            logger.info(`🤖 AI auto-reply enabled for device ${deviceId}, generating response...`);

            try {
              // Get device to retrieve persona_id
              const deviceInfo: any = await query(
                'SELECT persona_id FROM whatsapp_connections WHERE id = ?',
                [deviceId]
              );

              const personaId = Array.isArray(deviceInfo) && deviceInfo.length > 0
                ? deviceInfo[0].persona_id
                : undefined;

              // Generate AI response using processed text (transcription or image analysis)
              const { response } = await aiChatService.generateResponse(
                businessProfileId,
                contactId,
                processedText,
                personaId,
                deviceId,
                messageId
              );

              logger.info(`🤖 AI generated response: "${response.substring(0, 100)}..."`);

              // Split response into multiple messages if needed
              const messages = this.splitResponseIntoMessages(response);

              // Send each message with typing delay
              for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];

                // Simulate typing indicator and human-like delay
                await this.simulateTyping(businessProfileId, phoneNumber, msg);

                // Send the message
                await this.sendMessage(businessProfileId, phoneNumber, msg);

                // Small delay between multiple messages (if more than one)
                if (i < messages.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }

              logger.info(`✅ AI auto-reply sent to ${phoneNumber} (${messages.length} message${messages.length > 1 ? 's' : ''})`);
            } catch (aiError) {
              logger.error('Error generating/sending AI auto-reply:', aiError);
              // Don't throw - we still want to save the original message
            }
          } else {
            logger.info(`⏸️  AI auto-reply disabled or outside schedule for device ${deviceId}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error handling incoming message:', error);
    }
  }

  /**
   * Simulate typing indicator and human-like delay before sending message
   */
  async simulateTyping(businessProfileId: string, phoneNumber: string, message: string) {
    try {
      // Get the active socket for this contact
      const contactCheck: any = await query(
        'SELECT last_device_id FROM contacts WHERE business_profile_id = ? AND phone_number = ?',
        [businessProfileId, phoneNumber]
      );

      if (!Array.isArray(contactCheck) || contactCheck.length === 0 || !contactCheck[0].last_device_id) {
        return; // No device found, skip typing indicator
      }

      const deviceId = contactCheck[0].last_device_id;
      const socket = activeSockets.get(deviceId);

      if (!socket) {
        return; // Socket not active, skip typing indicator
      }

      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;

      // Send typing indicator
      await socket.sendPresenceUpdate('composing', jid);

      // Calculate human-like delay based on message length
      // Average typing speed: ~40-60 words per minute (WPM)
      // That's roughly 5-8 characters per second
      const wordsCount = message.split(/\s+/).length;
      const baseDelay = wordsCount * 200; // 200ms per word
      const randomVariation = Math.random() * 1000; // Add 0-1s random variation
      const delay = Math.min(baseDelay + randomVariation, 5000); // Cap at 5 seconds

      logger.info(`💬 Simulating typing for ${delay.toFixed(0)}ms before sending message`);

      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delay));

      // Stop typing indicator
      await socket.sendPresenceUpdate('paused', jid);

    } catch (error) {
      logger.error('Error simulating typing:', error);
      // Don't throw - continue sending message even if typing simulation fails
    }
  }

  async sendMessage(businessProfileId: string, phoneNumber: string, message: string) {
    try {
      // Check if this contact has a preferred device (last device they communicated with)
      const contactCheck: any = await query(
        'SELECT last_device_id FROM contacts WHERE business_profile_id = ? AND phone_number = ?',
        [businessProfileId, phoneNumber]
      );

      let connectionId: string;

      // If contact exists and has a last_device_id, try to use that device
      if (Array.isArray(contactCheck) && contactCheck.length > 0 && contactCheck[0].last_device_id) {
        const preferredDeviceId = contactCheck[0].last_device_id;

        // Check if preferred device is connected
        const preferredDevice: any = await query(
          'SELECT * FROM whatsapp_connections WHERE id = ? AND status IN (?, ?)',
          [preferredDeviceId, 'connected', 'reconnecting']
        );

        if (Array.isArray(preferredDevice) && preferredDevice.length > 0) {
          connectionId = preferredDeviceId;
          logger.info(`Using preferred device ${connectionId} for contact ${phoneNumber}`);
        }
      }

      // If no preferred device or it's not connected, use any connected device
      if (!connectionId) {
        const connections: any = await query(
          'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND status IN (?, ?) ORDER BY is_primary DESC',
          [businessProfileId, 'connected', 'reconnecting']
        );

        if (!Array.isArray(connections) || connections.length === 0) {
          throw new Error('No active WhatsApp connection found. Please connect a device first.');
        }

        connectionId = connections[0].id;
        logger.info(`Using default device ${connectionId} for contact ${phoneNumber}`);
      }

      const connection: any = await query(
        'SELECT * FROM whatsapp_connections WHERE id = ?',
        [connectionId]
      );

      if (!Array.isArray(connection) || connection.length === 0) {
        throw new Error('Device not found');
      }
      let sock = activeSockets.get(connectionId);

      // If socket not in memory but DB says connected, try to restore
      if (!sock && connection.status === 'connected') {
        logger.warn(`Socket not found for ${connectionId}, attempting to restore...`);

        try {
          await this.restoreConnection(businessProfileId, connection.phone_number, connectionId);
          sock = activeSockets.get(connectionId);

          // Wait a moment for connection to establish
          if (!sock) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            sock = activeSockets.get(connectionId);
          }
        } catch (error) {
          logger.error('Failed to restore connection:', error);
        }
      }

      if (!sock) {
        throw new Error('WhatsApp socket not initialized. The connection is being restored. Please try again in a moment.');
      }

      const jid = phoneNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      const sentMsg = await sock.sendMessage(jid, { text: message });

      if (!sentMsg) {
        throw new Error('Failed to send message');
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
          `INSERT INTO contacts (id, business_profile_id, phone_number, last_message_at, total_messages, last_device_id)
           VALUES (?, ?, ?, NOW(), 1, ?)`,
          [contactId, businessProfileId, phoneNumber, connectionId]
        );
      } else {
        contactId = contactRecord[0].id;
        await query(
          'UPDATE contacts SET last_message_at = NOW(), total_messages = total_messages + 1, last_device_id = ? WHERE id = ?',
          [connectionId, contactId]
        );
      }

      const messageId = uuidv4();
      const whatsappMsgId = sentMsg.key?.id || uuidv4();

      await query(
        `INSERT INTO messages (id, business_profile_id, contact_id, device_id, whatsapp_message_id, direction, message_type, content, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'outbound', 'text', ?, 'sent', NOW())`,
        [messageId, businessProfileId, contactId, connectionId, whatsappMsgId, message]
      );

      // Emit Socket.IO event
      io.to(`business-${businessProfileId}`).emit('new-message', {
        id: messageId,
        business_profile_id: businessProfileId,
        contact_id: contactId,
        whatsapp_message_id: whatsappMsgId,
        direction: 'outbound',
        message_type: 'text',
        content: message,
        status: 'sent',
        created_at: new Date(),
      });

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

  async syncContacts(businessProfileId: string) {
    try {
      const connections: any = await query(
        'SELECT * FROM whatsapp_connections WHERE business_profile_id = ? AND status = ?',
        [businessProfileId, 'connected']
      );

      if (!Array.isArray(connections) || connections.length === 0) {
        throw new Error('No active WhatsApp connection found');
      }

      const connectionId = connections[0].id;
      const sock = activeSockets.get(connectionId);

      if (!sock) {
        throw new Error('WhatsApp socket not initialized. Please reconnect.');
      }

      // Baileys stores contacts in the authState
      // We can access contacts through the store, but Baileys doesn't have a direct API
      // to fetch all contacts like wppconnect did. Instead, contacts are populated
      // as you interact with them or receive messages.

      // For now, we'll fetch contacts from the database that already exist
      // and return a message to the user
      const existingContacts: any = await query(
        'SELECT COUNT(*) as count FROM contacts WHERE business_profile_id = ?',
        [businessProfileId]
      );

      const count = Array.isArray(existingContacts) && existingContacts[0] ? existingContacts[0].count : 0;

      logger.info(`Contact sync requested. Found ${count} existing contacts. Baileys adds contacts automatically as you chat.`);

      return {
        success: true,
        synced: count,
        new: 0,
        message: 'Contacts are automatically added as you receive or send messages. You can manually add contacts using the New Message button.'
      };
    } catch (error: any) {
      logger.error('Error syncing contacts:', error);
      throw new Error('Failed to sync contacts: ' + error.message);
    }
  }

  async disconnect(businessProfileId: string) {
    const connections: any = await query(
      'SELECT * FROM whatsapp_connections WHERE business_profile_id = ?',
      [businessProfileId]
    );

    if (Array.isArray(connections) && connections.length > 0) {
      const connectionId = connections[0].id;
      const sock = activeSockets.get(connectionId);

      if (sock) {
        await sock.logout();
        activeSockets.delete(connectionId);
      }

      await query(
        'UPDATE whatsapp_connections SET status = ? WHERE id = ?',
        ['disconnected', connectionId]
      );
    }

    return { success: true };
  }

  /**
   * Download media from WhatsApp message
   */
  private async downloadMediaMessage(message: WAMessage, socket: WASocket): Promise<Buffer | null> {
    try {
      const buffer = await downloadMediaMessage(
        message,
        'buffer',
        {},
        {
          logger: logger as any,
          reuploadRequest: socket.updateMediaMessage
        }
      );
      return buffer as Buffer;
    } catch (error) {
      logger.error('Error downloading media:', error);
      return null;
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper or fallback to Claude
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<string | null> {
    try {
      // Try OpenAI Whisper first (most accurate for transcription)
      if (process.env.OPENAI_API_KEY) {
        const FormData = (await import('form-data')).default;
        const form = new FormData();

        // Convert to a format Whisper accepts (e.g., MP3 or OGG)
        form.append('file', audioBuffer, {
          filename: 'audio.ogg',
          contentType: 'audio/ogg'
        });
        form.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...form.getHeaders()
          },
          body: form
        });

        if (response.ok) {
          const data: any = await response.json();
          return data.text;
        }
      }

      // Fallback: Use Claude/Gemini with a note that this is audio
      logger.warn('OpenAI not available for transcription, falling back to text response');
      return 'User sent a voice note (transcription not available - please ask them to send text)';

    } catch (error) {
      logger.error('Error transcribing audio:', error);
      return null;
    }
  }

  /**
   * Analyze image using Claude or Gemini vision capabilities
   */
  private async analyzeImage(imageBuffer: Buffer, caption?: string): Promise<string | null> {
    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Use Claude's vision capabilities
      const prompt = caption
        ? `User sent an image with caption: "${caption}". Describe what you see in the image and respond appropriately to their message.`
        : 'User sent an image. Describe what you see in the image and respond helpfully.';

      // Call AI manager with vision support
      const response = await aiManager.analyzeImage(base64Image, prompt);

      return response || `User shared an image${caption ? ` with caption: "${caption}"` : ''}`;

    } catch (error) {
      logger.error('Error analyzing image:', error);
      return null;
    }
  }

  /**
   * Split long AI responses into multiple WhatsApp-friendly messages
   * Keeps messages short and conversational
   */
  private splitResponseIntoMessages(response: string): string[] {
    // If response already has newlines (multiple paragraphs), split by those
    const paragraphs = response.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

    const messages: string[] = [];

    for (const paragraph of paragraphs) {
      // Check if paragraph has bullet points
      const hasBulletPoints = /^[•\-\*]\s/m.test(paragraph) || /\n[•\-\*]\s/m.test(paragraph);

      if (hasBulletPoints) {
        // Keep bullet point lists together as one message
        messages.push(paragraph);
      } else {
        // Split by sentences for non-list paragraphs
        const sentences = paragraph.match(/[^.!?]+[.!?]+[\s]*/g) || [paragraph];

        let currentMessage = '';
        let sentenceCount = 0;

        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();

          // If adding this sentence would make message too long or exceed 2 sentences
          if (sentenceCount >= 2 || (currentMessage && (currentMessage.length + trimmedSentence.length) > 300)) {
            // Push current message and start new one
            if (currentMessage) {
              messages.push(currentMessage.trim());
            }
            currentMessage = trimmedSentence;
            sentenceCount = 1;
          } else {
            // Add to current message
            currentMessage += (currentMessage ? ' ' : '') + trimmedSentence;
            sentenceCount++;
          }
        }

        // Push remaining message
        if (currentMessage) {
          messages.push(currentMessage.trim());
        }
      }
    }

    // If no messages were created (edge case), return original
    return messages.length > 0 ? messages : [response];
  }
}
