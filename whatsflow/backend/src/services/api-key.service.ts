/**
 * API Key Service
 * Manages API key generation, validation, and lifecycle
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export interface APIKey {
  id: string;
  business_profile_id: string;
  key_hash: string;
  name: string;
  scopes: string[];
  environment: 'live' | 'test';
  rate_limit_tier: string;
  is_active: boolean;
  last_used_at?: Date;
  last_request_at?: Date;
  requests_count: number;
  created_at: Date;
}

export interface CreateAPIKeyData {
  name: string;
  scopes?: string[];
  environment?: 'live' | 'test';
}

export class APIKeyService {
  /**
   * Available scopes for API keys
   */
  static readonly AVAILABLE_SCOPES = [
    'messages:send',
    'messages:read',
    'devices:read',
    'devices:manage',
    'contacts:read',
    'contacts:write',
    'webhooks:manage',
  ];

  /**
   * Generate a new API key
   */
  generateKey(environment: 'live' | 'test' = 'live'): string {
    const prefix = environment === 'live' ? 'wf_live_' : 'wf_test_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  /**
   * Hash API key for secure storage
   */
  hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Create a new API key
   */
  async createAPIKey(
    businessProfileId: string,
    data: CreateAPIKeyData
  ): Promise<{ key: string; apiKey: APIKey }> {
    const key = this.generateKey(data.environment || 'live');
    const keyHash = this.hashKey(key);
    const id = uuidv4();

    const scopes = data.scopes || ['messages:send', 'messages:read', 'devices:read'];
    
    // Validate scopes
    for (const scope of scopes) {
      if (!APIKeyService.AVAILABLE_SCOPES.includes(scope)) {
        throw new Error(`Invalid scope: ${scope}`);
      }
    }

    await query(
      `INSERT INTO api_keys (
        id, business_profile_id, key_hash, name, scopes, environment, 
        rate_limit_tier, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [
        id,
        businessProfileId,
        keyHash,
        data.name,
        JSON.stringify(scopes),
        data.environment || 'live',
        'standard',
      ]
    );

    const apiKey = await this.getAPIKeyById(id);
    if (!apiKey) {
      throw new Error('Failed to create API key');
    }

    logger.info(`API key created: ${id} for business ${businessProfileId}`);

    // Return the plain key (only shown once) along with the stored record
    return { key, apiKey };
  }

  /**
   * Get all API keys for a business
   */
  async getAPIKeys(businessProfileId: string): Promise<APIKey[]> {
    const rows: any = await query(
      `SELECT 
        id, business_profile_id, name, scopes, environment, 
        rate_limit_tier, is_active, last_used_at, last_request_at,
        requests_count, created_at
      FROM api_keys 
      WHERE business_profile_id = ?
      ORDER BY created_at DESC`,
      [businessProfileId]
    );

    if (!Array.isArray(rows)) return [];

    return rows.map(this.parseAPIKeyRow);
  }

  /**
   * Get API key by ID
   */
  async getAPIKeyById(id: string): Promise<APIKey | null> {
    const rows: any = await query(
      `SELECT 
        id, business_profile_id, key_hash, name, scopes, environment,
        rate_limit_tier, is_active, last_used_at, last_request_at,
        requests_count, created_at
      FROM api_keys 
      WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;

    return this.parseAPIKeyRow(rows[0]);
  }

  /**
   * Validate an API key and return the associated data
   */
  async validateKey(key: string): Promise<APIKey | null> {
    const keyHash = this.hashKey(key);

    const rows: any = await query(
      `SELECT 
        id, business_profile_id, key_hash, name, scopes, environment,
        rate_limit_tier, is_active, last_used_at, last_request_at,
        requests_count, created_at
      FROM api_keys 
      WHERE key_hash = ? AND is_active = TRUE`,
      [keyHash]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.parseAPIKeyRow(rows[0]);
  }

  /**
   * Update last used timestamp and increment request count
   */
  async updateLastUsed(apiKeyId: string): Promise<void> {
    await query(
      `UPDATE api_keys 
      SET last_used_at = NOW(), 
          last_request_at = NOW(),
          requests_count = requests_count + 1
      WHERE id = ?`,
      [apiKeyId]
    );
  }

  /**
   * Update API key
   */
  async updateAPIKey(
    id: string,
    businessProfileId: string,
    data: {
      name?: string;
      scopes?: string[];
      is_active?: boolean;
    }
  ): Promise<APIKey> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.scopes !== undefined) {
      // Validate scopes
      for (const scope of data.scopes) {
        if (!APIKeyService.AVAILABLE_SCOPES.includes(scope)) {
          throw new Error(`Invalid scope: ${scope}`);
        }
      }
      updates.push('scopes = ?');
      values.push(JSON.stringify(data.scopes));
    }

    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(id, businessProfileId);

    await query(
      `UPDATE api_keys 
      SET ${updates.join(', ')}
      WHERE id = ? AND business_profile_id = ?`,
      values
    );

    const updated = await this.getAPIKeyById(id);
    if (!updated) {
      throw new Error('API key not found after update');
    }

    return updated;
  }

  /**
   * Delete (revoke) an API key
   */
  async deleteAPIKey(id: string, businessProfileId: string): Promise<void> {
    await query(
      'DELETE FROM api_keys WHERE id = ? AND business_profile_id = ?',
      [id, businessProfileId]
    );

    logger.info(`API key deleted: ${id}`);
  }

  /**
   * Check if API key has specific scope
   */
  hasScope(apiKey: APIKey, requiredScope: string): boolean {
    return apiKey.scopes.includes(requiredScope);
  }

  /**
   * Parse API key row from database
   */
  private parseAPIKeyRow(row: any): APIKey {
    return {
      id: row.id,
      business_profile_id: row.business_profile_id,
      key_hash: row.key_hash,
      name: row.name,
      scopes: typeof row.scopes === 'string' ? JSON.parse(row.scopes) : row.scopes || [],
      environment: row.environment,
      rate_limit_tier: row.rate_limit_tier,
      is_active: row.is_active,
      last_used_at: row.last_used_at,
      last_request_at: row.last_request_at,
      requests_count: row.requests_count || 0,
      created_at: row.created_at,
    };
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(apiKeyId: string, days: number = 7): Promise<any> {
    const rows: any = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as requests,
        AVG(response_time_ms) as avg_response_time
      FROM api_request_logs
      WHERE api_key_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC`,
      [apiKeyId, days]
    );

    return Array.isArray(rows) ? rows : [];
  }

  /**
   * Log API request
   */
  async logRequest(
    apiKeyId: string,
    businessProfileId: string,
    data: {
      endpoint: string;
      method: string;
      statusCode: number;
      responseTimeMs: number;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO api_request_logs (
          id, api_key_id, business_profile_id, endpoint, method,
          status_code, response_time_ms, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          uuidv4(),
          apiKeyId,
          businessProfileId,
          data.endpoint,
          data.method,
          data.statusCode,
          data.responseTimeMs,
          data.ipAddress || null,
          data.userAgent || null,
        ]
      );
    } catch (error) {
      // Don't fail the request if logging fails
      logger.error('Failed to log API request:', error);
    }
  }
}

export const apiKeyService = new APIKeyService();

