# WhatsFlow Billing System - Testing Guide

**Phase:** 2A + 2B Complete  
**Status:** Ready for End-to-End Testing

---

## Prerequisites

### 1. Database Setup

```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend

# Run migrations
mysql -u root whatsflow < migrations/create_billing_system.sql
mysql -u root whatsflow < migrations/seed_plans.sql
```

**Important:** Before running `seed_plans.sql`, generate admin password:

```bash
# Generate bcrypt hash for password "Admin@123"
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123', 10));"

# Copy the output and replace line 132 in seed_plans.sql:
# OLD: '$2a$10$rQ8Ks9LhFxEKxK5K5K5K5OeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'
# NEW: 'YOUR_GENERATED_HASH_HERE'
```

### 2. PayHere Account Setup

See `PAYHERE_SETUP_GUIDE.md` for detailed instructions.

**Quick version:**
1. Go to https://www.payhere.lk/
2. Register sandbox account
3. Get Merchant ID & Secret
4. Create API Keys
5. Add credentials to `.env`

### 3. Environment Variables

Edit `/whatsflow/backend/.env`:

```env
# PayHere (replace with your credentials)
PAYHERE_MERCHANT_ID=1234567
PAYHERE_MERCHANT_SECRET=your_secret_here
PAYHERE_APP_ID=your_app_id
PAYHERE_APP_SECRET=your_app_secret
PAYHERE_MODE=sandbox

# URLs
PAYHERE_RETURN_URL=http://localhost:2153/billing/success
PAYHERE_CANCEL_URL=http://localhost:2153/billing/cancel
PAYHERE_NOTIFY_URL=http://localhost:2152/api/v1/billing/webhook
```

---

## Test Scenarios

### Scenario 1: New User Registration & Trial

**Expected Flow:**
1. User registers
2. Trial automatically starts
3. User gets 7 days, 100 messages, 10 AI replies

**Steps:**
```bash
# 1. Register user
curl -X POST http://localhost:2152/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Save the token from response

# 2. Check subscription
curl http://localhost:2152/api/v1/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: status = "trial", plan_id = trial plan ID

# 3. Check usage
curl http://localhost:2152/api/v1/subscription/usage \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: All usage at 0
```

**Verify in Database:**
```sql
SELECT u.email, s.status, p.name as plan, s.trial_ends_at
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN plans p ON s.plan_id = p.id
WHERE u.email = 'testuser@example.com';

-- Should show trial subscription
```

---

### Scenario 2: View Plans

**Steps:**
```bash
curl http://localhost:2152/api/v1/plans
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Trial",
      "slug": "trial",
      "price_monthly": 0,
      "price_annual": 0,
      ...
    },
    {
      "name": "Starter",
      "price_monthly": 29,
      "price_annual": 296.40,
      ...
    },
    {
      "name": "Professional",
      "price_monthly": 99,
      ...
    },
    {
      "name": "Enterprise",
      "price_monthly": 299,
      ...
    }
  ]
}
```

---

### Scenario 3: Subscribe to Plan

**Steps:**

1. **Frontend Test:**
   - Login at http://localhost:2153
   - Click "Billing" in sidebar
   - Click "Plans"
   - Select "Starter" plan
   - Choose "Monthly"
   - Click "Select Plan"
   - Should redirect to PayHere

2. **API Test:**
```bash
# Get plan ID first
PLAN_ID="get-from-plans-api"

# Subscribe
curl -X POST http://localhost:2152/api/v1/subscription/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "plan_id": "'$PLAN_ID'",
    "billing_cycle": "monthly"
  }'

# Response includes PayHere checkout data
```

**Expected:**
- Returns checkout object with hash
- Creates payment record (status: pending)
- Frontend redirects to PayHere

---

### Scenario 4: Complete Payment (Sandbox)

**Steps:**

1. After redirect to PayHere sandbox:
2. Fill in payment form:
   - **Card:** `5111111111111118`
   - **CVV:** `123`
   - **Expiry:** `12/25`
   - **Name:** `Test User`
3. Click "Pay"
4. Should redirect to `http://localhost:2153/billing/success`
5. PayHere sends webhook to backend

**Verify in Database:**
```sql
-- Check subscription status
SELECT status, payhere_payment_id FROM subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com');
-- Should be "active"

-- Check payment
SELECT status, amount, payhere_payment_id FROM payments
ORDER BY created_at DESC LIMIT 1;
-- Should be "succeeded"
```

---

### Scenario 5: Check Usage Tracking

**After sending some messages:**

```bash
curl http://localhost:2152/api/v1/subscription/usage \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "usage": {
      "messages_sent": 5,
      "ai_messages_count": 2,
      "contacts_count": 3,
      "devices_used": 1,
      ...
    },
    "percentages": {
      "messages": 0.1,
      "ai_messages": 0.2
    }
  }
}
```

---

### Scenario 6: Cancel Subscription

**Steps:**

```bash
# Cancel at end of period
curl -X POST http://localhost:2152/api/v1/subscription/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"immediately": false}'

# Check status
curl http://localhost:2152/api/v1/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should show cancel_at_period_end = true
```

---

### Scenario 7: Webhook Simulation

If PayHere webhook doesn't fire, you can simulate it:

