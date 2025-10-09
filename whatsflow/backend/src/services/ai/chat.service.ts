/**
 * AI Chat Service
 * Handles chat responses with context and conversation history
 */

import pool from '../../config/database.js';
import { aiManager } from './ai-manager.service.js';
import { AIMessage } from './base.service.js';
import logger from '../../utils/logger.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { isWithinSchedule } from '../../utils/time-utils.js';
import { v4 as uuidv4 } from 'uuid';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export class AIChatService {
  /**
   * Check if AI should respond based on device settings
   */
  async shouldAIRespond(deviceId: string): Promise<boolean> {
    try {
      const [devices] = await pool.query<RowDataPacket[]>(
        'SELECT ai_enabled, ai_schedule FROM whatsapp_connections WHERE id = ?',
        [deviceId]
      );

      if (!devices || devices.length === 0) {
        return false;
      }

      const device = devices[0];

      // Check if AI is enabled for this device
      if (!device.ai_enabled) {
        return false;
      }

      // Parse AI schedule (stored as JSON string)
      let schedule: { from: string; to: string }[] | undefined;
      if (device.ai_schedule) {
        try {
          schedule = typeof device.ai_schedule === 'string'
            ? JSON.parse(device.ai_schedule)
            : device.ai_schedule;
        } catch (e) {
          logger.warn(`Failed to parse AI schedule for device ${deviceId}`);
        }
      }

      // Check if current time is within schedule
      return isWithinSchedule(schedule);
    } catch (error) {
      logger.error('Error checking AI schedule:', error);
      return false;
    }
  }

  /**
   * Generate AI response for a contact message
   */
  async generateResponse(
    businessProfileId: string,
    contactId: string,
    messageContent: string,
    personaId?: string,
    deviceId?: string,
    messageId?: string
  ): Promise<{ response: string; tokensUsed: { input: number; output: number } }> {
    try {
      // Get persona instructions
      const persona = await this.getPersona(personaId, businessProfileId);
      if (!persona) {
        throw new Error('Persona not found');
      }

      // Get conversation history
      const history = await this.getConversationHistory(contactId, 10);

      // Get business context
      const businessContext = await this.getBusinessContext(businessProfileId);

      // Build messages for AI
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(persona, businessContext),
        },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: messageContent,
        },
      ];

      // Generate response
      const aiResponse = await aiManager.generateChatResponse(messages, {
        model: persona.ai_model || undefined,
        temperature: 0.7,
        maxTokens: 500,
      });

      // Store conversation
      await this.storeConversation(
        businessProfileId,
        contactId,
        personaId || null,
        messageContent,
        aiResponse.content,
        aiResponse.tokensUsed.input,
        aiResponse.tokensUsed.output,
        aiResponse.model,
        deviceId,
        messageId
      );

      return {
        response: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
      };
    } catch (error: any) {
      logger.error('AI chat error:', error);
      throw error;
    }
  }

  /**
   * Get persona with instructions
   */
  private async getPersona(
    personaId: string | undefined,
    businessProfileId: string
  ): Promise<any> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM personas
       WHERE id = ? OR (business_profile_id = ? AND is_active = 1)
       LIMIT 1`,
      [personaId || '', businessProfileId]
    );

    return rows[0] || null;
  }

  /**
   * Get recent conversation history
   */
  private async getConversationHistory(
    contactId: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT direction, content, created_at
       FROM messages
       WHERE contact_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [contactId, limit]
    );

    return rows
      .reverse()
      .map((row) => ({
        role: row.direction === 'inbound' ? 'user' : 'assistant',
        content: row.content,
        created_at: row.created_at,
      }))
      .filter((msg) => msg.content && msg.content.trim().length > 0);
  }

  /**
   * Get business context for AI
   */
  private async getBusinessContext(businessProfileId: string): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT business_name, industry, description, website, ai_knowledge_base
       FROM business_profiles
       WHERE id = ?`,
      [businessProfileId]
    );

    if (rows.length === 0) return '';

    const profile = rows[0];
    let context = '';

    if (profile.business_name) {
      context += `Business: ${profile.business_name}\n`;
    }

    if (profile.industry) {
      context += `Industry: ${profile.industry}\n`;
    }

    if (profile.description) {
      context += `Description: ${profile.description}\n`;
    }

    if (profile.website) {
      context += `Website: ${profile.website}\n`;
    }

    if (profile.ai_knowledge_base) {
      context += `\nKnowledge Base:\n${profile.ai_knowledge_base}\n`;
    }

    return context;
  }

  /**
   * Build system prompt with persona and business context
   */
  private buildSystemPrompt(persona: any, businessContext: string): string {
    let prompt = '';

    if (persona.ai_instructions) {
      prompt += persona.ai_instructions + '\n\n';
    }

    if (businessContext) {
      prompt += `Business Information:\n${businessContext}\n\n`;
    }

    // Add multilingual support
    const languageInstruction = this.getLanguageInstruction(persona.preferred_language);
    prompt += `${languageInstruction}\n\n`;

    // Add behavioral guidelines
    prompt += `Guidelines:
- Be helpful, professional, and ${persona.tone || 'friendly'}
- Keep responses ${persona.response_style || 'concise'} and EXTREMELY brief
- CRITICAL: Maximum 2 short sentences per message, unless using bullet points
- If response would be longer than 2 sentences, break it into multiple separate messages
- Use WhatsApp formatting for emphasis:
  * *bold text* for important words
  * _italic text_ for emphasis
  * ~strikethrough~ for corrections
  * \`code\` for product codes/SKUs
- Use bullet points (• or -) for lists instead of long paragraphs
- Use information from the knowledge base when relevant
- If you don't know something, acknowledge it honestly
- Do not make up information about products, services, or pricing
- Always maintain the persona's tone and style

Response Format Examples:
✅ GOOD: "We have *2-burner* and *4-burner* gas cookers available. Which size would work best for you?"
✅ GOOD: "Here are our popular models:
• 2-burner - LKR 15,000
• 4-burner - LKR 28,000"
❌ BAD: "We have several gas cooker options available including 2-burner models that are perfect for small families and 4-burner models that are great for larger families and the prices range from LKR 15,000 to LKR 28,000 depending on the model and features you choose."`;

    return prompt;
  }

  /**
   * Get language instruction based on persona preference
   */
  private getLanguageInstruction(preferredLanguage?: string | null): string {
    if (preferredLanguage && preferredLanguage !== 'auto' && preferredLanguage.trim() !== '') {
      // Specific language requested by persona
      const languageMap: { [key: string]: string } = {
        'en': 'English',
        'si': 'Sinhala (සිංහල)',
        'ta': 'Tamil (தமிழ்)',
        'hi': 'Hindi (हिन्दी)',
        'es': 'Spanish (Español)',
        'fr': 'French (Français)',
        'de': 'German (Deutsch)',
        'ar': 'Arabic (العربية)',
        'zh': 'Chinese (中文)',
        'ja': 'Japanese (日本語)',
      };

      const languageName = languageMap[preferredLanguage.toLowerCase()] || preferredLanguage;

      return `Language: You MUST respond in ${languageName}. This is a strict requirement set by the business owner.`;
    }

    // Default: Auto-detect language from user messages
    return `Language Detection & Matching:
- CRITICAL: You are a multilingual AI assistant. Automatically detect the language and communication style of the user's message.
- ALWAYS respond in the SAME language as the user's most recent message.
- Match the user's formality level, tone, and regional dialect as closely as possible.
- If the user writes in Sinhala (සිංහල), respond in Sinhala.
- If the user writes in Tamil (தமிழ்), respond in Tamil.
- If the user writes in English, respond in English.
- If the user mixes languages (code-switching), mirror their pattern naturally.
- For languages like Sinhala and Tamil, you may use either native script or romanized form (Singlish/Tanglish) based on what the user uses.
- Preserve the user's cultural context and communication nuances in your responses.
- NEVER ask the user what language they prefer - just detect and match it automatically.`;
  }

  /**
   * Store conversation in database
   */
  private async storeConversation(
    businessProfileId: string,
    contactId: string,
    personaId: string | null,
    userMessage: string,
    aiResponse: string,
    inputTokens: number,
    outputTokens: number,
    model?: string,
    deviceId?: string,
    messageId?: string
  ): Promise<void> {
    const conversationId = uuidv4();
    await pool.query<ResultSetHeader>(
      `INSERT INTO ai_conversations
       (id, business_profile_id, contact_id, persona_id, user_message, ai_response, input_tokens, output_tokens, role, content, model, device_id, message_id, tokens_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'assistant', ?, ?, ?, ?, ?)`,
      [
        conversationId,
        businessProfileId,
        contactId,
        personaId,
        userMessage,
        aiResponse,
        inputTokens,
        outputTokens,
        aiResponse,
        model || null,
        deviceId || null,
        messageId || null,
        inputTokens + outputTokens
      ]
    );
  }
}

export const aiChatService = new AIChatService();
