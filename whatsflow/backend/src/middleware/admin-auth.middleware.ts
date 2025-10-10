/**
 * Admin Authentication Middleware
 * Verifies admin JWT tokens and role permissions
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: 'super_admin' | 'support_admin' | 'finance_admin' | 'read_only';
  };
}

/**
 * Verify admin JWT token
 */
export async function authenticateAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (!decoded.adminId || !decoded.role) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    req.admin = {
      id: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require specific admin role
 */
export function requireAdminRole(...allowedRoles: string[]) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      logger.warn(`Admin ${req.admin.email} attempted unauthorized action. Required: ${allowedRoles.join(', ')}, Has: ${req.admin.role}`);
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.admin.role,
      });
    }

    next();
  };
}

/**
 * Log admin actions
 */
export function logAdminAction(action: string, targetType: string) {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Log the action after successful response
      if (req.admin && res.statusCode < 400) {
        const targetId = req.params.id || req.body?.id || 'N/A';
        const ipAddress = req.ip || req.connection.remoteAddress || '';

        // Import dynamically to avoid circular dependency
        import('../services/admin.service.js').then(({ adminService }) => {
          adminService
            .logActivity(req.admin!.id, action, targetType, targetId, req.body, ipAddress)
            .catch((error) => logger.error('Failed to log admin activity:', error));
        });
      }

      return originalJson(data);
    };

    next();
  };
}

