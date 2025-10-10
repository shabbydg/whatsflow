# PayHere Setup Guide

**For:** WhatsFlow Billing System  
**Provider:** PayHere.lk (Sri Lanka)

---

## Step 1: Create PayHere Account

1. Go to https://www.payhere.lk/
2. Click **"Sign Up"** or **"Create Account"**
3. Choose **"Business Account"**
4. Fill in your business details
5. Verify your email
6. Complete KYC (Know Your Customer) verification

---

## Step 2: Enable Sandbox Mode (For Testing)

1. Login to PayHere Dashboard
2. Look for **Sandbox/Test Mode** toggle
3. Enable it for testing
4. You'll get separate credentials for sandbox

**Important:** Use sandbox for all development and testing!

---

## Step 3: Get Merchant ID & Secret

### A. Add Your Domain

1. In PayHere Dashboard, go to: **Side Menu → Integrations**
2. Click **"Add Domain/App"**
3. Enter your domains:
   - Development: `localhost`
   - Production: `app.whatsflow.ai`
4. Click **"Request Approval"**
5. Wait for approval (usually 24-48 hours, can be instant for sandbox)

### B. Get Merchant Secret

Once approved:
1. Go back to **Integrations**
2. You'll see your domain listed
3. Click to view details
4. Copy the **Merchant Secret**
5. Your **Merchant ID** is shown in your account dashboard

### Where to Find:
- **Merchant ID:** Dashboard → Account Settings (top section)
- **Merchant Secret:** Dashboard → Integrations → Your Domain → View Secret

---

## Step 4: Create API Keys (For Subscription Manager)

1. In PayHere Dashboard, go to: **Settings → API Keys**
2. Click **"Create New API Key"**
3. Give it a name: `WhatsFlow Subscription Manager`
4. Enable permission: **"Automated Charging API"** ✅
5. Add authorized domains:
   - Development: `localhost`
   - Production: `api.whatsflow.ai`
6. Click **"Create"**
7. Copy the **App ID** and **App Secret**

**Important:** Save these immediately - you can't view App Secret again!

---

## Step 5: Configure Backend

### Add to `/whatsflow/backend/.env`

```env
# ==================== PAYHERE CONFIGURATION ====================

# Merchant Credentials (from Step 3)
PAYHERE_MERCHANT_ID=1234567
PAYHERE_MERCHANT_SECRET=YOUR_MERCHANT_SECRET_HERE

# API Credentials (from Step 4)
PAYHERE_APP_ID=YOUR_APP_ID_HERE
PAYHERE_APP_SECRET=YOUR_APP_SECRET_HERE

# Mode: 'sandbox' for testing, 'live' for production
PAYHERE_MODE=sandbox

# Callback URLs (Update for production)
PAYHERE_RETURN_URL=http://localhost:2153/billing/success
PAYHERE_CANCEL_URL=http://localhost:2153/billing/cancel
PAYHERE_NOTIFY_URL=http://localhost:2152/api/v1/billing/webhook

# ==================== EMAIL CONFIGURATION ====================

EMAIL_FROM=noreply@whatsflow.ai
EMAIL_REPLY_TO=support@whatsflow.ai

# Choose email service (sendgrid, ses, or smtp)
EMAIL_SERVICE=smtp

# For SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Step 6: Test PayHere Integration

### A. Test in Sandbox

1. Create test user in your app
2. Subscribe to a plan
3. You'll be redirected to PayHere sandbox
4. Use test card details:
   - **Card Number:** `5111111111111118` (Visa)
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date
   - **Name:** Any name
5. Complete payment
6. Should redirect back to your app
7. Check database - subscription should be active

### B. Test Webhook

1. Make a payment (as above)
2. Check backend logs for webhook notification
3. Verify payment record created
4. Verify subscription activated

---

## Step 7: Production Setup

### When Ready to Go Live:

1. **Get Live Credentials:**
   - Complete full KYC verification
   - Add production domain
   - Get live Merchant ID & Secret
   - Create live API keys

2. **Update Environment:**
   ```env
   PAYHERE_MODE=live
   PAYHERE_NOTIFY_URL=https://api.whatsflow.ai/api/v1/billing/webhook
   PAYHERE_RETURN_URL=https://app.whatsflow.ai/billing/success
   PAYHERE_CANCEL_URL=https://app.whatsflow.ai/billing/cancel
   ```

3. **Configure Webhook URL:**
   - Ensure your production webhook URL is publicly accessible
   - PayHere needs to reach it to send notifications
   - Use HTTPS in production

4. **Test with Real Money:**
   - Start with small amounts
   - Monitor first few transactions closely
   - Verify webhooks are received

---

## PayHere Dashboard Overview

### Key Sections:

1. **Dashboard** - Overview, recent transactions
2. **Transactions** - All payment history
3. **Subscriptions** - Recurring billing list
4. **Settlements** - Payout schedule
5. **Integrations** - Domain/app setup
6. **Settings** - API keys, webhooks
7. **Reports** - Financial reports

---

## Testing Cards (Sandbox Only)

| Card Number | Type | Result |
|-------------|------|--------|
| `5111111111111118` | Visa | Success |
| `4916217501611292` | Visa | Success |
| `5313581000123430` | MasterCard | Success |
| `4444444444444444` | Visa | Failed |

**All test cards:**
- CVV: Any 3 digits
- Expiry: Any future date  
- Name: Any name

---

## Webhook Configuration

### Important:

1. **Webhook URL must be publicly accessible**
   - For local testing, use ngrok: `ngrok http 2152`
   - Update `PAYHERE_NOTIFY_URL` to ngrok URL
   - Example: `https://abc123.ngrok.io/api/v1/billing/webhook`

