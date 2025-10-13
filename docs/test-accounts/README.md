# 🧪 Test Account Documentation

Guides for managing test accounts with unlimited access.

---

## 📚 Documentation Files

| # | Document | Description | Use Case |
|---|----------|-------------|----------|
| 01 | [Test Account Guide](./01.%20Test%20Account%20Guide.md) | **Complete guide** - All methods to manage test accounts | 📖 Reference |
| 02 | [Quick Test Account Setup](./02.%20Quick%20Test%20Account%20Setup.md) | **Quick reference** - Fast commands | ⚡ Quick Start |

---

## 🎯 What Are Test Accounts?

Test accounts are special user accounts that:

- ✅ **Bypass all billing restrictions**
- ✅ **Have unlimited access** to all features
- ✅ **Full AI functionality** (unlimited AI messages)
- ✅ **No usage limits** (devices, contacts, messages)
- ✅ **Never expire** (no trial period)
- ✅ **Perfect for testing** and demos

---

## ⚡ Quick Commands

### Enable Test Account:
```bash
cd whatsflow/backend
npm run test-account:enable -- shabbydg@gmail.com "Testing account"
```

### Disable Test Account:
```bash
npm run test-account:disable -- shabbydg@gmail.com
```

### List Test Accounts:
```bash
npm run test-account:list
```

---

## 🔧 Management Methods

### **Method 1: NPM Scripts** (Recommended)
Easiest and safest method using NPM scripts.

**Guide:** [02. Quick Test Account Setup](./02.%20Quick%20Test%20Account%20Setup.md)

### **Method 2: TypeScript CLI**
Direct script execution for more control.

**Guide:** [01. Test Account Guide](./01.%20Test%20Account%20Guide.md) - Section: TypeScript CLI

### **Method 3: SQL Queries**
Direct database manipulation for advanced users.

**Guide:** [01. Test Account Guide](./01.%20Test%20Account%20Guide.md) - Section: SQL Method

---

## 🎯 Use Cases

### Development & Testing:
```bash
# Enable for your dev account
npm run test-account:enable -- dev@example.com "Development testing"
```

### Client Demos:
```bash
# Enable for demo account
npm run test-account:enable -- demo@client.com "Client demonstration"
```

### Beta Users:
```bash
# Enable for beta testers
npm run test-account:enable -- beta@example.com "Beta testing program"
```

---

## ✅ Features Test Accounts Get

### **Unlimited Everything:**
- 📱 Devices: Unlimited
- 👥 Contacts: Unlimited
- 💬 Messages: Unlimited
- 🤖 AI Messages: Unlimited
- 📢 Broadcasts: Unlimited
- 📚 Knowledge Base Pages: Unlimited

### **Full Access:**
- ✅ AI-powered auto-replies
- ✅ File uploads
- ✅ Advanced analytics
- ✅ Priority support features
- ✅ Custom integrations
- ✅ API access

---

## 🛡️ Security Best Practices

### When to Use:
- ✅ Internal testing and development
- ✅ Client demonstrations
- ✅ Beta testing programs
- ✅ Long-term trial accounts

### When NOT to Use:
- ❌ Regular paying customers
- ❌ Production accounts that should be billed
- ❌ Accounts you want to track for revenue

### Important:
- 🔒 **Document all test accounts** (use notes field)
- 🔒 **Review periodically** (list command)
- 🔒 **Disable when no longer needed**
- 🔒 **Never share test account credentials**

---

## 📊 Monitoring Test Accounts

### List All Test Accounts:
```bash
npm run test-account:list
```

### SQL Query:
```sql
SELECT 
  email,
  is_test_account,
  test_account_notes,
  created_at
FROM users
WHERE is_test_account = TRUE;
```

---

## 🔄 Backend Integration

Test accounts are automatically handled by:

### **UsageEnforcementService:**
```typescript
// Bypasses all usage restrictions
if (is_test_account) {
  return { allowed: true };
}
```

### **SubscriptionController:**
```typescript
// Returns unlimited limits
if (is_test_account) {
  limits = { devices: -1, messages: -1, ... };
  features = { all: true };
}
```

---

## 📝 Database Schema

### `users` Table:
```sql
is_test_account BOOLEAN DEFAULT FALSE
test_account_notes TEXT NULL
```

**Values:**
- `-1` = Unlimited
- `TRUE` = Enabled
- `FALSE` = Disabled (default)

---

## 🧪 Testing the System

### 1. Enable Test Account:
```bash
npm run test-account:enable -- test@example.com "Test user"
```

### 2. Login as Test Account:
- Go to: https://app.whatsflow.digitalarc.lk
- Login with: test@example.com

### 3. Verify Unlimited Access:
- Check subscription page: Should show "Unlimited" for all limits
- Try adding multiple devices: Should work without restriction
- Send many messages: No limit warnings

### 4. Check Logs:
```bash
pm2 logs whatsflow-api | grep "Test account"
```

Should see:
```
Test account action allowed: USER_ID - send_message
```

---

## 📚 Additional Resources

- **Implementation Details:** See guides for technical implementation
- **Backend Code:** `whatsflow/backend/src/services/billing/usage-enforcement.service.ts`
- **CLI Script:** `whatsflow/backend/scripts/toggle-test-account.ts`
- **Migration:** `whatsflow/backend/migrations/add_test_account_flag.sql`

---

**Status:** ✅ Fully Implemented  
**Last Updated:** October 13, 2025

