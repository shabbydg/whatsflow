import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export interface Persona {
  id: string;
  business_profile_id: string;
  name: string;
  description?: string;
  ai_instructions?: string;
  ai_model?: string;
  tone?: string;
  response_style?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class PersonaService {
  /**
   * Get all personas for a business profile
   */
  async getAllPersonas(businessProfileId: string): Promise<Persona[]> {
    try {
      const personas: any = await query(
        `SELECT
          p.*,
          COUNT(DISTINCT wc.id) as device_count
        FROM personas p
        LEFT JOIN whatsapp_connections wc ON p.id = wc.persona_id
        WHERE p.business_profile_id = ?
        GROUP BY p.id
        ORDER BY p.is_system DESC, p.created_at DESC`,
        [businessProfileId]
      );

      return Array.isArray(personas) ? personas : [];
    } catch (error: any) {
      logger.error('Error fetching personas:', error);
      throw new Error('Failed to fetch personas');
    }
  }

  /**
   * Get a single persona by ID
   */
  async getPersonaById(personaId: string, businessProfileId: string): Promise<Persona> {
    try {
      const personas: any = await query(
        'SELECT * FROM personas WHERE id = ? AND business_profile_id = ?',
        [personaId, businessProfileId]
      );

      if (!Array.isArray(personas) || personas.length === 0) {
        throw new Error('Persona not found');
      }

      return personas[0];
    } catch (error: any) {
      logger.error('Error fetching persona:', error);
      throw error;
    }
  }

  /**
   * Create a new custom persona
   */
  async createPersona(
    businessProfileId: string,
    data: {
      name: string;
      description?: string;
      ai_instructions?: string;
      ai_model?: string;
      tone?: string;
      response_style?: string;
      preferred_language?: string;
    }
  ): Promise<Persona> {
    try {
      const personaId = uuidv4();

      await query(
        `INSERT INTO personas (
          id, business_profile_id, name, description, ai_instructions,
          ai_model, tone, response_style, preferred_language, is_system, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`,
        [
          personaId,
          businessProfileId,
          data.name,
          data.description || null,
          data.ai_instructions || null,
          data.ai_model || 'gpt-4o-mini',
          data.tone || 'professional',
          data.response_style || 'concise',
          data.preferred_language || null,
        ]
      );

      logger.info(`Persona created: ${personaId} - ${data.name}`);

      return this.getPersonaById(personaId, businessProfileId);
    } catch (error: any) {
      logger.error('Error creating persona:', error);
      throw new Error('Failed to create persona');
    }
  }

  /**
   * Update a persona
   */
  async updatePersona(
    personaId: string,
    businessProfileId: string,
    data: {
      name?: string;
      description?: string;
      ai_instructions?: string;
      ai_model?: string;
      tone?: string;
      response_style?: string;
      preferred_language?: string;
      is_active?: boolean;
    }
  ): Promise<Persona> {
    try {
      // Check if persona exists and is not a system persona
      const existing = await this.getPersonaById(personaId, businessProfileId);

      if (existing.is_system) {
        throw new Error('Cannot modify system personas');
      }

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
      if (data.ai_instructions !== undefined) {
        updates.push('ai_instructions = ?');
        values.push(data.ai_instructions);
      }
      if (data.ai_model !== undefined) {
        updates.push('ai_model = ?');
        values.push(data.ai_model);
      }
      if (data.tone !== undefined) {
        updates.push('tone = ?');
        values.push(data.tone);
      }
      if (data.response_style !== undefined) {
        updates.push('response_style = ?');
        values.push(data.response_style);
      }
      if (data.preferred_language !== undefined) {
        updates.push('preferred_language = ?');
        values.push(data.preferred_language);
      }
      if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(data.is_active ? 1 : 0);
      }

      if (updates.length === 0) {
        return existing;
      }

      values.push(personaId, businessProfileId);

      await query(
        `UPDATE personas SET ${updates.join(', ')} WHERE id = ? AND business_profile_id = ?`,
        values
      );

      logger.info(`Persona updated: ${personaId}`);

      return this.getPersonaById(personaId, businessProfileId);
    } catch (error: any) {
      logger.error('Error updating persona:', error);
      throw error;
    }
  }

  /**
   * Delete a custom persona
   */
  async deletePersona(personaId: string, businessProfileId: string): Promise<void> {
    try {
      // Check if persona exists and is not a system persona
      const existing = await this.getPersonaById(personaId, businessProfileId);

      if (existing.is_system) {
        throw new Error('Cannot delete system personas');
      }

      // Check if any devices are using this persona
      const devices: any = await query(
        'SELECT COUNT(*) as count FROM whatsapp_connections WHERE persona_id = ?',
        [personaId]
      );

      if (Array.isArray(devices) && devices[0] && devices[0].count > 0) {
        throw new Error('Cannot delete persona that is assigned to devices');
      }

      await query(
        'DELETE FROM personas WHERE id = ? AND business_profile_id = ?',
        [personaId, businessProfileId]
      );

      logger.info(`Persona deleted: ${personaId}`);
    } catch (error: any) {
      logger.error('Error deleting persona:', error);
      throw error;
    }
  }

  /**
   * Get AI models list
   * Note: This will be replaced by dynamic model discovery from AI Manager
   */
  getAvailableAIModels() {
    // Import AI Manager dynamically to get available models
    return [
      { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (FREE)', provider: 'google' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'google' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'anthropic' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
      { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
    ];
  }
}
