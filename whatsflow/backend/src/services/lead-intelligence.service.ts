/**
 * Lead Intelligence Service
 * AI-powered lead generation, profiling, and scoring using FREE Gemini
 */

import { v4 as uuidv4 } from 'uuid';
import pool, { query } from '../config/database.js';
import { aiManager } from './ai/ai-manager.service.js';
import logger from '../utils/logger.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface LeadProfile {
  id?: string;
  contact_id: string;
  business_profile_id: string;
  company_name?: string | null;
  job_title?: string | null;
  industry?: string | null;
  team_size?: string | null;
  location?: string | null;
  email?: string | null;
  website?: string | null;
  pain_points?: string[];
  interests?: string[];
  intent_keywords?: string[];
  budget_range?: string | null;
  timeline?: string | null;
  decision_stage?: 'awareness' | 'consideration' | 'decision' | 'purchased';
  lead_score?: number;
  lead_temperature?: 'cold' | 'warm' | 'hot';
  conversation_summary?: string;
  next_best_action?: string;
  total_interactions?: number;
}

interface IntentAnalysis {
  intent_level: 'high' | 'medium' | 'low' | 'none';
  intent_keywords: string[];
  buying_signals: string[];
  next_action: string;
  confidence: number;
}

export class LeadIntelligenceService {
  /**
   * Generate or update lead profile from conversation history
   * Uses FREE Gemini 2.0 Flash
   */
  async generateLeadProfile(contactId: string, businessProfileId: string): Promise<LeadProfile> {
    try {
      // 1. Get conversation history
      const conversations = await this.getConversationHistory(contactId);

      if (conversations.length === 0) {
        logger.info(`No conversations found for contact ${contactId}`);
        return this.createEmptyLeadProfile(contactId, businessProfileId);
      }

      // 2. Build extraction prompt
      const prompt = `You are a lead intelligence analyst. Analyze this WhatsApp conversation and extract structured lead information.

Extract and return ONLY valid JSON with these fields (use null if information not found):
{
  "company_name": "extracted company name or null",
  "job_title": "extracted job title or null",
  "industry": "detected industry or null",
  "team_size": "team size mentioned (e.g., '10-50', '100+') or null",
  "location": "city, country, or region mentioned or null",
  "email": "email address mentioned or null",
  "website": "website URL mentioned or null",
  "pain_points": ["array of problems or challenges mentioned"],
  "interests": ["products, services, or features they're interested in"],
  "budget_signals": "any budget or pricing indicators mentioned or null",
  "timeline": "urgency/timeline mentioned (e.g., 'next month', 'urgent', 'Q2') or null",
  "decision_stage": "awareness|consideration|decision",
  "intent_keywords": ["high intent words found like 'buy', 'price', 'quote'"],
  "lead_temperature": "cold|warm|hot",
  "conversation_summary": "2-3 sentence summary of the conversation focusing on needs and status",
  "next_best_action": "suggested next step for sales team"
}

Decision stage rules:
- awareness: Just asking general questions, learning about the product
- consideration: Comparing options, asking about features/integration
- decision: Ready to buy, asking about pricing/contracts/next steps

Temperature rules:
- cold: Just browsing, no clear intent, vague questions
- warm: Showing interest, asking specific questions, engagement
- hot: Asking about pricing, ready to buy, urgency signals

Be conservative - only extract what's explicitly mentioned in the conversation.`;

      const conversationText = conversations
        .map((c) => {
          const role = c.role === 'user' ? 'Customer' : 'AI';
          const content = c.user_message || c.ai_response || '';
          return `${role}: ${content}`;
        })
        .join('\n');

      // 3. Extract with Gemini (FREE!)
      const extractedProfile = await aiManager.extractStructuredData(
        prompt,
        conversationText,
        { model: 'gemini-2.0-flash-exp' }
      );

      // 4. Calculate lead score
      const leadScore = await this.calculateLeadScore(
        extractedProfile,
        conversations.length,
        contactId
      );

      // 5. Determine temperature from score if not provided
      let temperature = extractedProfile.lead_temperature;
      if (!temperature || !['cold', 'warm', 'hot'].includes(temperature)) {
        temperature = leadScore >= 70 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold';
      }

      // 6. Get engagement metrics
      const engagementMetrics = await this.getEngagementMetrics(contactId);

      // 7. Prepare lead profile data
      const leadProfile: LeadProfile = {
        contact_id: contactId,
        business_profile_id: businessProfileId,
        company_name: extractedProfile.company_name || null,
        job_title: extractedProfile.job_title || null,
        industry: extractedProfile.industry || null,
        team_size: extractedProfile.team_size || null,
        location: extractedProfile.location || null,
        email: extractedProfile.email || null,
        website: extractedProfile.website || null,
        pain_points: Array.isArray(extractedProfile.pain_points) ? extractedProfile.pain_points : [],
        interests: Array.isArray(extractedProfile.interests) ? extractedProfile.interests : [],
        intent_keywords: Array.isArray(extractedProfile.intent_keywords) ? extractedProfile.intent_keywords : [],
        budget_range: extractedProfile.budget_signals || null,
        timeline: extractedProfile.timeline || null,
        decision_stage: extractedProfile.decision_stage || 'awareness',
        lead_score: leadScore,
        lead_temperature: temperature,
        conversation_summary: extractedProfile.conversation_summary || null,
        next_best_action: extractedProfile.next_best_action || null,
        total_interactions: conversations.length,
        ...engagementMetrics,
      };

      // 8. Save or update lead profile
      await this.saveLeadProfile(leadProfile);

      // 9. Log activity
      await this.logActivity(
        contactId,
        'profile_created',
        'AI generated lead profile from conversation analysis',
        { conversations_analyzed: conversations.length, score: leadScore }
      );

      logger.info(`Lead profile generated for contact ${contactId} with score ${leadScore}`);
      return leadProfile;
    } catch (error: any) {
      logger.error('Error generating lead profile:', error);
      throw error;
    }
  }

