/**
 * Broadcast Routes
 * API endpoints for managing broadcast campaigns
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { broadcastService } from '../services/broadcast.service.js';
import pool from '../config/database.js';
import { RowDataPacket } from 'mysql2';
import logger from '../utils/logger.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/broadcasts/guidelines
 * Get safety guidelines
 */
router.get('/guidelines', async (req: AuthRequest, res: Response) => {
  try {
    const guidelines = {
      title: 'WhatsApp Broadcast Guidelines',
      sections: [
        {
          title: 'Rate Limiting',
          items: [
            'Slow: 30 seconds between messages (120 messages/hour)',
            'Normal: 20 seconds between messages (180 messages/hour)',
            'Fast: 10 seconds between messages (360 messages/hour)',
            'Custom: Set your own delay',
            'Maximum 1000 recipients per broadcast',
          ],
        },
        {
          title: 'Content Guidelines',
          items: [
            'Only send messages to contacts who have opted in',
            'Do not send spam or unsolicited messages',
            'Include your business name and contact information',
            'Provide a clear way for recipients to opt-out',
            'Do not send misleading or deceptive content',
          ],
        },
        {
          title: 'Best Practices',
          items: [
            'Test your message with a small group first',
            'Personalize messages when possible',
            'Send messages during appropriate hours',
            'Monitor delivery rates and adjust accordingly',
            'Honor opt-out requests immediately',
          ],
        },
        {
          title: 'Consequences',
          items: [
            'Violating WhatsApp Business ToS may result in account suspension',
            'Your phone number may be blocked by WhatsApp',
            'Recipients may report your messages as spam',
            'Use this feature responsibly',
          ],
        },
      ],
    };

    res.json({
      success: true,
      data: guidelines,
    });
  } catch (error: any) {
    logger.error('Error fetching guidelines:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch guidelines',
    });
  }
});

/**
 * POST /api/v1/broadcasts/acknowledge-guidelines
 * Mark guidelines as acknowledged
 */
router.post('/acknowledge-guidelines', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already acknowledged
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM user_broadcast_preferences WHERE user_id = ?',
      [userId]
    );

    if (existingRows.length > 0) {
      // Update existing record
      await pool.query(
        'UPDATE user_broadcast_preferences SET guidelines_acknowledged = TRUE, acknowledged_at = NOW() WHERE user_id = ?',
        [userId]
      );
    } else {
      // Create new record
      const { v4: uuidv4 } = await import('uuid');
      await pool.query(
        'INSERT INTO user_broadcast_preferences (id, user_id, guidelines_acknowledged, acknowledged_at) VALUES (?, ?, TRUE, NOW())',
        [uuidv4(), userId]
      );
    }

    res.json({
      success: true,
      message: 'Guidelines acknowledged',
    });
  } catch (error: any) {
    logger.error('Error acknowledging guidelines:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge guidelines',
    });
  }
});

/**
 * GET /api/v1/broadcasts/guidelines-status
 * Check if user has acknowledged guidelines
 */
router.get('/guidelines-status', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User not found',
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT guidelines_acknowledged, acknowledged_at FROM user_broadcast_preferences WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        acknowledged: rows.length > 0 && rows[0].guidelines_acknowledged,
        acknowledged_at: rows.length > 0 ? rows[0].acknowledged_at : null,
      },
    });
  } catch (error: any) {
    logger.error('Error checking guidelines status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check guidelines status',
    });
  }
});

/**
 * GET /api/v1/broadcasts
 * Get all broadcasts
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }
    const { status, page, limit } = req.query;

    const result = await broadcastService.getAllBroadcasts(businessProfileId, {
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.broadcasts,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching broadcasts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch broadcasts',
    });
  }
});

/**
 * GET /api/v1/broadcasts/:id
 * Get a specific broadcast
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const broadcast = await broadcastService.getBroadcastById(id, businessProfileId);

    res.json({
      success: true,
      data: broadcast,
    });
  } catch (error: any) {
    logger.error('Error fetching broadcast:', error);
    res.status(error.message === 'Broadcast not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch broadcast',
    });
  }
});

/**
 * POST /api/v1/broadcasts
 * Create a new broadcast
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }
    const {
      name,
      device_id,
      message_content,
      message_type,
      media_url,
      send_speed,
      custom_delay,
      scheduled_at,
      contact_list_ids,
    } = req.body;

    // Validate required fields
    if (!name || !device_id || !message_content || !contact_list_ids || contact_list_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name, device_id, message_content, and at least one contact_list_id are required',
      });
    }

    const broadcast = await broadcastService.createBroadcast(businessProfileId, {
      name,
      device_id,
      message_content,
      message_type,
      media_url,
      send_speed,
      custom_delay,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
      contact_list_ids,
    });

    res.status(201).json({
      success: true,
      data: broadcast,
    });
  } catch (error: any) {
    logger.error('Error creating broadcast:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create broadcast',
    });
  }
});

/**
 * PUT /api/v1/broadcasts/:id
 * Update a broadcast (draft only)
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }
    const {
      name,
      message_content,
      message_type,
      media_url,
      send_speed,
      custom_delay,
      scheduled_at,
    } = req.body;

    const broadcast = await broadcastService.updateBroadcast(id, businessProfileId, {
      name,
      message_content,
      message_type,
      media_url,
      send_speed,
      custom_delay,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
    });

    res.json({
      success: true,
      data: broadcast,
    });
  } catch (error: any) {
    logger.error('Error updating broadcast:', error);
    res.status(error.message === 'Broadcast not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to update broadcast',
    });
  }
});

/**
 * DELETE /api/v1/broadcasts/:id
 * Delete a broadcast
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    await broadcastService.deleteBroadcast(id, businessProfileId);

    res.json({
      success: true,
      message: 'Broadcast deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting broadcast:', error);
    res.status(error.message === 'Broadcast not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to delete broadcast',
    });
  }
});

/**
 * POST /api/v1/broadcasts/:id/send
 * Start sending a broadcast
 */
router.post('/:id/send', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    await broadcastService.startBroadcast(id, businessProfileId);

    res.json({
      success: true,
      message: 'Broadcast started successfully',
    });
  } catch (error: any) {
    logger.error('Error starting broadcast:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start broadcast',
    });
  }
});

/**
 * POST /api/v1/broadcasts/:id/cancel
 * Cancel a broadcast
 */
router.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    await broadcastService.cancelBroadcast(id, businessProfileId);

    res.json({
      success: true,
      message: 'Broadcast cancelled successfully',
    });
  } catch (error: any) {
    logger.error('Error cancelling broadcast:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel broadcast',
    });
  }
});

/**
 * GET /api/v1/broadcasts/:id/progress
 * Get broadcast progress/stats
 */
router.get('/:id/progress', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const stats = await broadcastService.getBroadcastStats(id, businessProfileId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error fetching broadcast progress:', error);
    res.status(error.message === 'Broadcast not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch broadcast progress',
    });
  }
});

/**
 * GET /api/v1/broadcasts/:id/recipients
 * Get broadcast recipients
 */
router.get('/:id/recipients', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }
    const { status, page, limit } = req.query;

    const result = await broadcastService.getRecipients(id, businessProfileId, {
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.recipients,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching broadcast recipients:', error);
    res.status(error.message === 'Broadcast not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch broadcast recipients',
    });
  }
});

export default router;
