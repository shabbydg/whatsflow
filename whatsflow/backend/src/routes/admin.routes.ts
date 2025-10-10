/**
 * Admin Routes
 * Routes for admin panel operations
 */

import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import {
  authenticateAdmin,
  requireAdminRole,
  logAdminAction,
} from '../middleware/admin-auth.middleware.js';
import { planController } from '../controllers/plan.controller.js';

const router = Router();

// ==================== AUTH ====================

// Public admin auth
router.post('/auth/login', (req, res) => adminController.login(req, res));

// Protected admin auth
router.get('/auth/profile', authenticateAdmin, (req, res) => adminController.getProfile(req, res));

// ==================== DASHBOARD ====================

router.get(
  '/dashboard/stats',
  authenticateAdmin,
  (req, res) => adminController.getDashboardStats(req, res)
);

// ==================== USER MANAGEMENT ====================

// All admins can view users
router.get('/users', authenticateAdmin, (req, res) => adminController.getUsers(req, res));

router.get('/users/:id', authenticateAdmin, (req, res) =>
  adminController.getUserDetails(req, res)
);

// Support and above can update users
router.put(
  '/users/:id',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin'),
  logAdminAction('update_user', 'user'),
  (req, res) => adminController.updateUser(req, res)
);

// ==================== SUBSCRIPTION MANAGEMENT ====================

router.get('/subscriptions', authenticateAdmin, (req, res) =>
  adminController.getSubscriptions(req, res)
);

// Super admin only - make account free
router.post(
  '/subscriptions/:id/make-free',
  authenticateAdmin,
  requireAdminRole('super_admin'),
  logAdminAction('make_account_free', 'subscription'),
  (req, res) => adminController.makeAccountFree(req, res)
);

// Super admin only - remove free status
router.post(
  '/subscriptions/:id/remove-free',
  authenticateAdmin,
  requireAdminRole('super_admin'),
  logAdminAction('remove_free_status', 'subscription'),
  (req, res) => adminController.removeFreeStatus(req, res)
);

// ==================== PAYMENT MANAGEMENT ====================

// Finance and super admin can view payments
router.get(
  '/payments',
  authenticateAdmin,
  requireAdminRole('super_admin', 'finance_admin'),
  (req, res) => adminController.getPayments(req, res)
);

// Process refund (finance and super admin only)
router.post(
  '/payments/:id/refund',
  authenticateAdmin,
  requireAdminRole('super_admin', 'finance_admin'),
  logAdminAction('process_refund', 'payment'),
  (req, res) => adminController.processRefund(req, res)
);

// ==================== PLAN MANAGEMENT ====================

// Super admin only - create/update plans
router.post(
  '/plans',
  authenticateAdmin,
  requireAdminRole('super_admin'),
  logAdminAction('create_plan', 'plan'),
  (req, res) => planController.createPlan(req, res)
);

router.put(
  '/plans/:id',
  authenticateAdmin,
  requireAdminRole('super_admin'),
  logAdminAction('update_plan', 'plan'),
  (req, res) => planController.updatePlan(req, res)
);

// ==================== COUPON MANAGEMENT ====================

router.get('/coupons', authenticateAdmin, (req, res) => adminController.getCoupons(req, res));

router.post(
  '/coupons',
  authenticateAdmin,
  requireAdminRole('super_admin'),
  logAdminAction('create_coupon', 'coupon'),
  (req, res) => adminController.createCoupon(req, res)
);

router.delete(
  '/coupons/:id',
  authenticateAdmin,
  requireAdminRole('super_admin'),
  logAdminAction('delete_coupon', 'coupon'),
  (req, res) => adminController.deleteCoupon(req, res)
);

export default router;