  /**
   * Detect buying intent from a single message
   * Real-time analysis as messages come in
   */
  async detectIntent(message: string, businessProfileId: string): Promise<IntentAnalysis> {
    try {
      // First, check against custom keywords
      const customKeywords = await this.getIntentKeywords(businessProfileId);
      const detectedKeywords = this.matchKeywords(message.toLowerCase(), customKeywords);

      const prompt = `Analyze this customer message for buying intent and return ONLY valid JSON:

{
  "intent_level": "high|medium|low|none",
  "intent_keywords": ["specific keywords that indicate intent"],
  "buying_signals": ["specific phrases showing readiness to buy"],
  "next_action": "suggested immediate next step",
  "confidence": 0.85
}

High intent: Asking about pricing, ready to buy, wants demo/trial, urgency
Medium intent: Comparing features, asking how-to, integration questions
Low intent: General questions, just learning, browsing
None: Unrelated or casual conversation`;

      const result = await aiManager.extractStructuredData(prompt, message, {
        model: 'gemini-2.0-flash-exp',
      });

      // Combine AI analysis with keyword matching
      const allKeywords = [
        ...(Array.isArray(result.intent_keywords) ? result.intent_keywords : []),
        ...detectedKeywords.map((k) => k.keyword),
      ];

      return {
        intent_level: result.intent_level || 'none',
        intent_keywords: [...new Set(allKeywords)], // Remove duplicates
        buying_signals: Array.isArray(result.buying_signals) ? result.buying_signals : [],
        next_action: result.next_action || '',
        confidence: result.confidence || 0.5,
      };
    } catch (error: any) {
      logger.error('Error detecting intent:', error);
      return {
        intent_level: 'none',
        intent_keywords: [],
        buying_signals: [],
        next_action: '',
        confidence: 0,
      };
    }
  }

