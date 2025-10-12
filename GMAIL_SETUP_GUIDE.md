# 📧 Google Mail Setup Guide for WhatsFlow

## 🎯 Overview

This guide will help you set up `accounts@digitalarc.lk` to send emails through Google Mail for WhatsFlow notifications.

---

## 📋 Prerequisites

- ✅ Access to `accounts@digitalarc.lk` email account
- ✅ Admin access to Google Workspace (if using Workspace)
- ✅ 2-Factor Authentication enabled on the account

---

## 🔧 Step-by-Step Setup

### **Step 1: Enable 2-Factor Authentication**

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/
   - Sign in with `accounts@digitalarc.lk`

2. **Enable 2FA:**
   - Click "Security" in the left sidebar
   - Under "Signing in to Google", click "2-Step Verification"
   - Follow the setup process

### **Step 2: Generate App Password**

1. **Go to App Passwords:**
   - In Google Account Security settings
   - Under "Signing in to Google", click "App passwords"
   - You may need to enter your password again

2. **Create New App Password:**
   - Select app: "Mail"
   - Select device: "Other (custom name)"
   - Enter name: "WhatsFlow Server"
   - Click "Generate"

3. **Copy the Password:**
   - Google will show a 16-character password like: `abcd efgh ijkl mnop`
   - **Copy this password** - you'll need it for the deployment script
   - **Important:** You won't be able to see this password again!

### **Step 3: Test Email Configuration**

After deployment, test the email setup:

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Or use curl to test
curl --url 'smtps://smtp.gmail.com:587' \
  --ssl-reqd \
  --mail-from 'accounts@digitalarc.lk' \
  --mail-rcpt 'test@example.com' \
  --user 'accounts@digitalarc.lk:YOUR_APP_PASSWORD'
```

---

## 🔐 Security Best Practices

### **App Password Security:**
- ✅ **Never share** the app password
- ✅ **Store securely** - use a password manager
- ✅ **Rotate regularly** - generate new passwords periodically
- ✅ **Monitor usage** - check Google Account activity

### **Email Security:**
- ✅ **Use HTTPS** - all email connections are encrypted
- ✅ **Limit permissions** - app password only for mail
- ✅ **Monitor logs** - check email sending logs regularly

---

## 📧 Email Templates in WhatsFlow

Your WhatsFlow installation includes these email templates:

### **Billing Notifications:**
- ✅ **Payment successful**
- ✅ **Payment failed**
- ✅ **Subscription expiring**
- ✅ **Trial ending**
- ✅ **Usage warnings**

### **System Notifications:**
- ✅ **Welcome emails**
- ✅ **Password reset**
- ✅ **Account verification**
- ✅ **Admin notifications**

---

## 🛠️ Troubleshooting

### **Common Issues:**

#### **"Invalid credentials" error:**
```bash
# Solution: Generate new app password
# 1. Go to Google Account → Security → App passwords
# 2. Delete old "WhatsFlow Server" password
# 3. Generate new one
# 4. Update .env file with new password
```

#### **"Less secure app access" error:**
```bash
# Solution: Use App Passwords (not less secure apps)
# App passwords are more secure than less secure app access
```

#### **"Connection refused" error:**
```bash
# Check firewall settings
sudo ufw status
# Should allow outbound connections on port 587
```

#### **"Authentication failed" error:**
```bash
# Verify 2FA is enabled
# Verify app password is correct
# Check for extra spaces in password
```

---

## 📊 Email Limits

### **Google Mail Limits:**
- **Daily sending limit:** 500 emails/day (free account)
- **Rate limit:** 100 emails/hour
- **Recipients per email:** 500 recipients

### **For Higher Limits:**
- **Google Workspace:** 2,000 emails/day
- **SendGrid:** 100 emails/day (free), unlimited (paid)
- **Amazon SES:** 200 emails/day (free), unlimited (paid)

---

## 🔄 Updating Email Configuration

### **To change email settings:**

1. **Edit backend .env file:**
```bash
cd /home/whatsflow/whatsflow/backend
nano .env
```

2. **Update SMTP settings:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=accounts@digitalarc.lk
SMTP_PASS=your_new_app_password
```

3. **Restart backend:**
```bash
pm2 restart whatsflow-api
```

---

## ✅ Verification Checklist

Before running the deployment script, ensure:

- [ ] **2-Factor Authentication** enabled on `accounts@digitalarc.lk`
- [ ] **App Password** generated for "WhatsFlow Server"
- [ ] **App Password copied** and ready to enter
- [ ] **Email account accessible** and working
- [ ] **No security restrictions** blocking the server IP

---

## 🎯 Ready for Deployment

Once you have the app password, you're ready to run the deployment script:

```bash
bash scripts/deploy-single-server.sh
```

The script will prompt you for the app password and configure everything automatically!

---

## 📞 Support

If you encounter issues:

1. **Check Google Account Security:** https://myaccount.google.com/security
2. **Verify App Passwords:** https://support.google.com/accounts/answer/185833
3. **Test SMTP Connection:** Use the test commands above
4. **Check Server Logs:** `pm2 logs whatsflow-api`

---

**Your email configuration will be fully automated during deployment!** 📧✅