```bash
# Calculate hash first (use the hash generation logic)
# Then POST to webhook

curl -X POST http://localhost:2152/api/v1/billing/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'merchant_id=YOUR_MERCHANT_ID' \
  -d 'order_id=ORDER_ID_FROM_PAYMENT' \
  -d 'payment_id=PAYMENT123' \
  -d 'payhere_amount=29.00' \
  -d 'payhere_currency=USD' \
  -d 'status_code=2' \
  -d 'md5sig=CALCULATED_HASH'
```

**Status Codes:**
- `2` = Success
- `-2` = Failed
- `0` = Pending

---

## Frontend Testing

### 1. Start Apps

```bash
# Terminal 1: Backend
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend
npm run dev

# Terminal 2: Frontend
cd /Users/digitalarc/Development/Webroot/whatsflow/frontend
npm run dev
```

### 2. Test User Journey

#### A. Registration:
1. http://localhost:2153/register
2. Create account
3. Login
4. Should auto-start trial

#### B. View Billing:
1. Click "Billing" in sidebar
2. Should see:
   - Trial status card
   - Usage progress bars (0%)
   - Quick action buttons

#### C. View Plans:
1. Click "Plans" submenu
2. Should see 4 plan cards
3. Toggle Monthly/Annual
4. Prices should update
5. Annual shows "Save 15%"

#### D. Subscribe:
1. Click "Select Plan" on Starter
2. See "Redirecting..." message
3. Auto-redirects to PayHere sandbox
4. Complete payment with test card
5. Redirected to success page
6. Auto-redirects to billing dashboard after 5 seconds

#### E. Check Active Subscription:
1. Billing dashboard
2. Should show "Active" status
3. Usage bars still at 0%
4. Plan details displayed

#### F. View Invoices:
1. Click "Invoices" submenu
2. Should see payment in table
3. Status: "SUCCEEDED"
4. Amount: $29.00 (or your plan price)

#### G. Cancel:
1. Billing → Settings
2. Click "Cancel Subscription"
3. Choose cancellation type
4. Confirm
5. Should see cancellation notice

---

## Common Issues & Solutions

### Issue: "No subscription found"
**Solution:** User might not have trial started. Check database:
```sql
SELECT * FROM subscriptions WHERE user_id = 'USER_ID';
```

### Issue: "Invalid hash" on webhook
**Solution:** 
- Check PAYHERE_MERCHANT_SECRET is correct
- No extra spaces in .env
- Verify hash calculation matches PayHere docs

### Issue: "Payment succeeds but subscription not activated"
**Solution:**
- Check backend logs for webhook
- Verify webhook URL is accessible
- For local testing, use ngrok
- Check payment_retry_log table

### Issue: Usage not updating
**Solution:**
- Usage tracking initialized on subscription creation
- Check usage_tracking table exists
- Verify subscription_id is correct

---

## Database Queries for Debugging

```sql
-- View all subscriptions
SELECT 
  u.email,
  p.name as plan,
  s.status,
  s.billing_cycle,
  s.current_price,
  s.trial_ends_at,
  s.next_billing_date
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN plans p ON s.plan_id = p.id;

-- View all payments
SELECT 
  u.email,
  p.amount,
  p.status,
  p.payhere_order_id,
  p.invoice_number,
  p.created_at
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- View usage
SELECT 
  u.email,
  ut.messages_sent,
  ut.ai_messages_count,
  ut.contacts_count,
  ut.period_start,
  ut.period_end
FROM usage_tracking ut
JOIN users u ON ut.user_id = u.id;

-- Check trial users
SELECT email, trial_used, trial_started_at FROM users;
```

---

## Ngrok Setup (for Webhook Testing)

### Why Needed:
PayHere needs to send webhooks to your backend, but localhost isn't publicly accessible.

### Setup:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start ngrok
ngrok http 2152

# You'll see output like:
# Forwarding: https://abc123.ngrok.io -> http://localhost:2152
```

### Update .env:

```env
PAYHERE_NOTIFY_URL=https://abc123.ngrok.io/api/v1/billing/webhook
```

### Restart backend:
```bash
npm run dev
```

Now PayHere can send webhooks to your local backend!

---

## Success Criteria

Phase 2A + 2B is successful when:

- [x] ✅ Database tables created
- [x] ✅ Plans seeded
- [x] ✅ API endpoints working
- [x] ✅ Frontend pages created
- [ ] ⏳ PayHere credentials configured (user action)
- [ ] ⏳ Test payment completes successfully
- [ ] ⏳ Webhook activates subscription
- [ ] ⏳ Usage tracking updates

---

## Next Phase Options

### Option A: Complete Phase 2 (Recommended)
Continue with:
- **Phase 2D:** Admin panel backend (Week 4-5)
- **Phase 2E:** Usage enforcement (Week 5-6)
- **Phase 2F:** Emails & invoices (Week 6-7)

### Option B: Test & Deploy Current
1. Set up PayHere production
2. Test thoroughly
3. Deploy to staging
4. Conduct user testing

### Option C: Start Phase 3
Begin admin panel features before finishing billing

---

**Testing Status:** Ready  
**Next Action:** Set up PayHere sandbox account and test payment flow

---

*For PayHere setup, see: `PAYHERE_SETUP_GUIDE.md`*

