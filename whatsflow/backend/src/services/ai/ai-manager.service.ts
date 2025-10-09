/**
 * AI Manager Service
 * Coordinates between different AI providers and handles fallbacks
 */

import { GeminiService } from './gemini.service.js';
import { ClaudeService } from './claude.service.js';
import { OpenAIService } from './openai.service.js';
import { AIServiceInterface, AIMessage, AIResponse } from './base.service.js';
import logger from '../../utils/logger.js';

export class AIManagerService {
  private gemini: GeminiService;
  private claude: ClaudeService;
  private openai: OpenAIService;

  constructor() {
    this.gemini = new GeminiService();
    this.claude = new ClaudeService();
    this.openai = new OpenAIService();
  }

  /**
   * Get the appropriate AI service based on model name
   */
  private getService(model?: string): AIServiceInterface {
    if (!model) {
      // Default: Try Gemini first (free tier), then Claude, then OpenAI
      if (this.gemini.isAvailable()) return this.gemini;
      if (this.claude.isAvailable()) return this.claude;
      if (this.openai.isAvailable()) return this.openai;
      throw new Error('No AI services available. Please configure at least one API key.');
    }

    // Route to appropriate service based on model
    if (model.startsWith('gemini')) {
      if (!this.gemini.isAvailable()) {
        throw new Error('Gemini not available. Set GOOGLE_API_KEY.');
      }
      return this.gemini;
    }

    if (model.startsWith('claude')) {
      if (!this.claude.isAvailable()) {
        throw new Error('Claude not available. Set ANTHROPIC_API_KEY.');
      }
      return this.claude;
    }

    if (model.startsWith('gpt')) {
      if (!this.openai.isAvailable()) {
        throw new Error('OpenAI not available. Set OPENAI_API_KEY.');
      }
      return this.openai;
    }

    throw new Error(`Unknown model: ${model}`);
  }

  /**
   * Generate a chat response using the specified or default AI service
   */
  async generateChatResponse(
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<AIResponse> {
    try {
      const service = this.getService(options?.model);
      return await service.generateResponse(messages, options);
    } catch (error: any) {
      // If primary service fails, try fallback to Claude or Gemini
      logger.warn(`Primary AI service failed: ${error.message}. Trying fallback...`);

      if (this.claude.isAvailable() && !options?.model?.includes('claude')) {
        logger.info('Falling back to Claude...');
        return await this.claude.generateResponse(messages, { ...options, model: 'claude-3-5-haiku-20241022' });
      }

      if (this.gemini.isAvailable() && !options?.model?.includes('gemini')) {
        logger.info('Falling back to Gemini...');
        return await this.gemini.generateResponse(messages, { ...options, model: 'gemini-2.0-flash-exp' });
      }

      throw error; // Re-throw if no fallback available
    }
  }

  /**
   * Extract structured data from content
   */
  async extractStructuredData(
    prompt: string,
    content: string,
    options?: {
      model?: string;
    }
  ): Promise<any> {
    // For extraction, prefer Claude Sonnet or GPT-4
    let service: AIServiceInterface;

    if (options?.model) {
      service = this.getService(options.model);
    } else {
      // Smart default for extraction - Claude is best at structured extraction
      if (this.claude.isAvailable()) {
        service = this.claude;
        options = { model: 'claude-3-5-sonnet-20241022' };
      } else if (this.openai.isAvailable()) {
        service = this.openai;
        options = { model: 'gpt-4o' };
      } else if (this.gemini.isAvailable()) {
        service = this.gemini;
        options = { model: 'gemini-1.5-flash' };
      } else {
        throw new Error('No AI services available for extraction');
      }
    }

    return await service.extractStructuredData(prompt, content, options);
  }

  /**
   * Get list of available AI models
   */
  getAvailableModels(): Array<{ value: string; label: string; provider: string }> {
    const models: Array<{ value: string; label: string; provider: string }> = [];

    if (this.gemini.isAvailable()) {
      models.push(
        { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (FREE)', provider: 'google' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'google' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google' }
      );
    }

    if (this.claude.isAvailable()) {
      models.push(
        { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'anthropic' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'anthropic' }
      );
    }

    if (this.openai.isAvailable()) {
      models.push(
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
        { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai' }
      );
    }

    return models;
  }

  /**
   * Check if any AI service is available
   */
  hasAnyAvailable(): boolean {
    return this.gemini.isAvailable() || this.claude.isAvailable() || this.openai.isAvailable();
  }

  /**
   * Analyze an image using vision-capable AI models
   */
  async analyzeImage(base64Image: string, prompt: string): Promise<string> {
    try {
      // Claude has the best vision capabilities
      if (this.claude.isAvailable()) {
        const messages: AIMessage[] = [
          {
            role: 'user',
            content: prompt,
            image: base64Image
          }
        ];

        const response = await this.claude.generateResponse(messages, {
          model: 'claude-3-5-sonnet-20241022',
          maxTokens: 1024
        });

        return response.content;
      }

      // Fallback to Gemini (also supports vision)
      if (this.gemini.isAvailable()) {
        const messages: AIMessage[] = [
          {
            role: 'user',
            content: prompt,
            image: base64Image
          }
        ];

        const response = await this.gemini.generateResponse(messages, {
          model: 'gemini-2.5-flash',
          maxTokens: 1024
        });

        return response.content;
      }

      throw new Error('No vision-capable AI service available');
    } catch (error: any) {
      logger.error('Error analyzing image:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiManager = new AIManagerService();
