/**
 * Invoice Service
 * Handles invoice generation and PDF creation
 */

import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class InvoiceService {
  private invoicesDir: string;

  constructor() {
    this.invoicesDir = path.join(__dirname, '../../../uploads/invoices');
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  /**
   * Create invoice for payment
   */
  async createInvoice(paymentId: string): Promise<string> {
    try {
      // Get payment details
      const payments: any = await query(
        `SELECT 
          p.*,
          u.email, u.full_name,
          bp.business_name, bp.business_address
        FROM payments p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN business_profiles bp ON u.id = bp.user_id
        WHERE p.id = ?`,
        [paymentId]
      );

      if (!Array.isArray(payments) || payments.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = payments[0];

      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber();

      // Generate PDF
      const pdfPath = await this.generatePDF(payment, invoiceNumber);

      // Update payment with invoice info
      await query(
        'UPDATE payments SET invoice_number = ?, invoice_url = ? WHERE id = ?',
        [invoiceNumber, `/api/v1/billing/invoices/${invoiceNumber}.pdf`, paymentId]
      );

      logger.info(`Invoice generated: ${invoiceNumber} for payment ${paymentId}`);

      return invoiceNumber;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Generate PDF invoice (simple HTML version)
   * In production, use a library like puppeteer or PDFKit
   */
  private async generatePDF(payment: any, invoiceNumber: string): Promise<string> {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #9333ea; }
          .invoice-details { margin: 30px 0; }
          .invoice-details table { width: 100%; }
          .invoice-details td { padding: 8px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .items-table th { background: #f3f4f6; }
          .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 60px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">WhatsFlow</div>
          <h1>INVOICE</h1>
        </div>

        <div class="invoice-details">
          <table>
            <tr>
              <td><strong>Invoice Number:</strong></td>
              <td>${invoiceNumber}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${new Date(payment.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td>${payment.status.toUpperCase()}</td>
            </tr>
          </table>
        </div>

        <div>
          <strong>Bill To:</strong><br>
          ${payment.full_name}<br>
          ${payment.business_name || ''}<br>
          ${payment.email}<br>
          ${payment.business_address || ''}
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${payment.description || 'WhatsFlow Subscription'}</td>
              <td>$${payment.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Total: $${payment.amount.toFixed(2)} USD
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>WhatsFlow Inc. | support@whatsflow.ai | https://whatsflow.ai</p>
        </div>
      </body>
      </html>
    `;

    // Save HTML invoice (in production, convert to PDF using puppeteer or similar)
    const filePath = path.join(this.invoicesDir, `${invoiceNumber}.html`);
    fs.writeFileSync(filePath, invoiceHTML);

    // TODO: In production, use puppeteer or PDFKit to generate actual PDF
    // Example:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(invoiceHTML);
    // await page.pdf({ path: pdfPath, format: 'A4' });
    // await browser.close();

    return filePath;
  }

  /**
   * Get invoice by number
   */
  async getInvoice(invoiceNumber: string): Promise<string | null> {
    const filePath = path.join(this.invoicesDir, `${invoiceNumber}.html`);
    
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }

    return null;
  }
}

export const invoiceService = new InvoiceService();

