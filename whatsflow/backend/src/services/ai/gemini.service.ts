/**
 * Google Gemini AI Service
 * Handles all Gemini API interactions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIServiceInterface, AIMessage, AIResponse } from './base.service.js';
import logger from '../../utils/logger.js';

export class GeminiService implements AIServiceInterface {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';

    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
      logger.info('Gemini AI service initialized');
    } else {
      logger.warn('GOOGLE_API_KEY not set. Gemini service unavailable.');
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
      throw new Error('Gemini service not available. Set GOOGLE_API_KEY.');
    }

    // Use the correct, stable model alias
    let modelName = options?.model || 'gemini-2.5-flash';

    // Map old model names to new ones
    if (modelName === 'gemini-1.5-flash' || modelName === 'gemini-1.5-flash-latest') {
      modelName = 'gemini-2.5-flash';
    }
    if (modelName.includes('-latest')) {
      modelName = modelName.replace('-latest', '');
    }

    const model = this.client.getGenerativeModel({
      model: modelName,
    });

    // Convert messages to Gemini format
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Build conversation history
    let contents = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Gemini requires: first message must be from 'user', not 'model'
    // Filter history to ensure it starts with a user message
    const history = contents.slice(0, -1); // All except last message
    let validHistory = history;

    if (history.length > 0) {
      // Find first user message
      const firstUserIndex = history.findIndex(msg => msg.role === 'user');

      if (firstUserIndex > 0) {
        // Skip any leading 'model' messages
        validHistory = history.slice(firstUserIndex);
      } else if (firstUserIndex === -1) {
        // No user messages in history, clear it
        validHistory = [];
      }

      // Ensure messages alternate (remove consecutive messages from same role)
      const alternatingHistory: typeof validHistory = [];
      let lastRole: string | null = null;

      for (const msg of validHistory) {
        if (msg.role !== lastRole) {
          alternatingHistory.push(msg);
          lastRole = msg.role;
        }
      }

      validHistory = alternatingHistory;
    }

    // Log history validation (for debugging)
    if (validHistory.length > 0) {
      logger.debug(`Gemini chat history: ${validHistory.length} messages, first role: ${validHistory[0].role}`);
    }

    const generationConfig = {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 1024,
    };

    try {
      const chat = model.startChat({
        generationConfig,
        history: validHistory, // Use cleaned history
      });

      // Add system message as context if present
      const lastMessage = contents[contents.length - 1];
      const prompt = systemMessage
        ? `${systemMessage.content}\n\n${lastMessage.parts[0].text}`
        : lastMessage.parts[0].text;

      const result = await chat.sendMessage(prompt);
      const response = result.response;

      return {
        content: response.text(),
        model: options?.model || 'gemini-2.0-flash-exp',
        tokensUsed: {
          input: response.usageMetadata?.promptTokenCount || 0,
          output: response.usageMetadata?.candidatesTokenCount || 0,
        },
        provider: 'google',
      };
    } catch (error: any) {
      logger.error('Gemini API error:', error);
      throw new Error(`Gemini error: ${error.message}`);
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
      throw new Error('Gemini service not available. Set GOOGLE_API_KEY.');
    }

    const model = this.client.getGenerativeModel({
      model: options?.model || 'gemini-1.5-flash',
    });

    const fullPrompt = `${prompt}\n\nContent:\n${content}\n\nReturn the extracted data as valid JSON.`;

    try {
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();

      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(response);
    } catch (error: any) {
      logger.error('Gemini extraction error:', error);
      throw new Error(`Failed to extract structured data: ${error.message}`);
    }
  }
}
