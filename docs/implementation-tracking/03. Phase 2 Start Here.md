# Phase 2: Start Here - Quick Action Guide

**Before You Begin:** Read this first, then dive into `PHASE2_BILLING_PLAN.md` for full details.

---

## ✅ Phase 2 Planning Complete!

### What We're Building
A complete subscription billing system with:
- 4 plan tiers (Trial, Starter, Pro, Enterprise)
- PayHere.lk payment integration
- Usage tracking and enforcement
- Credit system for overages
- Admin panel for management
- Email notifications and invoices

### Profitability Confirmed ✅
- **Target:** 40% gross margin
- **Achieved:** 80-90% gross margin
- **AI Provider:** Gemini 2.0 Flash (most cost-effective at $0.0001/message)

---

## 🚀 Getting Started (Do This First!)

### Step 1: Set Up PayHere Account

1. **Go to:** https://www.payhere.lk/
2. **Register** for a merchant account
3. **Verify** your business details
4. **Switch to Sandbox** for development testing

### Step 2: Get PayHere Credentials

#### A. Merchant ID & Secret
1. Login to PayHere Dashboard
2. Navigate: **Side Menu → Integrations**
3. Click **"Add Domain/App"**
4. Enter: `app.whatsflow.ai` (or your domain)
5. **Request Approval** (may take 24-48 hours)
6. Once approved, you'll see **Merchant Secret**
7. Note both **Merchant ID** and **Merchant Secret**

#### B. App ID & Secret (for API)
1. In PayHere Dashboard: **Settings → API Keys**
2. Click **"Create New API Key"**
3. Enable permission: **"Automated Charging API"**
4. Whitelist domain: `api.whatsflow.ai`
5. Note **App ID** and **App Secret**

### Step 3: Add Credentials to Backend

Edit `/whatsflow/backend/.env`:

```env
# PayHere Configuration
PAYHERE_MERCHANT_ID=YOUR_MERCHANT_ID_HERE
PAYHERE_MERCHANT_SECRET=YOUR_MERCHANT_SECRET_HERE
PAYHERE_APP_ID=YOUR_APP_ID_HERE
PAYHERE_APP_SECRET=YOUR_APP_SECRET_HERE
PAYHERE_MODE=sandbox

# PayHere URLs (auto-configured based on mode)
PAYHERE_CHECKOUT_URL=https://sandbox.payhere.lk/pay/checkout
PAYHERE_API_URL=https://sandbox.payhere.lk/merchant/v1

# Your App URLs
PAYHERE_RETURN_URL=http://localhost:2153/billing/success
PAYHERE_CANCEL_URL=http://localhost:2153/billing/cancel
PAYHERE_NOTIFY_URL=http://localhost:2152/api/v1/billing/webhook

# Email Service
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@whatsflow.ai
```

---

## 📋 Implementation Order

### Week 1-2: Database & Core Services
**Start With:** Database setup
1. Run database migrations
2. Seed initial plans
3. Create services layer
4. Create basic API endpoints

**Priority Files:**
- Create migrations
- Create services
- Test services

### Week 2-3: PayHere Integration
**Focus:** Payment processing
1. Implement PayHere checkout
2. Implement webhook handler
3. Test in sandbox
4. Implement subscription management

### Week 3-4: Frontend
**Focus:** User experience
1. Create billing pages
2. Create subscription UI
3. Implement usage tracking display
4. Test user flows

### Week 4-5: Admin Panel
**Focus:** Admin tools
1. Implement admin backend
2. Create admin UI
3. Connect to real data
4. Test admin features

### Week 5-6: Enforcement & Credits
**Focus:** Usage limits
1. Implement usage checking
2. Create credit system
3. Add upgrade prompts
4. Test limit scenarios

### Week 6-7: Polish & Deploy
**Focus:** Production readiness
1. Email system
2. Invoice generation
3. Full testing
4. Production deployment

---

## 📊 Plan Summary

| Plan | Price/Month | Annual Price | Key Limits | AI Messages |
|------|-------------|--------------|------------|-------------|
| **Trial** | FREE (7 days) | - | 1 device, 100 contacts, 100 messages | 10 |
| **Starter** | $29 | $296.40 ($24.65/mo) | 2 devices, 1K contacts, 5K messages | 1,000 |
| **Professional** | $99 | $1,009.80 ($84.15/mo) | 5 devices, 10K contacts, 50K messages | 15,000 |
| **Enterprise** | $299 | $3,049.80 ($254.15/mo) | Unlimited everything | Unlimited |

**Add-ons:** +$10/month per additional device

---

## 💰 Cost Breakdown (Example: Professional Plan)

**Revenue:** $99/month

**Costs:**
- AI (Gemini): $1.51
- Infrastructure: $5.00
- PayHere fee: $3.50
- **Total Cost:** $10.01

**Gross Profit:** $88.99  
**Margin:** 90% ✅

---

## 🔧 Technical Stack

### Backend
- **Payment Gateway:** PayHere.lk
- **AI Provider:** Google Gemini 2.0 Flash
- **Email:** SendGrid or AWS SES
- **PDF Generation:** PDFKit or Puppeteer
- **Background Jobs:** Bull (existing)
- **Database:** MySQL (existing)

### Frontend
- **Billing UI:** Next.js components
- **Payment Forms:** PayHere hosted checkout
- **Charts:** Recharts (for usage graphs)

---

## ⚠️ Important Notes

### PayHere Specifics
1. **Webhook Security:** Always verify MD5 hash signature
2. **Currency:** PayHere supports LKR and USD
3. **Recurring Billing:** PayHere handles automatic charges
4. **Status Codes:**
   - `2` = Success
   - `0` = Pending
   - `-1` = Canceled
   - `-2` = Failed
   - `-3` = Chargedback

### Usage Enforcement
1. **Soft Limits:** Warn at 80%, 90%
2. **Hard Limits:** Block at 100% (unless credits available)
3. **Reset:** First day of billing period
4. **Overage Rates:**
   - Messages: $0.01 each
   - AI Messages: $0.02 each

### Trial System
1. **Auto-start:** On user registration
2. **Duration:** 7 days
3. **Limits:** 100 messages, 10 AI replies
4. **Conversion:** Auto-prompt for subscription on day 6
5. **Expiry:** Soft limits after trial (can upgrade anytime)

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `PHASE2_BILLING_PLAN.md` | Complete implementation details |
| `IMPLEMENTATION_TRACKER.md` | Progress tracking |
| `PLATFORM_EXPANSION_PLAN.md` | Overall roadmap |

---

## 🎯 Success Criteria

Phase 2 is complete when:
- [ ] Users can subscribe to plans via PayHere
- [ ] Recurring billing works automatically
- [ ] Usage is tracked and enforced
- [ ] Overages deduct from credits
- [ ] Admins can manage subscriptions
- [ ] Emails and invoices are sent
- [ ] Failed payments retry automatically
- [ ] All tests pass
- [ ] Deployed to production

---

## 🚨 Before You Start Coding

1. ✅ PayHere sandbox account set up
2. ✅ PayHere credentials obtained
3. ✅ Credentials added to `.env`
4. ✅ Read `PHASE2_BILLING_PLAN.md`
5. ✅ Understand database schema
6. ✅ Review AI cost analysis

---

## 🏁 Ready to Begin?

**Next Step:** Review `PHASE2_BILLING_PLAN.md` for detailed implementation instructions.

**Questions?** Review the plan documents or ask before starting implementation.

---

**Created:** October 10, 2025  
**Status:** Ready for Implementation  
**Estimated Duration:** 7 weeks  
**Confidence Level:** High (detailed plan with cost analysis)

