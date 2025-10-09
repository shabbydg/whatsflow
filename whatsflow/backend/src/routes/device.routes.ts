import { Router } from 'express';
import { DeviceService } from '../services/device.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { body, validationResult } from 'express-validator';

const router = Router();
const deviceService = new DeviceService();

/**
 * GET /api/v1/devices
 * Get all devices for the authenticated business
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    const devices = await deviceService.getAllDevices(businessProfileId);

    res.json({
      success: true,
      data: devices,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/devices/:id
 * Get a specific device
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const deviceId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    const device = await deviceService.getDeviceById(deviceId, businessProfileId);

    res.json({
      success: true,
      data: device,
    });
  } catch (error: any) {
    if (error.message === 'Device not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/devices
 * Create a new device (initiate WhatsApp connection)
 */
router.post(
  '/',
  authenticate,
  [
    body('device_name').trim().notEmpty().withMessage('Device name is required'),
    body('phone_number').trim().notEmpty().withMessage('Phone number is required'),
    body('persona_id').optional().trim(),
    body('auto_reply_enabled').optional().isBoolean(),
    body('working_hours_start').optional().trim(),
    body('working_hours_end').optional().trim(),
    body('working_days').optional().trim(),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const businessProfileId = req.user?.businessProfileId;

      if (!businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const device = await deviceService.createDevice(businessProfileId, req.body);

      res.status(201).json({
        success: true,
        data: device,
        message: 'Device created. Scan the QR code to connect.',
      });
    } catch (error: any) {
      if (error.message === 'Phone number already connected to another device') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * PUT /api/v1/devices/:id
 * Update device settings
 */
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const deviceId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    const device = await deviceService.updateDevice(
      deviceId,
      businessProfileId,
      req.body
    );

    res.json({
      success: true,
      data: device,
    });
  } catch (error: any) {
    if (error.message === 'Device not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/devices/:id
 * Delete a device
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const deviceId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    await deviceService.deleteDevice(deviceId, businessProfileId);

    res.json({
      success: true,
      message: 'Device deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Device not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Cannot delete the last device')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/devices/:id/stats
 * Get device statistics
 */
router.get('/:id/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const deviceId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    const stats = await deviceService.getDeviceStats(deviceId, businessProfileId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    if (error.message === 'Device not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/devices/:id/reconnect
 * Reconnect a device (regenerate QR code)
 */
router.post('/:id/reconnect', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const deviceId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    await deviceService.reconnectDevice(deviceId, businessProfileId);

    res.json({
      success: true,
      message: 'Device reconnection initiated. Scan the QR code to connect.',
    });
  } catch (error: any) {
    if (error.message === 'Device not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
