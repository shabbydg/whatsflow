import { Request, Response } from 'express';
import { leadIntelligenceService } from '../services/lead-intelligence.service.js';
import logger from '../utils/logger.js';

export class LeadController {
  /**
   * Get all leads for a business with optional filters
   */
  async getLeads(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { temperature, status, minScore } = req.query;

      const filters: any = {};
      if (temperature) filters.temperature = temperature;
      if (status) filters.status = status;
      if (minScore) filters.minScore = parseInt(minScore as string);

      const leads = await leadIntelligenceService.getLeads(businessProfileId, filters);

      res.json({ success: true, leads });
    } catch (error: any) {
      logger.error('Error getting leads:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get lead statistics for dashboard
   */
  async getLeadStats(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const stats = await leadIntelligenceService.getLeadStats(businessProfileId);

      res.json({ success: true, stats });
    } catch (error: any) {
      logger.error('Error getting lead stats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get single lead by ID with full details
   */
  async getLeadById(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { id } = req.params;

      const lead = await leadIntelligenceService.getLeadById(id, businessProfileId);

      res.json({ success: true, lead });
    } catch (error: any) {
      logger.error('Error getting lead:', error);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  /**
   * Generate/regenerate lead profile from conversations
   */
  async generateLeadProfile(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { contactId } = req.body;

      if (!contactId) {
        return res.status(400).json({ success: false, message: 'Contact ID is required' });
      }

      const profile = await leadIntelligenceService.generateLeadProfile(
        contactId,
        businessProfileId
      );

      res.json({ success: true, profile });
    } catch (error: any) {
      logger.error('Error generating lead profile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Detect intent from a message
   */
  async detectIntent(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      const intent = await leadIntelligenceService.detectIntent(message, businessProfileId);

      res.json({ success: true, intent });
    } catch (error: any) {
      logger.error('Error detecting intent:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { id } = req.params;
      const { status, notes } = req.body;

      // Import query from database
      const { query } = await import('../config/database.js');

      // Verify lead belongs to business
      const leadCheck: any = await query(
        'SELECT id FROM lead_profiles WHERE id = ? AND business_profile_id = ?',
        [id, businessProfileId]
      );

      if (!Array.isArray(leadCheck) || leadCheck.length === 0) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }

      // Update status
      await query('UPDATE lead_profiles SET lead_status = ? WHERE id = ?', [status, id]);

      // Log activity
      await leadIntelligenceService.logActivity(
        id,
        'status_changed',
        `Lead status changed to ${status}`,
        { new_status: status, notes }
      );

      res.json({ success: true, message: 'Lead status updated' });
    } catch (error: any) {
      logger.error('Error updating lead status:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Add note to lead
   */
  async addNote(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { id } = req.params;
      const { note } = req.body;

      if (!note) {
        return res.status(400).json({ success: false, message: 'Note is required' });
      }

      // Import query from database
      const { query } = await import('../config/database.js');

      // Verify lead belongs to business
      const leadCheck: any = await query(
        'SELECT contact_id FROM lead_profiles WHERE id = ? AND business_profile_id = ?',
        [id, businessProfileId]
      );

      if (!Array.isArray(leadCheck) || leadCheck.length === 0) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }

      // Log note as activity
      await leadIntelligenceService.logActivity(
        leadCheck[0].contact_id,
        'note_added',
        note,
        { user_id: (req as any).user.id }
      );

      res.json({ success: true, message: 'Note added successfully' });
    } catch (error: any) {
      logger.error('Error adding note:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Qualify/disqualify a lead
   */
  async qualifyLead(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { id } = req.params;
      const { qualified, notes } = req.body;

      // Import query from database
      const { query } = await import('../config/database.js');

      // Verify lead belongs to business
      const leadCheck: any = await query(
        'SELECT contact_id FROM lead_profiles WHERE id = ? AND business_profile_id = ?',
        [id, businessProfileId]
      );

      if (!Array.isArray(leadCheck) || leadCheck.length === 0) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }

      // Update qualification
      await query(
        'UPDATE lead_profiles SET is_qualified = ?, qualification_notes = ? WHERE id = ?',
        [qualified, notes || null, id]
      );

      // Log activity
      await leadIntelligenceService.logActivity(
        leadCheck[0].contact_id,
        qualified ? 'qualified' : 'disqualified',
        qualified ? 'Lead marked as qualified' : 'Lead marked as disqualified',
        { notes }
      );

      res.json({ success: true, message: `Lead ${qualified ? 'qualified' : 'disqualified'}` });
    } catch (error: any) {
      logger.error('Error qualifying lead:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get lead activities/timeline
   */
  async getLeadActivities(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { id } = req.params;

      // Import query from database
      const { query } = await import('../config/database.js');

      // Verify lead belongs to business
      const leadCheck: any = await query(
        'SELECT id FROM lead_profiles WHERE id = ? AND business_profile_id = ?',
        [id, businessProfileId]
      );

      if (!Array.isArray(leadCheck) || leadCheck.length === 0) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }

      const activities: any = await query(
        'SELECT * FROM lead_activities WHERE lead_profile_id = ? ORDER BY created_at DESC LIMIT 100',
        [id]
      );

      res.json({ success: true, activities: Array.isArray(activities) ? activities : [] });
    } catch (error: any) {
      logger.error('Error getting lead activities:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update lead profile details
   */
  async updateLeadProfile(req: Request, res: Response) {
    try {
      const businessProfileId = (req as any).user.businessProfileId;
      const { id } = req.params;
      const updates = req.body;

      const updatedLead = await leadIntelligenceService.updateLeadProfile(
        id,
        businessProfileId,
        updates
      );

      res.json({ success: true, lead: updatedLead });
    } catch (error: any) {
      logger.error('Error updating lead profile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

