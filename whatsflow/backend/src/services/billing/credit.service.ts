/**
 * Credit Service
 * Manages user credits for overages and refunds
 */

import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';

export class CreditService {
  /**
   * Get user's credit balance
   */
  async getUserCredits(userId: string): Promise<number> {
    const result: any = await query('SELECT balance FROM user_credits WHERE user_id = ?', [userId]);

    if (!Array.isArray(result) || result.length === 0) {
      // Initialize credits for new user
      await this.initializeCredits(userId);
      return 0;
    }

    return result[0].balance || 0;
  }

  /**
   * Initialize credits for new user
   */
  private async initializeCredits(userId: string): Promise<void> {
    await query('INSERT INTO user_credits (id, user_id, balance) VALUES (?, ?, 0)', [
      uuidv4(),
      userId,
    ]);
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    userId: string,
    amount: number,
    type: 'refund' | 'promotional' | 'adjustment',
    description: string
  ): Promise<number> {
    // Ensure user has credit record
    await this.getUserCredits(userId);

    // Add credits
    await query('UPDATE user_credits SET balance = balance + ? WHERE user_id = ?', [amount, userId]);

    // Log transaction
    await query(
      `INSERT INTO credit_transactions (id, user_id, amount, transaction_type, description)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), userId, amount, type, description]
    );

    logger.info(`Credits added: User ${userId}, Amount: $${amount}, Type: ${type}`);

    return await this.getUserCredits(userId);
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const balance = await this.getUserCredits(userId);

    if (balance < amount) {
      logger.warn(`Insufficient credits: User ${userId}, Required: $${amount}, Balance: $${balance}`);
      return false;
    }

    // Deduct credits
    await query('UPDATE user_credits SET balance = balance - ? WHERE user_id = ?', [amount, userId]);

    // Log transaction
    await query(
      `INSERT INTO credit_transactions (id, user_id, amount, transaction_type, description)
       VALUES (?, ?, ?, 'usage', ?)`,
      [uuidv4(), userId, -amount, description]
    );

    logger.info(`Credits deducted: User ${userId}, Amount: $${amount}`);

    return true;
  }

  /**
   * Get credit transaction history
   */
  async getCreditHistory(userId: string, limit: number = 50): Promise<any[]> {
    const transactions: any = await query(
      `SELECT * FROM credit_transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    return Array.isArray(transactions) ? transactions : [];
  }

  /**
   * Process monthly overage charges using credits
   */
  async processOverageCharges(userId: string, amount: number): Promise<{
    success: boolean;
    paidFromCredits: number;
    remainingCharge: number;
  }> {
    const balance = await this.getUserCredits(userId);

    if (balance >= amount) {
      // Full payment from credits
      await this.deductCredits(userId, amount, 'Monthly overage charges');
      return {
        success: true,
        paidFromCredits: amount,
        remainingCharge: 0,
      };
    } else if (balance > 0) {
      // Partial payment from credits
      await this.deductCredits(userId, balance, 'Partial overage payment');
      return {
        success: false,
        paidFromCredits: balance,
        remainingCharge: amount - balance,
      };
    } else {
      // No credits available
      return {
        success: false,
        paidFromCredits: 0,
        remainingCharge: amount,
      };
    }
  }
}

export const creditService = new CreditService();

