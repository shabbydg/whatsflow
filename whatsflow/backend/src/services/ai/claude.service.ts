/**
 * Anthropic Claude AI Service
 * Handles all Claude API interactions
 */

import Anthropic from '@anthropic-ai/sdk';
import { AIServiceInterface, AIMessage, AIResponse } from './base.service.js';
import logger from '../../utils/logger.js';

export class ClaudeService implements AIServiceInterface {
  private client: Anthropic | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';

    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
      logger.info('Claude AI service initialized');
    } else {
      logger.warn('ANTHROPIC_API_KEY not set. Claude service unavailable.');
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
      throw new Error('Claude service not available. Set ANTHROPIC_API_KEY.');
    }

    // Extract system message
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-haiku-20241022',
        max_tokens: options?.maxTokens ?? 1024,
        temperature: options?.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: conversationMessages.map((msg) => {
          // Support vision messages with images
          if (msg.image) {
            return {
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: [
                {
                  type: 'image' as const,
                  source: {
                    type: 'base64' as const,
                    media_type: 'image/jpeg' as const,
                    data: msg.image,
                  },
                },
                {
                  type: 'text' as const,
                  text: msg.content,
                },
              ],
            };
          }

          // Regular text message
          return {
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          };
        }),
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        content: content.text,
        model: options?.model || 'claude-3-5-haiku-20241022',
        tokensUsed: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
        provider: 'anthropic',
      };
    } catch (error: any) {
      logger.error('Claude API error:', error);
      throw new Error(`Claude error: ${error.message}`);
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
      throw new Error('Claude service not available. Set ANTHROPIC_API_KEY.');
    }

    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nContent:\n${content}\n\nReturn only valid JSON, no additional text.`,
          },
        ],
      });

      const responseContent = response.content[0];
      if (responseContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Try to extract JSON from response
      const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(responseContent.text);
    } catch (error: any) {
      logger.error('Claude extraction error:', error);
      throw new Error(`Failed to extract structured data: ${error.message}`);
    }
  }
}
