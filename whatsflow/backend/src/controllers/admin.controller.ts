/**
 * Admin Controller
 * Handles admin operations for user and subscription management
 */

import { Request, Response } from 'express';
import { AdminRequest } from '../middleware/admin-auth.middleware.js';
import { adminService } from '../services/admin.service.js';
import { subscriptionService } from '../services/billing/subscription.service.js';
import { planService } from '../services/billing/plan.service.js';
import { paymentService } from '../services/billing/payment.service.js';
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class AdminController {
  /**
   * Admin login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const result = await adminService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Get admin profile
   */
  async getProfile(req: AdminRequest, res: Response) {
    try {
      if (!req.admin) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const profile = await adminService.getAdminProfile(req.admin.id);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats(req: AdminRequest, res: Response) {
    try {
      const [subStats, paymentStats] = await Promise.all([
        adminService.getSubscriptionStats(),
        adminService.getPaymentStats(),
      ]);

      // Get user stats
      const userStats: any = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
          COUNT(CASE WHEN trial_used = false THEN 1 END) as unused_trials,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d
        FROM users
      `);

      res.json({
        success: true,
        data: {
          users: Array.isArray(userStats) && userStats.length > 0 ? userStats[0] : {},
          subscriptions: subStats,
          payments: paymentStats,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all users
   */
  async getUsers(req: AdminRequest, res: Response) {
    try {
      const { status, search, page, limit } = req.query;

      const result = await adminService.getAllUsers({
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result.users,
        pagination: {
          total: result.total,
          page: parseInt((page as string) || '1'),
          limit: parseInt((limit as string) || '50'),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user details
   */
  async getUserDetails(req: AdminRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserDetails(id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Update user
   */
  async updateUser(req: AdminRequest, res: Response) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);

      res.json({
        success: true,
        message: 'User updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Make account free (super admin only)
   */
  async makeAccountFree(req: AdminRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const subscription = await subscriptionService.makeAccountFree(id, reason || 'Admin override');

      res.json({
        success: true,
        data: subscription,
        message: 'Account made free successfully',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove free status (super admin only)
   */
  async removeFreeStatus(req: AdminRequest, res: Response) {
    try {
      const { id } = req.params;

      const subscription = await subscriptionService.removeFreeStatus(id);

      res.json({
        success: true,
        data: subscription,
        message: 'Free status removed successfully',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get all subscriptions
   */
  async getSubscriptions(req: AdminRequest, res: Response) {
    try {
      const { status, page, limit } = req.query;

      const result = await adminService.getAllSubscriptions({
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result.subscriptions,
        pagination: {
          total: result.total,
          page: parseInt((page as string) || '1'),
          limit: parseInt((limit as string) || '50'),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all payments
   */
  async getPayments(req: AdminRequest, res: Response) {
    try {
      const { status, page, limit } = req.query;

      const result = await adminService.getAllPayments({
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result.payments,
        pagination: {
          total: result.total,
          page: parseInt((page as string) || '1'),
          limit: parseInt((limit as string) || '50'),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Process refund (finance admin or super admin)
   */
  async processRefund(req: AdminRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      await paymentService.processRefund(id, reason);

      res.json({
        success: true,
        message: 'Refund processed successfully',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Create coupon (super admin only)
   */
  async createCoupon(req: AdminRequest, res: Response) {
    try {
      const {
        code,
        description,
        discount_type,
        discount_value,
        applies_to_plans,
        max_uses,
        valid_from,
        valid_until,
      } = req.body;

      if (!code || !discount_type || discount_value === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const couponId = uuidv4();

      await query(
        `INSERT INTO coupons (
          id, code, description, discount_type, discount_value,
          applies_to_plans, max_uses, valid_from, valid_until, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          couponId,
          code,
          description || null,
          discount_type,
          discount_value,
          applies_to_plans ? JSON.stringify(applies_to_plans) : null,
          max_uses || null,
          valid_from || null,
          valid_until || null,
          req.admin?.id,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: { id: couponId },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get all coupons
   */
  async getCoupons(req: AdminRequest, res: Response) {
    try {
      const coupons: any = await query(`
        SELECT 
          c.*,
          COUNT(cu.id) as usage_count
        FROM coupons c
        LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);

      const parsedCoupons = Array.isArray(coupons)
        ? coupons.map((c) => ({
            ...c,
            applies_to_plans:
              typeof c.applies_to_plans === 'string'
                ? JSON.parse(c.applies_to_plans)
                : c.applies_to_plans,
          }))
        : [];

      res.json({
        success: true,
        data: parsedCoupons,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(req: AdminRequest, res: Response) {
    try {
      const { id } = req.params;

      await query('DELETE FROM coupons WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const adminController = new AdminController();

