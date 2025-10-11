# Quick Deployment Guide

**Phase 2 Complete** - Get your billing system running in 10 minutes!

---

## Step 1: Database Setup (2 minutes)

```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend

# Run all migrations in order
mysql -u root whatsflow < migrations/create_billing_system.sql
mysql -u root whatsflow < migrations/create_admin_system.sql
mysql -u root whatsflow < migrations/seed_plans.sql
```

**⚠️ Important:** Before running `create_admin_system.sql`, generate your admin password:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_SECURE_PASSWORD', 10));"
```

Copy the output and replace line 49 in `migrations/create_admin_system.sql`.

---

## Step 2: Environment Configuration (3 minutes)

Edit `/whatsflow/backend/.env`:

```env
# PayHere (Get from https://www.payhere.lk/)
PAYHERE_MERCHANT_ID=your_merchant_id_here
PAYHERE_MERCHANT_SECRET=your_secret_here
PAYHERE_APP_ID=your_app_id_here
PAYHERE_APP_SECRET=your_app_secret_here
PAYHERE_MODE=sandbox

# URLs
PAYHERE_RETURN_URL=http://localhost:2153/billing/success
PAYHERE_CANCEL_URL=http://localhost:2153/billing/cancel
PAYHERE_NOTIFY_URL=http://localhost:2152/api/v1/billing/webhook
FRONTEND_URL=http://localhost:2153
```

---

## Step 3: Start Services (1 minute)

```bash
# Terminal 1: Backend
cd /Users/digitalarc/Development/Webroot/whatsflow/whatsflow/backend
npm run dev

# Terminal 2: Frontend
cd /Users/digitalarc/Development/Webroot/whatsflow/frontend
npm run dev

# Terminal 3: Admin Panel (optional)
cd /Users/digitalarc/Development/Webroot/whatsflow/admin
npm run dev
```

---

## Step 4: Test User Flow (4 minutes)

### A. Register & Trial (1 min)
1. Go to http://localhost:2153/register
2. Create account
3. Login
4. **✅ Trial automatically starts!**

### B. View Billing (30 sec)
1. Click "Billing" in sidebar
2. See trial status
3. See usage dashboard (0/100 messages)

### C. Subscribe to Plan (1 min)
1. Click "Plans" submenu
2. Select "Starter" or "Professional"
3. Choose "Monthly" or "Annual"
4. Click "Select Plan"
5. **Redirects to PayHere sandbox**

### D. Complete Payment (1 min)
Use PayHere test card:
- **Card:** `5111111111111118`
- **CVV:** `123`
- **Expiry:** `12/25`
- **Name:** `Test User`

Click "Pay" → Redirects to success page → **Subscription activated!**

### E. Verify (30 sec)
1. Click "Billing" → See "Active" status
2. Click "Invoices" → See payment record
3. Check email → Invoice sent (if SMTP configured)

---

## Step 5: Test Admin Panel (Optional)

1. Go to http://localhost:5153/login
2. Login:
   - **Email:** `admin@whatsflow.ai`
   - **Password:** (your set password)
3. View dashboard stats
4. Manage users
5. Process refunds
6. Create coupons

---

## 🎉 Success!

You now have a fully functional billing system with:
- ✅ Auto-trial on registration
- ✅ Plan selection & subscription
- ✅ PayHere payment integration
- ✅ Usage tracking & enforcement
- ✅ Admin panel for management
- ✅ Email notifications
- ✅ Invoice generation

---

## 🚨 Troubleshooting

### "No subscription found"
**Fix:** User didn't get auto-trial. Check:
```sql
SELECT * FROM subscriptions WHERE user_id = 'USER_ID';
```

### "Invalid hash" on webhook
**Fix:**
- Verify `PAYHERE_MERCHANT_SECRET` is correct
- No extra spaces in `.env`
- Check backend logs for details

### Payment succeeds but subscription not activated
**Fix:**
- PayHere webhook might not be reaching backend
- For local testing, use ngrok:
```bash
ngrok http 2152
# Update PAYHERE_NOTIFY_URL to ngrok URL
```

### Email not sending
**Fix:**
- Configure SMTP in `/whatsflow/backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 📝 Next Actions

1. **Get PayHere Account:** https://www.payhere.lk/
2. **Set Up Email:** Configure SMTP credentials
3. **Test Full Flow:** Register → Subscribe → Pay → Verify
4. **Review Plans:** Adjust pricing if needed
5. **Deploy to Staging:** Test before production

---

## 📞 Need Help?

- Check logs: `/whatsflow/backend/logs/combined.log`
- Review full docs: `PHASE2_COMPLETE.md`
- Testing guide: `TESTING_GUIDE.md`
- PayHere setup: `PAYHERE_SETUP_GUIDE.md`

---

**Deployment Time:** ~10 minutes  
**Status:** Ready for testing!  
**Next:** Configure production PayHere & deploy 🚀

