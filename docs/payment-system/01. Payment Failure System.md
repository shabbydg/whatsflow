# 🚫 Payment Failure & Access Control System

## 🎯 Overview

WhatsFlow has a **strict payment failure control system** that immediately suspends all features when a payment fails or a card is declined. This ensures that:

1. ✅ **Immediate suspension** of all features on payment failure
2. ✅ **Automatic restoration** when payment succeeds
3. ✅ **Comprehensive logging** for monitoring
4. ✅ **Payment retry mechanism** with escalation
5. ✅ **User notifications** at every step

---

## 🔒 Payment Failure Flow

### **When Payment Fails:**

```
Payment Webhook Received
      ↓
Payment Status: FAILED
      ↓
Subscription Status → past_due
      ↓
🚫 ALL FEATURES IMMEDIATELY BLOCKED
      ↓
Schedule Payment Retry (3-7 days)
      ↓
Send Notification to User
      ↓
User Updates Payment Method
      ↓
Payment Retry Succeeds
      ↓
✅ ACCESS IMMEDIATELY RESTORED
```

---

## 🛑 Blocked Actions on Payment Failure

When a subscription enters `past_due` status, the following actions are **IMMEDIATELY BLOCKED**:

### **Messaging:**
- ❌ Sending messages
- ❌ Sending AI-powered messages
- ❌ Broadcasting campaigns
- ❌ Scheduling messages

### **Contact Management:**
- ❌ Adding new contacts
- ❌ Importing contacts
- ❌ Updating contact lists

### **Device Management:**
- ❌ Adding new devices
- ❌ Connecting WhatsApp devices
- ❌ Managing device sessions

### **Lead Management:**
- ❌ Creating new leads
- ❌ Updating lead information
- ❌ Lead scoring and tracking
- ❌ Lead intelligence features

### **AI Features:**
- ❌ AI-powered auto-replies
- ❌ Knowledge base access
- ❌ Profile scraping
- ❌ Smart responses

### **What Users CAN Still Do:**
- ✅ View existing data (read-only access)
- ✅ Update payment method
- ✅ View invoices and payment history
- ✅ Contact support
- ✅ Access account settings

---

## 🔄 Payment Retry Mechanism

### **Retry Schedule:**

| Attempt | Days After Failure | Status |
|---------|-------------------|---------|
| 1 | 3 days | Automated retry |
| 2 | 5 days | Automated retry + Warning email |
| 3 | 7 days | Automated retry + Final warning |
| 4 | 10 days | Manual intervention required |

### **After 4 Failed Attempts:**
- 🚫 Subscription moves to `expired` status
- 📧 Final notice sent to user
- 💰 Manual payment required to reactivate
- 🔒 Account remains in read-only mode

---

## ✅ Automatic Access Restoration

### **When Payment Succeeds:**

1. **Immediate Actions:**
   - ✅ Subscription status → `active`
   - ✅ All features unlocked instantly
   - ✅ Usage tracking resumed
   - ✅ Pending retry attempts cleared

2. **Subscription Period Extended:**
   - Monthly: +1 month from payment date
   - Annual: +1 year from payment date

3. **Invoice Generated:**
   - PDF invoice created
   - Invoice emailed to user
   - Invoice number logged

4. **Notifications Sent:**
   - ✅ Payment successful email
   - ✅ In-app notification
   - ✅ Access restored message

---

## 🔍 Subscription Status Definitions

| Status | Description | Access Level |
|--------|-------------|--------------|
| **trial** | Free trial period | Full access (limited features) |
| **active** | Payment current | Full access |
| **past_due** | Payment failed | 🚫 **BLOCKED** (read-only) |
| **expired** | Subscription ended | 🚫 **BLOCKED** (read-only) |
| **canceled** | User canceled | 🚫 **BLOCKED** (read-only) |
| **paused** | Temporarily paused | 🚫 **BLOCKED** (read-only) |

---

## 🛠️ Implementation Details

### **1. Usage Enforcement Service**

Location: `whatsflow/backend/src/services/billing/usage-enforcement.service.ts`

```typescript
// CRITICAL CHECK: Subscription status is checked FIRST
async canPerformAction(userId, action) {
  // 1. Check if test account (bypass)
  // 2. Check subscription status (CRITICAL)
  // 3. Block if past_due, canceled, expired, or paused
  // 4. Check usage limits (if active/trial)
  // 5. Return allowed/blocked decision
}
```

**Blocked Statuses:**
- `past_due` - Payment failed
- `canceled` - User canceled subscription
- `expired` - Subscription period ended
- `paused` - Account temporarily suspended

### **2. Payment Service**

Location: `whatsflow/backend/src/services/billing/payment.service.ts`

**On Payment Failure:**
```typescript
handleFailedPayment() {
  // 1. Set subscription status to 'past_due'
  // 2. Log critical event
  // 3. Schedule payment retry
  // 4. Send notification to user
}
```

**On Payment Success:**
```typescript
handleSuccessfulPayment() {
  // 1. Set subscription status to 'active'
  // 2. Extend subscription period
  // 3. Clear pending retries
  // 4. Generate invoice
  // 5. Send success notification
}
```

---

## 📊 Monitoring & Logging

### **Log Levels:**

**Critical Events (ERROR level):**
```
🚫 ACCESS SUSPENDED for user [ID] - Payment failed: [reason]
Payment ID: [ID], Subscription ID: [ID]
```

**Success Events (INFO level):**
```
✅ Access RESTORED for user [ID] - Payment successful
✅ Successful payment processed for user [ID] - Full access granted
```

