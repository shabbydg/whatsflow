/**
 * PayHere Hash Generation and Verification Utilities
 * Handles MD5 hash generation for PayHere payment security
 */

import crypto from 'crypto';

/**
 * Generate PayHere checkout hash
 * Used when creating a payment form to redirect to PayHere
 */
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string
): string {
  // Step 1: Hash the merchant secret
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  // Step 2: Hash the concatenated string
  const hash = crypto
    .createHash('md5')
    .update(merchantId + orderId + amount + currency + hashedSecret)
    .digest('hex')
    .toUpperCase();

  return hash;
}

/**
 * Verify PayHere notification hash
 * Used to verify webhook notifications from PayHere are authentic
 */
export function verifyPayHereNotification(
  merchantId: string,
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  md5sig: string,
  merchantSecret: string
): boolean {
  // Step 1: Hash the merchant secret
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  // Step 2: Generate expected hash
  const localHash = crypto
    .createHash('md5')
    .update(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret)
    .digest('hex')
    .toUpperCase();

  // Step 3: Compare hashes
  return localHash === md5sig;
}

/**
 * Generate OAuth Authorization header for PayHere Subscription Manager API
 */
export function generatePayHereOAuthHeader(appId: string, appSecret: string): string {
  const credentials = `${appId}:${appSecret}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return `Basic ${base64Credentials}`;
}

/**
 * Format amount for PayHere (must be string with 2 decimal places)
 */
export function formatPayHereAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Generate unique order ID for PayHere
 */
export function generateOrderId(prefix: string = 'ORD'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Parse PayHere status code to readable status
 */
export function parsePayHereStatus(statusCode: string): {
  status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'chargedback';
  message: string;
} {
  switch (statusCode) {
    case '2':
      return { status: 'succeeded', message: 'Payment successful' };
    case '0':
      return { status: 'pending', message: 'Payment pending' };
    case '-1':
      return { status: 'canceled', message: 'Payment canceled' };
    case '-2':
      return { status: 'failed', message: 'Payment failed' };
    case '-3':
      return { status: 'chargedback', message: 'Payment chargedback' };
    default:
      return { status: 'failed', message: 'Unknown status' };
  }
}

