/**
 * OpenAI Service
 * Handles all OpenAI API interactions
 */

import OpenAI from 'openai';
import { AIServiceInterface, AIMessage, AIResponse } from './base.service.js';
import logger from '../../utils/logger.js';

export class OpenAIService implements AIServiceInterface {
  private client: OpenAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';

    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
      logger.info('OpenAI service initialized');
    } else {
      logger.warn('OPENAI_API_KEY not set. OpenAI service unavailable.');
    }
  }

  isAvailable(): boolean {
    return !!this.client;
  }

  async generateResponse(
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI service not available. Set OPENAI_API_KEY.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4o-mini',
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      });

      const choice = response.choices[0];
      if (!choice.message.content) {
        throw new Error('No content in OpenAI response');
      }

      return {
        content: choice.message.content,
        model: options?.model || 'gpt-4o-mini',
        tokensUsed: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
        },
        provider: 'openai',
      };
    } catch (error: any) {
      logger.error('OpenAI API error:', error);
      throw new Error(`OpenAI error: ${error.message}`);
    }
  }

  async extractStructuredData(
    prompt: string,
    content: string,
    options?: {
      model?: string;
    }
  ): Promise<any> {
    if (!this.client) {
      throw new Error('OpenAI service not available. Set OPENAI_API_KEY.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Extract structured data from this content:\n\n${content}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = response.choices[0].message.content;
      if (!result) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(result);
    } catch (error: any) {
      logger.error('OpenAI extraction error:', error);
      throw new Error(`Failed to extract structured data: ${error.message}`);
    }
  }
}
