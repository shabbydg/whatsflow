/**
 * Contact List Routes
 * API endpoints for managing contact lists
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { contactListService } from '../services/contact-list.service.js';
import logger from '../utils/logger.js';
import multer from 'multer';
import { promises as fs } from 'fs';

const router = Router();

// Configure multer for CSV uploads
const upload = multer({
  dest: 'uploads/csv/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/contact-lists
 * Get all contact lists for the authenticated user's business
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

    const lists = await contactListService.getAllLists(businessProfileId);

    res.json({
      success: true,
      data: lists,
    });
  } catch (error: any) {
    logger.error('Error fetching contact lists:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch contact lists',
    });
  }
});

/**
 * GET /api/v1/contact-lists/:id
 * Get a specific contact list
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

    const list = await contactListService.getListById(id, businessProfileId);

    res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    logger.error('Error fetching contact list:', error);
    res.status(error.message === 'Contact list not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch contact list',
    });
  }
});

/**
 * POST /api/v1/contact-lists
 * Create a new contact list
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const { name, description } = req.body;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'List name is required',
      });
    }

    const list = await contactListService.createList(businessProfileId, {
      name,
      description,
    });

    res.status(201).json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    logger.error('Error creating contact list:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create contact list',
    });
  }
});

/**
 * PUT /api/v1/contact-lists/:id
 * Update a contact list
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
    const { name, description } = req.body;

    const list = await contactListService.updateList(id, businessProfileId, {
      name,
      description,
    });

    res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    logger.error('Error updating contact list:', error);
    res.status(error.message === 'Contact list not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to update contact list',
    });
  }
});

/**
 * DELETE /api/v1/contact-lists/:id
 * Delete a contact list
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

    await contactListService.deleteList(id, businessProfileId);

    res.json({
      success: true,
      message: 'Contact list deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting contact list:', error);
    res.status(error.message === 'Contact list not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to delete contact list',
    });
  }
});

/**
 * GET /api/v1/contact-lists/:id/members
 * Get members of a contact list
 */
router.get('/:id/members', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }
    const { page, limit, excludeOptedOut } = req.query;

    const result = await contactListService.getListMembers(id, businessProfileId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      excludeOptedOut: excludeOptedOut === 'true',
    });

    res.json({
      success: true,
      data: result.members,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching list members:', error);
    res.status(error.message === 'Contact list not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch list members',
    });
  }
});

/**
 * POST /api/v1/contact-lists/:id/members
 * Add a contact to a list
 */
router.post('/:id/members', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }
    const { phone_number, full_name, contact_id, custom_fields } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const member = await contactListService.addContactToList(id, businessProfileId, {
      phone_number,
      full_name,
      contact_id,
      custom_fields,
    });

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    logger.error('Error adding contact to list:', error);
    res.status(error.message === 'Contact list not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to add contact to list',
    });
  }
});

/**
 * DELETE /api/v1/contact-lists/:id/members/:memberId
 * Remove a contact from a list
 */
router.delete('/:id/members/:memberId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    await contactListService.removeContactFromList(id, memberId, businessProfileId);

    res.json({
      success: true,
      message: 'Contact removed from list successfully',
    });
  } catch (error: any) {
    logger.error('Error removing contact from list:', error);
    res.status(error.message === 'Contact list not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to remove contact from list',
    });
  }
});

/**
 * POST /api/v1/contact-lists/:id/import
 * Import contacts from CSV file
 */
router.post('/:id/import', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required',
      });
    }

    // Read CSV file
    const csvContent = await fs.readFile(req.file.path, 'utf-8');

    // Parse CSV
    const contacts = contactListService.parseCsvData(csvContent);

    // Import contacts
    const result = await contactListService.addMultipleContacts(id, businessProfileId, contacts);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      data: {
        added: result.added,
        errors: result.errors,
        total: contacts.length,
      },
    });
  } catch (error: any) {
    logger.error('Error importing contacts:', error);

    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to import contacts',
    });
  }
});

/**
 * POST /api/v1/contact-lists/:id/members/:memberId/opt-out
 * Mark a contact as opted out
 */
router.post('/:id/members/:memberId/opt-out', async (req: AuthRequest, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    // Verify list access
    await contactListService.getListById(id, businessProfileId);

    // Mark as opted out
    await contactListService.markOptedOut(memberId, true);

    res.json({
      success: true,
      message: 'Contact marked as opted out',
    });
  } catch (error: any) {
    logger.error('Error marking contact as opted out:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark contact as opted out',
    });
  }
});

/**
 * POST /api/v1/contact-lists/:id/members/:memberId/opt-in
 * Mark a contact as opted in
 */
router.post('/:id/members/:memberId/opt-in', async (req: AuthRequest, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    // Verify list access
    await contactListService.getListById(id, businessProfileId);

    // Mark as opted in
    await contactListService.markOptedOut(memberId, false);

    res.json({
      success: true,
      message: 'Contact marked as opted in',
    });
  } catch (error: any) {
    logger.error('Error marking contact as opted in:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark contact as opted in',
    });
  }
});

export default router;
