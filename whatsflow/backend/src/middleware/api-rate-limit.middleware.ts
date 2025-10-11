/**
 * API Rate Limiting Middleware
 * Enforces rate limits based on subscription plan and API tier
 */

import { Response, NextFunction } from 'express';
import { APIRequest } from './api-auth.middleware.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// Rate limit tiers based on subscription plans
const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  trial: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },
  starter: {
    windowMs: 60 * 1000,
    maxRequests: 30, // 30 requests per minute
  },
  professional: {
    windowMs: 60 * 1000,
    maxRequests: 100, // 100 requests per minute
  },
  business: {
    windowMs: 60 * 1000,
    maxRequests: 300, // 300 requests per minute
  },
  enterprise: {
    windowMs: 60 * 1000,
    maxRequests: 1000, // 1000 requests per minute
  },
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 60, // Default: 60 requests per minute
  },
};

export function apiRateLimit() {
  return async (req: APIRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.apiKey || !req.apiContext) {
        return next();
      }

      const apiKeyId = req.apiKey.id;
      const tier = req.apiKey.rate_limit_tier || 'standard';
      const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.standard;

      // Redis key for rate limiting
      const redisKey = `ratelimit:api:${apiKeyId}`;

      // Get current count
      const currentCount = await redis.get(redisKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      // Calculate reset time
      const ttl = await redis.ttl(redisKey);
      const resetTime = ttl > 0 ? Math.floor(Date.now() / 1000) + ttl : Math.floor((Date.now() + config.windowMs) / 1000);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - count - 1).toString());
      res.setHeader('X-RateLimit-Reset', resetTime.toString());

      // Check if limit exceeded
      if (count >= config.maxRequests) {
        logger.warn(`Rate limit exceeded for API key: ${apiKeyId} (tier: ${tier})`);
        
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: `You have exceeded the rate limit of ${config.maxRequests} requests per minute for your ${tier} plan`,
          retryAfter: ttl > 0 ? ttl : Math.floor(config.windowMs / 1000),
        });
      }

      // Increment counter
      if (count === 0) {
        // First request in window - set with expiry
        await redis.setex(redisKey, Math.floor(config.windowMs / 1000), '1');
      } else {
        // Increment existing counter
        await redis.incr(redisKey);
      }

      next();
    } catch (error: any) {
      logger.error('Rate limit check error:', error);
      // Fail open - don't block requests if rate limiting fails
      next();
    }
  };
}

/**
 * Get rate limit info for a specific tier
 */
export function getRateLimitInfo(tier: string): RateLimitConfig {
  return RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.standard;
}

