/**
 * Base AI Service Interface
 * Defines common methods for all AI providers
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  image?: string; // Base64 encoded image for vision models
}

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  provider: string;
}

export interface AIServiceInterface {
  /**
   * Generate a chat response
   */
  generateResponse(
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<AIResponse>;

  /**
   * Extract structured data from text
   */
  extractStructuredData(
    prompt: string,
    content: string,
    options?: {
      model?: string;
    }
  ): Promise<any>;

  /**
   * Check if the service is available
   */
  isAvailable(): boolean;
}
