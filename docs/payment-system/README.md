# 💳 Payment System Documentation

Complete guides for the WhatsFlow payment and billing system.

---

## 📚 Documentation Files

| # | Document | Description | Audience |
|---|----------|-------------|----------|
| 01 | [Payment Failure System](./01.%20Payment%20Failure%20System.md) | **Critical** - Payment failure controls and access suspension | 🔒 Required |

---

## 🎯 Overview

WhatsFlow has a robust payment failure system that:

- ✅ **Immediately suspends** all features on payment failure
- ✅ **Automatically restores** access on payment success
- ✅ **Comprehensive logging** for monitoring
- ✅ **Retry mechanism** with escalation
- ✅ **User notifications** at every step

---

## 🚫 Payment Failure Flow

```
Payment Fails
    ↓
Status: past_due
    ↓
🚫 ALL FEATURES BLOCKED
    ↓
User Updates Payment
    ↓
Payment Succeeds
    ↓
✅ ACCESS RESTORED INSTANTLY
```

---

## 🔒 What Gets Blocked

### On Payment Failure:
- ❌ Sending messages (regular & AI)
- ❌ Broadcasting campaigns
- ❌ Adding contacts and devices
- ❌ Lead management operations
- ❌ All AI-powered features

### What Remains Available:
- ✅ View existing data (read-only)
- ✅ Update payment method
- ✅ View invoices
- ✅ Access account settings

---

## ✅ Automatic Restoration

When payment succeeds:
1. Subscription status → `active`
2. All features unlocked instantly
3. Subscription period extended
4. Retry attempts cleared
5. User notified

**Time to restore:** Instant (0 seconds)

---

## 📊 Subscription Statuses

| Status | Description | Access |
|--------|-------------|--------|
| **trial** | Free trial period | Full access |
| **active** | Payment current | Full access |
| **past_due** | Payment failed | 🚫 **BLOCKED** |
| **expired** | Subscription ended | 🚫 **BLOCKED** |
| **canceled** | User canceled | 🚫 **BLOCKED** |
| **paused** | Temporarily paused | 🚫 **BLOCKED** |

---

## 🔄 Payment Retry Schedule

| Attempt | Days After | Action |
|---------|-----------|---------|
| 1 | 3 days | Automated retry |
| 2 | 5 days | Retry + Warning email |
| 3 | 7 days | Retry + Final warning |
| 4 | 10 days | Manual intervention |

After 4 failed attempts → Account suspended until manual payment

---

## 🧪 Testing

### Simulate Payment Failure:
```sql
UPDATE subscriptions 
SET status = 'past_due' 
WHERE user_id = 'test-user-id';
```

### Simulate Payment Success:
```sql
UPDATE subscriptions 
SET status = 'active' 
WHERE user_id = 'test-user-id';
```

---

## 📈 Monitoring

### Check Payment Failures:
```bash
pm2 logs whatsflow-api | grep "PAYMENT FAILURE"
```

### Count Past Due Accounts:
```sql
SELECT COUNT(*) 
FROM subscriptions 
WHERE status = 'past_due';
```

---

## 🎯 Related Documentation

- **Billing System:** See [Implementation Tracking](../implementation-tracking/07.%20Phase%202%20Complete.md)
- **PayHere Setup:** See [Feature Implementations](../feature-implementations/07.%20PayHere%20Payment%20Setup.md)
- **Subscription Service:** `whatsflow/backend/src/services/billing/subscription.service.ts`
- **Payment Service:** `whatsflow/backend/src/services/billing/payment.service.ts`

---

## ✨ Key Features

- 🚫 **Immediate suspension** on payment failure
- ✅ **Automatic restoration** on payment success
- 📊 **Comprehensive logging** for monitoring
- 🔄 **Retry mechanism** with 4 attempts
- 📧 **User notifications** (planned)
- 🛡️ **Security controls** prevent unauthorized access

---

**Status:** ✅ Fully Implemented  
**Last Updated:** October 13, 2025