2. **Webhook must return 200 OK**
   - Our implementation does this
   - PayHere retries if not 200

3. **Webhook verification**
   - We verify MD5 signature
   - Invalid signatures are rejected

---

## Troubleshooting

### Issue: "Invalid Merchant ID"
- **Solution:** Check PAYHERE_MERCHANT_ID in .env
- Verify it matches PayHere dashboard

### Issue: "Invalid Hash"
- **Solution:** Check PAYHERE_MERCHANT_SECRET
- Ensure no extra spaces in .env

### Issue: "Webhook not received"
- **Solution:** 
  - Check webhook URL is publicly accessible
  - Use ngrok for local testing
  - Check PayHere dashboard logs

### Issue: "Payment succeeds but subscription not activated"
- **Solution:**
  - Check backend logs
  - Verify webhook received
  - Check database for payment record

---

## PayHere Support

- **Documentation:** https://support.payhere.lk/
- **Recurring API:** https://support.payhere.lk/api-&-mobile-sdk/recurring-api
- **Subscription Manager:** https://support.payhere.lk/api-&-mobile-sdk/subscription-manager-api
- **Support Email:** support@payhere.lk
- **Dashboard:** https://www.payhere.lk/ (live) or https://sandbox.payhere.lk/ (sandbox)

---

## Security Checklist

- [ ] Merchant Secret stored in .env (never committed)
- [ ] App Secret stored in .env (never committed)
- [ ] Webhook signature verified
- [ ] HTTPS used in production
- [ ] PayHere credentials rotated periodically
- [ ] Production mode only enabled when ready
- [ ] Test cards only used in sandbox

---

## Quick Reference

| Item | Location |
|------|----------|
| Merchant ID | Dashboard → Account Settings |
| Merchant Secret | Integrations → Your Domain |
| App ID | Settings → API Keys |
| App Secret | Settings → API Keys (shown once) |
| Test Cards | Dashboard → Sandbox → Test Cards |
| Webhooks | Transaction details |
| Subscriptions | Dashboard → Subscriptions |

---

**Setup Status:** Complete this guide before testing payments  
**Next Step:** Test registration → Trial → Subscription flow

---

*Need help? Check PayHere documentation or contact support@payhere.lk*