  /**
   * Calculate lead score (0-100)
   */
  private async calculateLeadScore(
    profile: any,
    messageCount: number,
    contactId: string
  ): Promise<number> {
    let score = 0;

    // 1. Engagement Score (0-30 points)
    score += Math.min(messageCount * 3, 30);

    // 2. Intent Keywords Score (0-40 points)
    const highIntentKeywords = [
      'price',
      'pricing',
      'cost',
      'quote',
      'buy',
      'purchase',
      'demo',
      'trial',
      'contract',
      'payment',
      'invoice',
      'order',
    ];

    const keywords = (profile.intent_keywords || []).map((k: string) => k.toLowerCase());

    const highIntentCount = keywords.filter((k: string) =>
      highIntentKeywords.some((h) => k.includes(h))
    ).length;

    score += Math.min(highIntentCount * 10, 40);

    // 3. Profile Completeness (0-15 points)
    const fields = [
      profile.company_name,
      profile.job_title,
      profile.industry,
      profile.budget_signals,
      profile.timeline,
    ];
    const completeness = fields.filter((f) => f !== null && f !== undefined).length;
    score += completeness * 3;

    // 4. Decision Stage (0-10 points)
    if (profile.decision_stage === 'decision') score += 10;
    else if (profile.decision_stage === 'consideration') score += 5;

    // 5. Response Time Bonus (0-5 points)
    const avgResponseTime = await this.getAvgResponseTime(contactId);
    if (avgResponseTime && avgResponseTime < 300) score += 5; // < 5 min = very engaged
    else if (avgResponseTime && avgResponseTime < 3600) score += 3; // < 1 hour

    return Math.min(Math.round(score), 100);
  }

  /**
   * Update lead profile when new message arrives
   */
  async updateLeadFromMessage(
    contactId: string,
    businessProfileId: string,
    message: string,
    isUserMessage: boolean
  ): Promise<void> {
    if (!isUserMessage) return; // Only analyze customer messages

    try {
      // 1. Quick intent detection
      const intent = await this.detectIntent(message, businessProfileId);

      // 2. If high intent, trigger full profile regeneration
      if (intent.intent_level === 'high' && intent.confidence > 0.6) {
        logger.info(`High intent detected for contact ${contactId}, regenerating profile...`);
        await this.generateLeadProfile(contactId, businessProfileId);

        // Log high intent activity
        await this.logActivity(
          contactId,
          'intent_detected',
          `High buying intent detected: ${intent.buying_signals.join(', ')}`,
          { intent_level: 'high', keywords: intent.intent_keywords }
        );
      }

      // 3. Update interaction count and last interaction time
      await this.updateEngagementMetrics(contactId);
    } catch (error: any) {
      logger.error('Error updating lead from message:', error);
    }
  }

  /**
   * Get conversation history for a contact
   */
  private async getConversationHistory(contactId: string): Promise<any[]> {
    const result = await query(
      `SELECT 
        role, 
        user_message, 
        ai_response, 
        created_at
      FROM ai_conversations
      WHERE contact_id = ?
      ORDER BY created_at ASC
      LIMIT 100`,
      [contactId]
    );

    return Array.isArray(result) ? result : [];
  }

  /**
   * Get engagement metrics for a contact
   */
  private async getEngagementMetrics(contactId: string): Promise<any> {
    const result: any = await query(
      `SELECT 
        MIN(created_at) as first_interaction_at,
        MAX(created_at) as last_interaction_at
      FROM messages
      WHERE contact_id = ?`,
      [contactId]
    );

    if (Array.isArray(result) && result.length > 0) {
      return {
        first_interaction_at: result[0].first_interaction_at,
        last_interaction_at: result[0].last_interaction_at,
      };
    }

    return {
      first_interaction_at: null,
      last_interaction_at: null,
    };
  }

