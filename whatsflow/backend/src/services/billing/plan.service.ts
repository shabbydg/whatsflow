/**
 * Plan Service
 * Manages subscription plans
 */

import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  currency: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export class PlanService {
  /**
   * Parse plan row to ensure JSON fields are objects and prices are numbers
   */
  private parsePlanRow(row: any): Plan {
    return {
      ...row,
      price_monthly: parseFloat(row.price_monthly),
      price_annual: parseFloat(row.price_annual),
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
      limits: typeof row.limits === 'string' ? JSON.parse(row.limits) : row.limits,
    };
  }

  /**
   * Get all active plans
   */
  async getActivePlans(): Promise<Plan[]> {
    const rows: any = await query(
      'SELECT * FROM plans WHERE is_active = true ORDER BY display_order ASC'
    );
    
    if (!Array.isArray(rows)) {
      return [];
    }
    
    return rows.map(row => this.parsePlanRow(row));
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<Plan | null> {
    const rows: any = await query(
      'SELECT * FROM plans WHERE id = ?',
      [planId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.parsePlanRow(rows[0]);
  }

  /**
   * Get plan by slug
   */
  async getPlanBySlug(slug: string): Promise<Plan | null> {
    const rows: any = await query(
      'SELECT * FROM plans WHERE slug = ?',
      [slug]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.parsePlanRow(rows[0]);
  }

  /**
   * Get trial plan
   */
  async getTrialPlan(): Promise<Plan> {
    const plan = await this.getPlanBySlug('trial');
    if (!plan) {
      throw new Error('Trial plan not found in database');
    }
    return plan;
  }

  /**
   * Create new plan (admin only)
   */
  async createPlan(data: {
    name: string;
    slug: string;
    description?: string;
    price_monthly: number;
    price_annual: number;
    currency?: string;
    features: Record<string, any>;
    limits: Record<string, any>;
    display_order?: number;
  }): Promise<Plan> {
    const planId = uuidv4();

    await query(
      `INSERT INTO plans (
        id, name, slug, description, price_monthly, price_annual, 
        currency, features, limits, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planId,
        data.name,
        data.slug,
        data.description || null,
        data.price_monthly,
        data.price_annual,
        data.currency || 'USD',
        JSON.stringify(data.features),
        JSON.stringify(data.limits),
        data.display_order || 99,
      ]
    );

    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Failed to create plan');
    }

    return plan;
  }

  /**
   * Update plan (admin only)
   */
  async updatePlan(
    planId: string,
    data: Partial<{
      name: string;
      description: string;
      price_monthly: number;
      price_annual: number;
      features: Record<string, any>;
      limits: Record<string, any>;
      is_active: boolean;
      display_order: number;
    }>
  ): Promise<Plan> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.price_monthly !== undefined) {
      updates.push('price_monthly = ?');
      values.push(data.price_monthly);
    }
    if (data.price_annual !== undefined) {
      updates.push('price_annual = ?');
      values.push(data.price_annual);
    }
    if (data.features !== undefined) {
      updates.push('features = ?');
      values.push(JSON.stringify(data.features));
    }
    if (data.limits !== undefined) {
      updates.push('limits = ?');
      values.push(JSON.stringify(data.limits));
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active);
    }
    if (data.display_order !== undefined) {
      updates.push('display_order = ?');
      values.push(data.display_order);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(planId);

    await query(
      `UPDATE plans SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found after update');
    }

    return plan;
  }

  /**
   * Check if user has feature access
   */
  hasFeature(plan: Plan, feature: string): boolean {
    return plan.features[feature] === true;
  }

  /**
   * Check if limit is unlimited
   */
  isUnlimited(plan: Plan, limitKey: string): boolean {
    return plan.limits[limitKey] === -1;
  }

  /**
   * Get limit value
   */
  getLimit(plan: Plan, limitKey: string): number {
    return plan.limits[limitKey] || 0;
  }

  /**
   * Calculate price for billing cycle
   */
  getPriceForCycle(plan: Plan, cycle: 'monthly' | 'annual'): number {
    return cycle === 'annual' ? plan.price_annual : plan.price_monthly;
  }

  /**
   * Calculate annual savings
   */
  getAnnualSavings(plan: Plan): number {
    const monthlyTotal = plan.price_monthly * 12;
    return monthlyTotal - plan.price_annual;
  }

  /**
   * Get annual discount percentage
   */
  getAnnualDiscountPercent(plan: Plan): number {
    if (plan.price_monthly === 0) return 0;
    const monthlyTotal = plan.price_monthly * 12;
    const savings = this.getAnnualSavings(plan);
    return Math.round((savings / monthlyTotal) * 100);
  }
}

export const planService = new PlanService();

