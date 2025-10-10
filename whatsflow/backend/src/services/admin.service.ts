/**
 * Admin Service
 * Handles admin authentication and operations
 */

import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'support_admin' | 'finance_admin' | 'read_only';
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class AdminService {
  /**
   * Admin login
   */
  async login(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    const admins: any = await query(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = true',
      [email]
    );

    if (!Array.isArray(admins) || admins.length === 0) {
      throw new Error('Invalid credentials');
    }

    const admin = admins[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await query('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [
      admin.id,
    ]);

    // Generate token
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    logger.info(`Admin login: ${admin.email} (${admin.role})`);

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        is_active: admin.is_active,
        last_login_at: admin.last_login_at,
        created_at: admin.created_at,
        updated_at: admin.updated_at,
      },
    };
  }

  /**
   * Get admin profile
   */
  async getAdminProfile(adminId: string): Promise<AdminUser> {
    const admins: any = await query('SELECT * FROM admin_users WHERE id = ?', [adminId]);

    if (!Array.isArray(admins) || admins.length === 0) {
      throw new Error('Admin not found');
    }

    const admin = admins[0];
    return {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      is_active: admin.is_active,
      last_login_at: admin.last_login_at,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    };
  }

  /**
   * Log admin activity
   */
  async logActivity(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: any,
    ipAddress?: string
  ): Promise<void> {
    await query(
      `INSERT INTO admin_activity_logs (id, admin_user_id, action, target_type, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), adminId, action, targetType, targetId, JSON.stringify(details || {}), ipAddress]
    );
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: any[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any[] = [];

    if (filters?.status) {
      whereClause += ' AND u.is_active = ?';
      params.push(filters.status === 'active');
    }

    if (filters?.search) {
      whereClause += ' AND (u.email LIKE ? OR u.full_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countResult: any = await query(
      `SELECT COUNT(*) as total FROM users u WHERE ${whereClause}`,
      params
    );
    const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;

    // Get users with subscription info
    const users: any = await query(
      `SELECT 
        u.id, u.email, u.full_name, u.is_active, u.trial_used, u.created_at,
        s.status as subscription_status,
        p.name as plan_name,
        s.current_price,
        s.billing_cycle
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      users: Array.isArray(users) ? users : [],
      total,
    };
  }

  /**
   * Get user details (admin only)
   */
  async getUserDetails(userId: string): Promise<any> {
    const users: any = await query(
      `SELECT 
        u.*,
        bp.business_name,
        s.status as subscription_status,
        p.name as plan_name,
        s.current_price,
        s.billing_cycle,
        s.trial_ends_at,
        s.next_billing_date,
        s.is_free,
        s.free_reason
      FROM users u
      LEFT JOIN business_profiles bp ON u.id = bp.user_id
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE u.id = ?`,
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  }

  /**
   * Get subscription statistics (admin only)
   */
  async getSubscriptionStats(): Promise<any> {
    const stats: any = await query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_subscriptions,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_subscriptions,
        COUNT(DISTINCT CASE WHEN s.status = 'trial' THEN s.id END) as trial_subscriptions,
        COUNT(DISTINCT CASE WHEN s.status = 'canceled' THEN s.id END) as canceled_subscriptions,
        SUM(CASE WHEN s.status = 'active' THEN s.current_price ELSE 0 END) as monthly_revenue
      FROM subscriptions s
    `);

    return Array.isArray(stats) && stats.length > 0 ? stats[0] : {};
  }

  /**
   * Get payment statistics (admin only)
   */
  async getPaymentStats(): Promise<any> {
    const stats: any = await query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END) as avg_payment
      FROM payments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    return Array.isArray(stats) && stats.length > 0 ? stats[0] : {};
  }

  /**
   * Get all subscriptions (admin only)
   */
  async getAllSubscriptions(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ subscriptions: any[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any[] = [];

    if (filters?.status) {
      whereClause += ' AND s.status = ?';
      params.push(filters.status);
    }

    // Get total count
    const countResult: any = await query(
      `SELECT COUNT(*) as total FROM subscriptions s WHERE ${whereClause}`,
      params
    );
    const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;

    // Get subscriptions
    const subscriptions: any = await query(
      `SELECT 
        s.*,
        u.email, u.full_name,
        p.name as plan_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN plans p ON s.plan_id = p.id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
      total,
    };
  }

  /**
   * Get all payments (admin only)
   */
  async getAllPayments(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ payments: any[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any[] = [];

    if (filters?.status) {
      whereClause += ' AND p.status = ?';
      params.push(filters.status);
    }

    // Get total count
    const countResult: any = await query(
      `SELECT COUNT(*) as total FROM payments p WHERE ${whereClause}`,
      params
    );
    const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;

    // Get payments
    const payments: any = await query(
      `SELECT 
        p.*,
        u.email, u.full_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      payments: Array.isArray(payments) ? payments : [],
      total,
    };
  }
}

export const adminService = new AdminService();