  /**
   * Get average response time for a contact
   */
  private async getAvgResponseTime(contactId: string): Promise<number | null> {
    const result: any = await query(
      `SELECT AVG(time_diff) as avg_response_time
       FROM (
         SELECT 
           TIMESTAMPDIFF(SECOND, 
             LAG(created_at) OVER (ORDER BY created_at),
             created_at
           ) as time_diff
         FROM messages
         WHERE contact_id = ? AND direction = 'inbound'
       ) as response_times
       WHERE time_diff IS NOT NULL`,
      [contactId]
    );

    if (Array.isArray(result) && result.length > 0 && result[0].avg_response_time) {
      return Math.round(result[0].avg_response_time);
    }

    return null;
  }

  /**
   * Update engagement metrics
   */
  private async updateEngagementMetrics(contactId: string): Promise<void> {
    const avgResponseTime = await this.getAvgResponseTime(contactId);

    await query(
      `UPDATE lead_profiles
      SET 
        total_interactions = total_interactions + 1,
        last_interaction_at = NOW(),
        avg_response_time = ?
      WHERE contact_id = ?`,
      [avgResponseTime, contactId]
    );
  }

  /**
   * Save or update lead profile
   */
  private async saveLeadProfile(profile: LeadProfile): Promise<void> {
    const leadId = uuidv4();

    // Check if lead profile exists
    const existing: any = await query(
      'SELECT id FROM lead_profiles WHERE contact_id = ?',
      [profile.contact_id]
    );

    const painPointsJson = JSON.stringify(profile.pain_points || []);
    const interestsJson = JSON.stringify(profile.interests || []);
    const intentKeywordsJson = JSON.stringify(profile.intent_keywords || []);

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing
      await query(
        `UPDATE lead_profiles SET
          company_name = ?,
          job_title = ?,
          industry = ?,
          team_size = ?,
          location = ?,
          email = ?,
          website = ?,
          pain_points = ?,
          interests = ?,
          intent_keywords = ?,
          budget_range = ?,
          timeline = ?,
          decision_stage = ?,
          lead_score = ?,
          lead_temperature = ?,
          conversation_summary = ?,
          next_best_action = ?,
          total_interactions = ?,
          first_interaction_at = ?,
          last_interaction_at = ?,
          avg_response_time = ?,
          updated_at = NOW()
        WHERE contact_id = ?`,
        [
          profile.company_name || null,
          profile.job_title || null,
          profile.industry || null,
          profile.team_size || null,
          profile.location || null,
          profile.email || null,
          profile.website || null,
          painPointsJson,
          interestsJson,
          intentKeywordsJson,
          profile.budget_range || null,
          profile.timeline || null,
          profile.decision_stage,
          profile.lead_score,
          profile.lead_temperature,
          profile.conversation_summary || null,
          profile.next_best_action || null,
          profile.total_interactions || 0,
          profile.first_interaction_at || null,
          profile.last_interaction_at || null,
          profile.avg_response_time || null,
          profile.contact_id,
        ]
      );

      // Update contact with lead_profile_id
      await query('UPDATE contacts SET lead_profile_id = ? WHERE id = ?', [
        existing[0].id,
        profile.contact_id,
      ]);
    } else {
      // Insert new
      await query(
        `INSERT INTO lead_profiles (
          id, contact_id, business_profile_id,
          company_name, job_title, industry, team_size, location, email, website,
          pain_points, interests, intent_keywords,
          budget_range, timeline, decision_stage,
          lead_score, lead_temperature,
          conversation_summary, next_best_action,
          total_interactions, first_interaction_at, last_interaction_at, avg_response_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leadId,
          profile.contact_id,
          profile.business_profile_id,
          profile.company_name || null,
          profile.job_title || null,
          profile.industry || null,
          profile.team_size || null,
          profile.location || null,
          profile.email || null,
          profile.website || null,
          painPointsJson,
          interestsJson,
          intentKeywordsJson,
          profile.budget_range || null,
          profile.timeline || null,
          profile.decision_stage,
          profile.lead_score,
          profile.lead_temperature,
          profile.conversation_summary || null,
          profile.next_best_action || null,
          profile.total_interactions || 0,
          profile.first_interaction_at || null,
          profile.last_interaction_at || null,
          profile.avg_response_time || null,
        ]
      );

      // Update contact with lead_profile_id
      await query('UPDATE contacts SET lead_profile_id = ? WHERE id = ?', [
        leadId,
        profile.contact_id,
      ]);
    }
  }

  /**
   * Create empty lead profile
   */
  private createEmptyLeadProfile(
    contactId: string,
    businessProfileId: string
  ): LeadProfile {
    return {
      contact_id: contactId,
      business_profile_id: businessProfileId,
      lead_score: 0,
      lead_temperature: 'cold',
      decision_stage: 'awareness',
      pain_points: [],
      interests: [],
      intent_keywords: [],
      total_interactions: 0,
    };
  }

  /**
   * Get intent keywords for business
   */
  private async getIntentKeywords(businessProfileId: string): Promise<any[]> {
    const result = await query(
      'SELECT keyword, category, score_value FROM intent_keywords WHERE business_profile_id = ? AND is_active = true',
      [businessProfileId]
    );

    return Array.isArray(result) ? result : [];
  }

  /**
   * Match keywords in message
   */
  private matchKeywords(message: string, keywords: any[]): any[] {
    return keywords.filter((k) => message.includes(k.keyword.toLowerCase()));
  }

  /**
   * Log lead activity
   */
  async logActivity(
    contactId: string,
    activityType: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    try {
      // Get lead profile id
      const leadProfile: any = await query(
        'SELECT id FROM lead_profiles WHERE contact_id = ?',
        [contactId]
      );

      if (!Array.isArray(leadProfile) || leadProfile.length === 0) {
        return; // No lead profile yet
      }

      const activityId = uuidv4();
      await query(
        `INSERT INTO lead_activities (
          id, lead_profile_id, activity_type, description, metadata
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          activityId,
          leadProfile[0].id,
          activityType,
          description,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );
    } catch (error: any) {
      logger.error('Error logging lead activity:', error);
    }
  }

