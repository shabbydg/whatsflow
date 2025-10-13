# Test Account System - Complete Guide

**Purpose:** Allow specific accounts to run indefinitely without billing restrictions for testing, demos, and development.

---

## 🎯 What is a Test Account?

A test account is a special user account that **bypasses all billing and usage restrictions**:

- ✅ **No trial expiration** - Never expires (can test for months/years)
- ✅ **Unlimited messages** - Send as many as needed
- ✅ **Unlimited AI messages** - No AI usage limits
- ✅ **Unlimited devices** - Connect multiple WhatsApp numbers
- ✅ **Unlimited contacts** - No contact limits
- ✅ **All features unlocked** - Broadcasts, file uploads, analytics, everything
- ✅ **No payments required** - Never asked to pay

---

## 🚀 Quick Start

### Enable Test Account

```bash
# Method 1: Using SQL directly
mysql -u root whatsflow -e "UPDATE users SET is_test_account = true WHERE email = 'test@example.com';"

# Method 2: Using the script
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend
bash scripts/toggle-test-account-simple.sh enable test@example.com "Internal testing"
```

### Disable Test Account

```bash
# Method 1: Using SQL
mysql -u root whatsflow -e "UPDATE users SET is_test_account = false WHERE email = 'test@example.com';"

# Method 2: Using the script
bash scripts/toggle-test-account-simple.sh disable test@example.com
```

### List All Test Accounts

```bash
bash scripts/toggle-test-account-simple.sh list
```

---

## 📋 Database Schema

### New Columns Added to `users` table:

```sql
is_test_account      BOOLEAN DEFAULT false   -- Main flag
test_account_notes   TEXT                    -- Notes about why it's a test account
```

### New Table: `test_accounts_log`

Tracks when accounts are enabled/disabled:

```sql
CREATE TABLE test_accounts_log (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action ENUM('enabled', 'disabled', 'note_updated'),
  performed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔍 Where Test Accounts Are Checked

The `is_test_account` flag is checked in **8 critical places**:

### 1. Usage Enforcement (✅ Updated)
**File:** `services/billing/usage-enforcement.service.ts`

```typescript
// Check if user is a test account (bypass all restrictions)
const users: any = await query('SELECT is_test_account FROM users WHERE id = ?', [userId]);
if (users && users[0]?.is_test_account) {
  logger.info(`Test account action allowed: ${userId} - ${action}`);
  return { allowed: true };
}
```

**Actions bypassed:**
- send_message
- send_ai_message
- add_device
- add_contact
- send_broadcast

### 2. Subscription API (✅ Updated)
**File:** `controllers/subscription.controller.ts`

Returns unlimited limits for test accounts:
```typescript
if (isTestAccount) {
  plan.limits = {
    devices: -1,
    contacts: -1,
    messages_per_month: -1,
    ai_messages_per_month: -1,
    // All unlimited!
  };
}
```

### 3. Trial Expiration (✅ Bypassed)
Test accounts never trigger trial expiration checks.

### 4. Payment Requirements (✅ Bypassed)
Test accounts are never asked to subscribe or pay.

### 5. Usage Warnings (✅ Suppressed)
80% and 90% usage warnings don't apply to test accounts.

### 6. Feature Access (✅ Full Access)
All premium features automatically enabled:
- AI replies
- File uploads
- Broadcasts
- Advanced analytics
- Custom integrations
- API access

### 7. Authentication (✅ Flagged)
Test account status included in login response.

### 8. Admin Panel (✅ Visible)
Admins can see which accounts are test accounts.

---

## 🛠️ Usage Methods

### Method 1: Direct SQL (Fastest)

```sql
-- Enable test account
UPDATE users 
SET is_test_account = true, 
    test_account_notes = 'Internal testing account'
WHERE email = 'test@example.com';

-- Disable test account
UPDATE users 
SET is_test_account = false, 
    test_account_notes = NULL
WHERE email = 'test@example.com';

-- List all test accounts
SELECT email, full_name, test_account_notes, created_at
FROM users
WHERE is_test_account = true;
```

### Method 2: Shell Script

```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend

