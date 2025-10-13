# 📘 Setup & Configuration Guides

Guides for configuring various aspects of WhatsFlow.

---

## 📚 Documentation Files

| # | Document | Description | Category |
|---|----------|-------------|----------|
| 01 | [Gmail Setup Guide](./01.%20Gmail%20Setup%20Guide.md) | Configure Google Mail for notifications | 📧 Email |

---

## 📧 Email Configuration

### Gmail Setup:
WhatsFlow uses Google Mail to send:
- Billing notifications
- Payment receipts
- System alerts
- User notifications

**Guide:** [01. Gmail Setup Guide](./01.%20Gmail%20Setup%20Guide.md)

**What you need:**
- Google account with 2FA enabled
- App password generated
- SMTP credentials configured

**Time to setup:** ~5 minutes

---

## 🔐 Required Configurations

### Before Deployment:

1. **Email (Required):**
   - Gmail app password
   - SMTP credentials
   - See: [Gmail Setup Guide](./01.%20Gmail%20Setup%20Guide.md)

2. **AI APIs (Required):**
   - Google Gemini API key
   - Anthropic Claude API key
   - OpenAI API key

3. **Payment Gateway (Optional):**
   - PayHere merchant credentials
   - Can configure later for testing

---

## 🚀 Quick Start

### Gmail Setup:
```bash
# 1. Enable 2FA on accounts@digitalarc.lk
# 2. Generate app password
# 3. Run deployment script with password
bash scripts/deploy-single-server.sh
```

**Full details:** [01. Gmail Setup Guide](./01.%20Gmail%20Setup%20Guide.md)

---

## 📋 Configuration Checklist

Before running deployment:

- [ ] **Gmail 2FA enabled** on accounts@digitalarc.lk
- [ ] **App password generated** for "WhatsFlow Server"
- [ ] **Google Gemini API key** obtained
- [ ] **Anthropic Claude API key** obtained
- [ ] **OpenAI API key** obtained
- [ ] **PayHere credentials** (optional for testing)

---

## 🔧 Environment Variables

### Email Configuration:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=accounts@digitalarc.lk
SMTP_PASS=your_app_password_here
```

### AI Configuration:
```env
GOOGLE_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
```

---

## 📞 Support

### Email Issues:
- Check [Gmail Setup Guide](./01.%20Gmail%20Setup%20Guide.md) - Troubleshooting section
- Verify 2FA is enabled
- Regenerate app password if needed

### API Keys:
- Google Gemini: https://aistudio.google.com/app/apikey
- Anthropic Claude: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

---

## 🎯 Additional Guides (Future)

Planned configuration guides:

- **PayHere Setup:** (See feature-implementations)
- **SSL Certificates:** (Covered in deployment guides)
- **Database Configuration:** (Covered in deployment guides)
- **Redis Setup:** (Covered in deployment guides)

---

**Status:** ✅ Active  
**Last Updated:** October 13, 2025

