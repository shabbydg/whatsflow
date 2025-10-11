# Quick Test Account Setup - 30 Seconds ⚡

Need to test without limits? Here's the fastest way:

---

## 🚀 Super Quick Method (SQL)

```bash
# Copy-paste this into your terminal:

mysql -u root whatsflow -e "UPDATE users SET is_test_account = true, test_account_notes = 'Testing account' WHERE email = 'YOUR_EMAIL_HERE';"
```

**Replace `YOUR_EMAIL_HERE`** with the email you used to register.

**Done!** You now have unlimited access. 🎉

---

## ✅ What You Get

- ✅ **No trial expiration** - Use forever
- ✅ **Unlimited messages** - Send as many as you want
- ✅ **Unlimited AI messages** - No AI limits
- ✅ **Unlimited devices** - Connect multiple WhatsApp numbers
- ✅ **All features** - Broadcasts, file uploads, everything!
- ✅ **No payments** - Never asked to pay

---

## 🧪 Quick Test

After enabling:

1. **Refresh your browser**
2. **Go to Billing dashboard**
3. **See "Unlimited" on all usage bars**
4. **Send messages** - no limits!
5. **Use AI** - no restrictions!

---

## 🔄 Disable Later

When you want normal billing again:

```bash
mysql -u root whatsflow -e "UPDATE users SET is_test_account = false WHERE email = 'YOUR_EMAIL_HERE';"
```

---

## 📋 List All Test Accounts

```bash
mysql -u root whatsflow -e "SELECT email, test_account_notes FROM users WHERE is_test_account = true;"
```

---

## 💡 Pro Tips

### Multiple Test Accounts:

```sql
-- Enable multiple at once
UPDATE users 
SET is_test_account = true 
WHERE email IN ('test1@example.com', 'test2@example.com', 'demo@example.com');
```

### Add Notes:

```sql
UPDATE users 
SET is_test_account = true,
    test_account_notes = 'Internal QA - unlimited access for testing'
WHERE email = 'qa@yourcompany.com';
```

### Check Status:

```sql
SELECT email, is_test_account, test_account_notes 
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';
```

---

**That's it!** One SQL command and you're testing with unlimited access. 🚀

**Full guide:** `TEST_ACCOUNT_GUIDE.md`

