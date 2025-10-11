/**
 * Public API Authentication Middleware
 * Validates API keys for public API access
 */

import { Request, Response, NextFunction } from 'express';
import { apiKeyService, APIKey } from '../services/api-key.service.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export interface APIRequest extends Request {
  apiKey?: APIKey;
  apiContext?: {
    businessProfileId: string;
    userId: string;
    subscription: any;
  };
}

/**
 * Authenticate API requests using API key
 */
export async function authenticateAPIKey(
  req: APIRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No API key provided',
        message: 'Include your API key in the Authorization header: Bearer wf_live_xxx',
      });
    }

    const key = authHeader.replace('Bearer ', '').trim();

    if (!key.startsWith('wf_live_') && !key.startsWith('wf_test_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key format',
        message: 'API key must start with wf_live_ or wf_test_',
      });
    }

    // Validate the key
    const apiKey = await apiKeyService.validateKey(key);

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked',
      });
    }

    // Update last used timestamp asynchronously
    apiKeyService.updateLastUsed(apiKey.id).catch((err) => {
      logger.error('Failed to update API key last_used_at:', err);
    });

    // Get business profile and user info
    const businessProfile: any = await query(
      `SELECT bp.id, bp.user_id, u.email
      FROM business_profiles bp
      JOIN users u ON u.id = bp.user_id
      WHERE bp.id = ?`,
      [apiKey.business_profile_id]
    );

    if (!Array.isArray(businessProfile) || businessProfile.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    // Get subscription
    const subscription: any = await query(
      `SELECT * FROM subscriptions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1`,
      [businessProfile[0].user_id]
    );

    // Attach API context to request
    req.apiKey = apiKey;
    req.apiContext = {
      businessProfileId: apiKey.business_profile_id,
      userId: businessProfile[0].user_id,
      subscription: Array.isArray(subscription) && subscription.length > 0 ? subscription[0] : null,
    };

    next();
  } catch (error: any) {
    logger.error('API authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
    });
  }
}

/**
 * Require specific scope for API endpoint
 */
export function requireScope(...requiredScopes: string[]) {
  return (req: APIRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Check if API key has at least one of the required scopes
    const hasScope = requiredScopes.some((scope) =>
      apiKeyService.hasScope(req.apiKey!, scope)
    );

    if (!hasScope) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This API key does not have the required scope. Required: ${requiredScopes.join(' or ')}`,
        requiredScopes,
      });
    }

    next();
  };
}

/**
 * Log API request for analytics
 */
export function logAPIRequest() {
  return async (req: APIRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture original send function
    const originalSend = res.send.bind(res);

    res.send = function (data: any): Response {
      const responseTime = Date.now() - startTime;

      // Log request asynchronously
      if (req.apiKey && req.apiContext) {
        apiKeyService
          .logRequest(req.apiKey.id, req.apiContext.businessProfileId, {
            endpoint: req.path,
            method: req.method,
            statusCode: res.statusCode,
            responseTimeMs: responseTime,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          })
          .catch((err) => {
            logger.error('Failed to log API request:', err);
          });
      }

      return originalSend(data);
    };

    next();
  };
}

