/**
 * Email Templates for Billing
 * HTML email templates for billing-related notifications
 */

export const emailTemplates = {
  /**
   * Welcome + Trial Started Email
   */
  trialStarted: (name: string, trialEndsAt: Date) => ({
    subject: 'Welcome to WhatsFlow! Your Free Trial Has Started 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WhatsFlow!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for signing up! Your <strong>7-day free trial</strong> has started.</p>
            
            <h3>What's Included in Your Trial:</h3>
            <ul>
              <li>✅ 100 WhatsApp messages</li>
              <li>✅ 10 AI-powered replies</li>
              <li>✅ 1 WhatsApp device</li>
              <li>✅ Basic AI messaging & web scraping (10 pages)</li>
            </ul>
            
            <p>Your trial expires on <strong>${trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
            </center>
            
            <p>Questions? Reply to this email or visit our support center.</p>
          </div>
          <div class="footer">
            <p>WhatsFlow - AI-Powered WhatsApp Automation</p>
            <p><a href="${process.env.FRONTEND_URL}/privacy">Privacy Policy</a> | <a href="${process.env.FRONTEND_URL}/terms">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  /**
   * Trial Ending Soon Email (2 days before)
   */
  trialEndingSoon: (name: string, trialEndsAt: Date, daysRemaining: number) => ({
    subject: `Your WhatsFlow Trial Ends in ${daysRemaining} Days`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #856404;">⏰ Trial Ending Soon</h2>
          </div>
          
          <p>Hi ${name},</p>
          <p>Your WhatsFlow free trial ends in <strong>${daysRemaining} days</strong> (${trialEndsAt.toLocaleDateString()}).</p>
          <p>To continue using WhatsFlow without interruption, subscribe to a plan:</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/billing/plans" style="display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Plans</a>
          </center>
          
          <p>Have questions? Our team is here to help!</p>
        </div>
      </body>
      </html>
    `,
  }),

  /**
   * Subscription Activated Email
   */
  subscriptionActivated: (name: string, planName: string, price: number, billingCycle: string, nextBillingDate: Date) => ({
    subject: 'Your WhatsFlow Subscription is Active! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>✅ Subscription Activated!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px;">
            <p>Hi ${name},</p>
            <p>Your <strong>${planName}</strong> subscription is now active!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Subscription Details</h3>
              <table style="width: 100%;">
                <tr><td><strong>Plan:</strong></td><td>${planName}</td></tr>
                <tr><td><strong>Price:</strong></td><td>$${price.toFixed(2)} USD</td></tr>
                <tr><td><strong>Billing:</strong></td><td>${billingCycle === 'annual' ? 'Annually' : 'Monthly'}</td></tr>
                <tr><td><strong>Next billing date:</strong></td><td>${nextBillingDate.toLocaleDateString()}</td></tr>
              </table>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Billing Dashboard</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  /**
   * Payment Failed Email
   */
  paymentFailed: (name: string, amount: number, reason?: string) => ({
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fee2e2; padding: 20px; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #991b1b;">❌ Payment Failed</h2>
          </div>
          
          <p>Hi ${name},</p>
          <p>We were unable to process your payment of <strong>$${amount.toFixed(2)}</strong>.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          
          <p>Please update your payment method to continue using WhatsFlow.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/billing/settings" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Update Payment Method</a>
          </center>
          
          <p>We'll automatically retry the payment in 3 days.</p>
        </div>
      </body>
      </html>
    `,
  }),

  /**
   * Usage Warning Email (80%)
   */
  usageWarning: (name: string, resource: string, percentage: number, current: number, limit: number) => ({
    subject: `You've Used ${percentage.toFixed(0)}% of Your ${resource}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #856404;">⚠️ Usage Alert</h2>
          </div>
          
          <p>Hi ${name},</p>
          <p>You've used <strong>${current.toLocaleString()} of ${limit.toLocaleString()}</strong> ${resource} this month (${percentage.toFixed(0)}%).</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <div style="background: #e5e7eb; border-radius: 4px; height: 20px; overflow: hidden;">
              <div style="background: ${percentage >= 90 ? '#ef4444' : '#fbbf24'}; width: ${percentage}%; height: 100%;"></div>
            </div>
          </div>
          
          <p>Consider upgrading your plan to avoid hitting your limit:</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/billing/plans" style="display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Plans</a>
          </center>
        </div>
      </body>
      </html>
    `,
  }),

  /**
   * Invoice Email
   */
  invoice: (name: string, invoiceNumber: string, amount: number, date: Date, downloadUrl: string) => ({
    subject: `Invoice ${invoiceNumber} from WhatsFlow`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Invoice ${invoiceNumber}</h2>
          
          <p>Hi ${name},</p>
          <p>Thank you for your payment of <strong>$${amount.toFixed(2)}</strong> on ${date.toLocaleDateString()}.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td><strong>Invoice Number:</strong></td><td>${invoiceNumber}</td></tr>
              <tr><td><strong>Date:</strong></td><td>${date.toLocaleDateString()}</td></tr>
              <tr><td><strong>Amount:</strong></td><td>$${amount.toFixed(2)} USD</td></tr>
              <tr><td><strong>Status:</strong></td><td><span style="color: #10b981;">✓ Paid</span></td></tr>
            </table>
          </div>
          
          <center>
            <a href="${downloadUrl}" style="display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Download Invoice (PDF)</a>
          </center>
        </div>
      </body>
      </html>
    `,
  }),

  /**
   * Subscription Canceled Email
   */
  subscriptionCanceled: (name: string, planName: string, accessUntil?: Date) => ({
    subject: 'Your WhatsFlow Subscription Has Been Canceled',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Subscription Canceled</h2>
          
          <p>Hi ${name},</p>
          <p>Your <strong>${planName}</strong> subscription has been canceled.</p>
          
          ${accessUntil ? `
            <p>You'll continue to have access to WhatsFlow until <strong>${accessUntil.toLocaleDateString()}</strong>.</p>
          ` : `
            <p>Your access has ended immediately.</p>
          `}
          
          <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/billing/plans" style="display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reactivate Subscription</a>
          </center>
          
          <p>Have feedback? We'd love to hear from you!</p>
        </div>
      </body>
      </html>
    `,
  }),
};