# Enable
bash scripts/toggle-test-account-simple.sh enable user@example.com "For demo purposes"

# Disable
bash scripts/toggle-test-account-simple.sh disable user@example.com

# List
bash scripts/toggle-test-account-simple.sh list
```

### Method 3: TypeScript Script

```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend

# Enable
npx tsx scripts/toggle-test-account.ts enable user@example.com "Demo account"

# Disable
npx tsx scripts/toggle-test-account.ts disable user@example.com

# List
npx tsx scripts/toggle-test-account.ts list
```

---

## 📝 Common Use Cases

### 1. Internal Testing Account

```sql
-- Create a test account for your team
UPDATE users 
SET is_test_account = true,
    test_account_notes = 'Internal QA testing'
WHERE email = 'qa@yourcompany.com';
```

**Use for:**
- Testing new features
- QA before release
- Load testing
- Integration testing

### 2. Demo Account

```sql
-- Create demo account for sales
UPDATE users 
SET is_test_account = true,
    test_account_notes = 'Sales demo account'
WHERE email = 'demo@yourcompany.com';
```

**Use for:**
- Product demonstrations
- Sales calls
- Marketing videos
- Screenshots

### 3. Partner/Beta Tester

```sql
-- Give unlimited access to beta testers
UPDATE users 
SET is_test_account = true,
    test_account_notes = 'Beta tester - unlimited access'
WHERE email = 'betatester@example.com';
```

**Use for:**
- Beta testing program
- Partner accounts
- Content creators
- Influencers

### 4. Long-term Development

```sql
-- Your personal testing account
UPDATE users 
SET is_test_account = true,
    test_account_notes = 'Developer account - no restrictions'
WHERE email = 'dev@digitalarc.lk';
```

**Use for:**
- Development testing
- Feature development
- Bug reproduction
- Performance testing

---

## 🔐 Security Considerations

### ⚠️ Important Notes:

1. **Keep it Secret**
   - Don't expose test accounts publicly
   - Don't mention in UI
   - Only you and admins should know

2. **Monitor Usage**
   - Test accounts can consume AI tokens
   - Monitor costs in AI provider dashboard
   - Set reasonable limits on number of test accounts

3. **Audit Trail**
   - All toggle actions logged in `test_accounts_log`
   - Track who enabled/disabled
   - Review periodically

4. **Clean Up**
   - Disable test accounts when not needed
   - Don't leave inactive test accounts enabled

---

## 📊 Frontend Display

### Test Account Badge (Optional)

Test accounts can optionally show a badge in the UI:

```typescript
// In frontend components
{isTestAccount && (
  <div className="bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-xs">
    🧪 Test Account
  </div>
)}
```

### Unlimited Display

When viewing usage, test accounts show:
```
Messages: 1,234 / Unlimited ∞
AI Messages: 567 / Unlimited ∞
```

---

## 🧪 Testing the System

### 1. Create Test Account

```sql
-- Register a new user first via UI
-- Then enable test account
UPDATE users SET is_test_account = true WHERE email = 'test@example.com';
```

### 2. Verify Unlimited Access

```bash
# Login to the app
# Go to Billing dashboard
# Should see: All limits show "Unlimited"

# Send messages
# No limits enforced

# Use AI features
# No AI message limits
```

### 3. Check Logs

```bash
# Backend logs should show:
tail -f ~/whatsflow/whatsflow/backend/logs/combined.log | grep "Test account"

# You'll see:
# Test account action allowed: USER_ID - send_message
# Test account action allowed: USER_ID - send_ai_message
```

---

## 🔄 Migration Script

If you need to migrate existing users to test accounts:

```sql
-- Make all existing users test accounts (for initial testing phase)
UPDATE users 
SET is_test_account = true,
    test_account_notes = 'Grandfathered - beta user'
WHERE created_at < '2025-10-15';