**Warning Events (WARN level):**
```
PAYMENT FAILURE: User [ID] has been moved to past_due status.
All features blocked until payment succeeds. Error: [reason]
```

### **Monitoring Dashboards:**

1. **Payment Failure Rate:**
   - Track percentage of failed payments
   - Alert if >5% failure rate

2. **Past Due Accounts:**
   - Count of accounts in past_due status
   - Average time to payment recovery

3. **Retry Success Rate:**
   - Track which retry attempt succeeds most
   - Optimize retry schedule

---

## 🔐 Exemptions

### **Test Accounts:**
- Flagged with `is_test_account = true`
- Bypass all payment and usage restrictions
- Used for testing and demos

### **Free Accounts:**
- Flagged with `is_free = true`
- Set by admin panel
- Full access, no billing

---

## 🧪 Testing Payment Failures

### **1. Test Failed Payment:**

```sql
-- Simulate payment failure
UPDATE subscriptions 
SET status = 'past_due' 
WHERE user_id = 'test-user-id';

-- Verify all actions are blocked
-- Try sending message, adding device, etc.
```

### **2. Test Payment Success:**

```sql
-- Simulate successful payment
UPDATE subscriptions 
SET status = 'active' 
WHERE user_id = 'test-user-id';

-- Verify all access is restored
```

### **3. Test PayHere Webhook:**

```bash
# Send test webhook notification
curl -X POST https://api.yourdomain.com/api/v1/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "your_merchant_id",
    "order_id": "ORDER123",
    "payment_id": "PAY123",
    "payhere_amount": "49.00",
    "payhere_currency": "USD",
    "status_code": "-1",
    "md5sig": "hash",
    "status_message": "Insufficient funds"
  }'
```

---

## 📧 User Notifications

### **Payment Failed Email:**

**Subject:** ⚠️ Payment Failed - Action Required

**Content:**
- Reason for failure
- Current subscription status
- Link to update payment method
- Retry schedule
- Support contact

### **Payment Successful Email:**

**Subject:** ✅ Payment Successful - Access Restored

**Content:**
- Payment confirmation
- Invoice attached (PDF)
- Subscription period extended
- Next billing date
- Receipt details

---

## 🚨 Edge Cases & Handling

### **1. Multiple Failed Attempts:**
- After 3 retries, escalate to manual intervention
- Send urgent notification
- Offer payment plan or assistance

### **2. Card Expired:**
- Detect card expiration before billing
- Send proactive renewal reminder
- Offer card update prompt

### **3. Insufficient Funds:**
- Retry with longer delay (7 days)
- Suggest lower plan tier
- Offer payment extension

### **4. Payment Gateway Down:**
- Don't penalize user
- Keep subscription active
- Retry when gateway recovers

### **5. Dispute/Chargeback:**
- Immediately suspend account
- Flag for manual review
- Prevent reactivation until resolved

---

## 🎯 Best Practices

### **For Developers:**

1. ✅ **Always check subscription status** before allowing any action
2. ✅ **Log all payment events** with user context
3. ✅ **Test payment flows** regularly
4. ✅ **Monitor payment failure rates**
5. ✅ **Keep retry logic simple** and predictable

### **For Admins:**

1. ✅ **Monitor past_due accounts** daily
2. ✅ **Review payment logs** for patterns
3. ✅ **Reach out proactively** to failing payments
4. ✅ **Offer payment assistance** when needed
5. ✅ **Track recovery rates** by retry attempt

---

## 📈 Success Metrics

### **Target KPIs:**

| Metric | Target | Current |
|--------|--------|---------|
| Payment Success Rate | >95% | - |
| Payment Failure Recovery | >80% | - |
| Average Recovery Time | <5 days | - |
| Retry 1 Success Rate | >60% | - |
| Retry 2 Success Rate | >25% | - |
| Retry 3 Success Rate | >10% | - |

---

## 🛡️ Security Considerations

### **Payment Data:**
- ✅ **Never store** full card numbers
- ✅ **Use PayHere tokens** for recurring billing
- ✅ **Verify webhook signatures** for authenticity
- ✅ **Log payment events** securely

### **Access Control:**
- ✅ **Immediate suspension** on payment failure
- ✅ **No grace period** for failed payments
- ✅ **Read-only access** during suspension
- ✅ **Secure restoration** on payment success

---

## 🔧 Troubleshooting

### **User Reports "Account Blocked":**

1. **Check subscription status:**
```sql
SELECT status, trial_ends_at, next_billing_date 
FROM subscriptions 
WHERE user_id = 'user-id';
```

2. **Check recent payments:**
```sql
SELECT * FROM payments 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC 
LIMIT 5;
```

3. **Check retry logs:**
```sql
SELECT * FROM payment_retry_log 
WHERE subscription_id = 'sub-id' 
ORDER BY created_at DESC;
```

### **Payment Success But Access Still Blocked:**

1. Verify subscription status updated to `active`
2. Check if retry logs cleared
3. Restart backend service to clear cache
4. Test with fresh API call

---

## ✅ System Verification Checklist

- [ ] Payment webhook configured in PayHere dashboard
- [ ] Subscription status checked before all actions
- [ ] Payment failure immediately suspends access
- [ ] Payment success immediately restores access
- [ ] Retry mechanism scheduled correctly
- [ ] User notifications sent for all events
- [ ] Logs captured for monitoring
- [ ] Test accounts bypass restrictions
- [ ] Free accounts bypass billing
- [ ] Admin panel shows payment status

---

**Your WhatsFlow payment failure system is robust, secure, and user-friendly!** 🎉

All features are immediately suspended on payment failure and automatically restored on success.