  /**
   * Get all leads for a business with filters
   */
  async getLeads(
    businessProfileId: string,
    filters?: {
      temperature?: 'hot' | 'warm' | 'cold';
      status?: string;
      minScore?: number;
    }
  ): Promise<any[]> {
    let sql = `
      SELECT * FROM lead_dashboard
      WHERE business_profile_id = ?
    `;
    const params: any[] = [businessProfileId];

    if (filters?.temperature) {
      sql += ' AND lead_temperature = ?';
      params.push(filters.temperature);
    }

    if (filters?.status) {
      sql += ' AND lead_status = ?';
      params.push(filters.status);
    }

    if (filters?.minScore) {
      sql += ' AND lead_score >= ?';
      params.push(filters.minScore);
    }

    sql += ' ORDER BY lead_score DESC, updated_at DESC';

    const result = await query(sql, params);
    return Array.isArray(result) ? result : [];
  }

  /**
   * Get lead by ID with full details
   */
  async getLeadById(leadId: string, businessProfileId: string): Promise<any> {
    const result: any = await query(
      'SELECT * FROM lead_dashboard WHERE id = ? AND business_profile_id = ?',
      [leadId, businessProfileId]
    );

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Lead not found');
    }

    // Parse JSON fields
    const lead = result[0];
    if (lead.pain_points) lead.pain_points = JSON.parse(lead.pain_points);
    if (lead.interests) lead.interests = JSON.parse(lead.interests);
    if (lead.intent_keywords) lead.intent_keywords = JSON.parse(lead.intent_keywords);

    // Get activities
    const activities = await query(
      'SELECT * FROM lead_activities WHERE lead_profile_id = ? ORDER BY created_at DESC LIMIT 50',
      [leadId]
    );

    lead.activities = Array.isArray(activities) ? activities : [];