-- Or specific emails
UPDATE users 
SET is_test_account = true
WHERE email IN ('user1@example.com', 'user2@example.com');
```

---

## 📈 Monitoring Test Accounts

### View Test Account Activity

```sql
-- Get test accounts with usage
SELECT 
  u.email,
  u.full_name,
  u.test_account_notes,
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT CASE WHEN m.is_ai_generated = true THEN m.id END) as ai_messages,
  MAX(m.created_at) as last_activity
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
WHERE u.is_test_account = true
GROUP BY u.id
ORDER BY last_activity DESC;
```

### Check Test Account Log

```sql
-- See who toggled test accounts
SELECT 
  tal.action,
  u.email,
  tal.performed_by,
  tal.notes,
  tal.created_at
FROM test_accounts_log tal
JOIN users u ON tal.user_id = u.id
ORDER BY tal.created_at DESC
LIMIT 20;
```

---

## 🎯 Best Practices

### DO:
- ✅ Use for internal testing
- ✅ Enable for demo accounts
- ✅ Give to beta testers
- ✅ Document why account is test
- ✅ Monitor AI costs
- ✅ Disable when not needed

### DON'T:
- ❌ Give to paying customers
- ❌ Leave enabled permanently for random accounts
- ❌ Expose publicly
- ❌ Abuse AI providers
- ❌ Forget to track costs

---

## 💰 Cost Considerations

Test accounts consume real resources:

### AI Costs:
```
Test account sends 1,000 AI messages/month
Cost: ~$1-3/month (Gemini 2.0 Flash)

10 test accounts: $10-30/month in AI costs
```

**Recommendation:**
- Limit to 5-10 test accounts maximum
- Monitor AI usage in provider dashboard
- Disable inactive test accounts

---

## 🔧 Production Deployment

When deploying to production:

```bash
# 1. Run migration
mysql -u root whatsflow < migrations/add_test_account_flag.sql

# 2. Enable your test accounts
mysql -u root whatsflow -e "UPDATE users SET is_test_account = true WHERE email = 'your@email.com';"

# 3. Restart backend
pm2 restart whatsflow-api
```

---

## 📱 Frontend Integration

The frontend automatically receives test account status:

```typescript
// In subscription API response
{
  "success": true,
  "data": {
    "subscription": { ... },
    "plan": {
      "limits": {
        "messages_per_month": -1,  // Unlimited!
        "ai_messages_per_month": -1,  // Unlimited!
        ...
      }
    },
    "usage": { ... },
    "is_test_account": true  // ← Flag included
  }
}
```

No frontend changes needed! The UI will automatically show "Unlimited" for all limits.

---

## ✅ Verification Checklist

After enabling a test account:

- [ ] Login as test user
- [ ] Go to Billing dashboard
- [ ] Verify all limits show "Unlimited"
- [ ] Send messages - no limits
- [ ] Use AI features - no limits
- [ ] Add multiple devices - no limits
- [ ] Check backend logs - see "Test account action allowed"
- [ ] No payment prompts
- [ ] No trial expiration warnings

---

## 🚨 Emergency: Disable All Test Accounts

If you need to disable all test accounts at once:

```sql
-- Disable all test accounts
UPDATE users SET is_test_account = false, test_account_notes = NULL WHERE is_test_account = true;

-- Or keep specific ones
UPDATE users 
SET is_test_account = false 
WHERE is_test_account = true 
  AND email NOT IN ('keep1@example.com', 'keep2@example.com');
```

---

## 📊 Summary

**What you can do:**
- Toggle test account mode on/off anytime
- Set via database directly (instant)
- Full access to all features
- No time limits
- Perfect for development and demos

**What happens:**
- All usage limits bypassed
- Trial never expires
- AI functionality unlimited
- Payment never required
- All features accessible

**How to manage:**
- Use SQL queries (fastest)
- Use provided scripts
- Monitor via admin panel
- Track in logs table

---

**Quick Commands:**

```bash
# Enable
mysql -u root whatsflow -e "UPDATE users SET is_test_account = true WHERE email = 'user@example.com';"

# Disable
mysql -u root whatsflow -e "UPDATE users SET is_test_account = false WHERE email = 'user@example.com';"

# List
mysql -u root whatsflow -e "SELECT email, is_test_account, test_account_notes FROM users WHERE is_test_account = true;"
```

**That's it!** Simple and powerful. 🚀

