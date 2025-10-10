/**
 * PayHere Service
 * Handles PayHere.lk payment gateway integration
 */

import axios from 'axios';
import { billingConfig } from '../../config/billing.js';
import {
  generatePayHereHash,
  generatePayHereOAuthHeader,
  formatPayHereAmount,
  generateOrderId,
} from '../../utils/payhere-hash.js';
import logger from '../../utils/logger.js';

export interface PayHereCheckoutData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  order_id: string;
  items: string;
  currency: string;
  recurrence?: string;
  duration?: string;
  amount: string;
  hash: string;
}

export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  status_message?: string;
  method?: string;
  card_holder_name?: string;
  card_no?: string;
}

export class PayHereService {
  private config = billingConfig.payhere;

  /**
   * Generate checkout data for PayHere payment form
   */
  async generateCheckoutData(
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address?: string;
      city?: string;
      country?: string;
    },
    paymentData: {
      orderId: string;
      items: string;
      amount: number;
      currency?: string;
      isRecurring?: boolean;
      recurrence?: string;
      duration?: string;
    }
  ): Promise<PayHereCheckoutData> {
    const currency = paymentData.currency || this.config.currency.default;
    const amount = formatPayHereAmount(paymentData.amount);

    const hash = generatePayHereHash(
      this.config.merchantId,
      paymentData.orderId,
      amount,
      currency,
      this.config.merchantSecret
    );

    const checkoutData: PayHereCheckoutData = {
      merchant_id: this.config.merchantId,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      address: userData.address || '',
      city: userData.city || '',
      country: userData.country || 'Sri Lanka',
      order_id: paymentData.orderId,
      items: paymentData.items,
      currency,
      amount,
      hash,
    };

    // Add recurring fields if applicable
    if (paymentData.isRecurring) {
      checkoutData.recurrence = paymentData.recurrence || '1 Month';
      checkoutData.duration = paymentData.duration || 'Forever';
    }

    return checkoutData;
  }

  /**
   * Create subscription checkout data
   */
  async createSubscriptionCheckout(
    user: any,
    plan: any,
    billingCycle: 'monthly' | 'annual'
  ): Promise<PayHereCheckoutData> {
    const orderId = generateOrderId('SUB');
    const amount = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
    const recurrence = billingCycle === 'annual' ? '1 Year' : '1 Month';

    const [firstName, ...lastNameParts] = user.full_name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    return this.generateCheckoutData(
      {
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || '',
      },
      {
        orderId,
        items: `${plan.name} - ${billingCycle} subscription`,
        amount,
        currency: plan.currency,
        isRecurring: true,
        recurrence,
        duration: 'Forever',
      }
    );
  }

  /**
   * Create one-time payment checkout (for credits, add-ons, etc.)
   */
  async createOneTimeCheckout(
    user: any,
    description: string,
    amount: number
  ): Promise<PayHereCheckoutData> {
    const orderId = generateOrderId('PAY');

    const [firstName, ...lastNameParts] = user.full_name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    return this.generateCheckoutData(
      {
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || '',
      },
      {
        orderId,
        items: description,
        amount,
        isRecurring: false,
      }
    );
  }

  /**
   * Get OAuth access token for Subscription Manager API
   */
  private async getAccessToken(): Promise<string> {
    try {
      const authHeader = generatePayHereOAuthHeader(this.config.appId, this.config.appSecret);

      const response = await axios.post(
        `${this.config.apiUrl}/oauth/token`,
        { grant_type: 'client_credentials' },
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      logger.error('Failed to get PayHere access token:', error);
      throw new Error('Failed to authenticate with PayHere');
    }
  }

  /**
   * Get subscription details from PayHere
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.config.apiUrl}/subscription/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get subscription from PayHere:', error);
      throw new Error('Failed to retrieve subscription details');
    }
  }

  /**
   * Retry failed payment for subscription
   */
  async retrySubscriptionPayment(subscriptionId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.config.apiUrl}/subscription/retry-payment`,
        { subscription_id: subscriptionId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`Payment retry initiated for subscription ${subscriptionId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to retry payment:', error);
      throw new Error('Failed to retry payment');
    }
  }

  /**
   * Cancel subscription at PayHere
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.config.apiUrl}/subscription/cancel`,
        { subscription_id: subscriptionId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`Subscription canceled at PayHere: ${subscriptionId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to cancel subscription at PayHere:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * List all subscriptions from PayHere
   */
  async listSubscriptions(): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.config.apiUrl}/subscription/list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to list subscriptions:', error);
      throw new Error('Failed to list subscriptions');
    }
  }
}

export const payhereService = new PayHereService();