    return lead;
  }

  /**
   * Get lead statistics for dashboard
   */
  async getLeadStats(businessProfileId: string): Promise<any> {
    const result: any = await query(
      `SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN lead_temperature = 'hot' THEN 1 ELSE 0 END) as hot_leads,
        SUM(CASE WHEN lead_temperature = 'warm' THEN 1 ELSE 0 END) as warm_leads,
        SUM(CASE WHEN lead_temperature = 'cold' THEN 1 ELSE 0 END) as cold_leads,
        AVG(lead_score) as avg_score,
        SUM(CASE WHEN decision_stage = 'decision' THEN 1 ELSE 0 END) as decision_ready,
        SUM(CASE WHEN lead_status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads
      FROM lead_profiles
      WHERE business_profile_id = ?`,
      [businessProfileId]
    );

    return Array.isArray(result) && result.length > 0
      ? result[0]
      : {
          total_leads: 0,
          hot_leads: 0,
          warm_leads: 0,
          cold_leads: 0,
          avg_score: 0,
          decision_ready: 0,
          qualified_leads: 0,
        };
  }

  /**
   * Update lead profile with manual edits
   */
  async updateLeadProfile(
    leadId: string,
    businessProfileId: string,
    updates: {
      // Contact Information
      contact_name?: string;
      phone_number?: string;
      email?: string;
      
      // Company Information
      company_name?: string;
      job_title?: string;
      industry?: string;
      team_size?: string;
      website?: string;
      location?: string;
      
      // Address Information
      street_address?: string;
      city?: string;
      state_province?: string;
      postal_code?: string;
      country?: string;
    }
  ): Promise<any> {
    try {
      // Verify lead belongs to business
      const leadCheck: any = await query(
        'SELECT contact_id FROM lead_profiles WHERE id = ? AND business_profile_id = ?',
        [leadId, businessProfileId]
      );

      if (!Array.isArray(leadCheck) || leadCheck.length === 0) {
        throw new Error('Lead not found or access denied');
      }

      const contactId = leadCheck[0].contact_id;

      // Update contact table (name, phone)
      if (updates.contact_name || updates.phone_number) {
        const contactUpdates: string[] = [];
        const contactValues: any[] = [];

        if (updates.contact_name) {
          contactUpdates.push('name = ?');
          contactValues.push(updates.contact_name);
        }
        if (updates.phone_number) {
          contactUpdates.push('phone_number = ?');
          contactValues.push(updates.phone_number);
        }

        if (contactUpdates.length > 0) {
          contactValues.push(contactId);
          await query(
            `UPDATE contacts SET ${contactUpdates.join(', ')} WHERE id = ?`,
            contactValues
          );
        }
      }

      // Update lead_profiles table (all other fields)
      const profileUpdates: string[] = [];
      const profileValues: any[] = [];

      const profileFields = [
        'email',
        'company_name',
        'job_title',
        'industry',
        'team_size',
        'website',
        'location',
        'street_address',
        'city',
        'state_province',
        'postal_code',
        'country',
      ];

      profileFields.forEach((field) => {
        if (updates[field as keyof typeof updates] !== undefined) {
          profileUpdates.push(`${field} = ?`);
          profileValues.push(updates[field as keyof typeof updates] || null);
        }
      });

      if (profileUpdates.length > 0) {
        profileValues.push(leadId);
        await query(
          `UPDATE lead_profiles SET ${profileUpdates.join(', ')} WHERE id = ?`,
          profileValues
        );
      }

      // Log activity
      const changedFields = Object.keys(updates).filter(
        (key) => updates[key as keyof typeof updates] !== undefined
      );
      await this.logActivity(
        leadId,
        'profile_updated',
        `Profile updated: ${changedFields.join(', ')}`,
        { fields: changedFields }
      );

      // Return updated lead
      return await this.getLeadById(leadId, businessProfileId);
    } catch (error: any) {
      logger.error('Error updating lead profile:', error);
      throw error;
    }
  }
}

export const leadIntelligenceService = new LeadIntelligenceService();

