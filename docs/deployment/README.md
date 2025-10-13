# 🚀 Deployment Documentation

Complete guides for deploying WhatsFlow to production.

---

## 📚 Documentation Files

| # | Document | Description | Start Here |
|---|----------|-------------|------------|
| 01 | [Deployment Ready Guide](./01.%20Deployment%20Ready%20Guide.md) | **⭐ MAIN GUIDE** - Complete deployment checklist | ✅ YES |
| 02 | [Single Server Deployment](./02.%20Single%20Server%20Deployment.md) | Detailed single-server setup | 📖 Reference |
| 03 | [Server Capacity Analysis](./03.%20Server%20Capacity%20Analysis.md) | Capacity planning for chosen specs | 📊 Planning |
| 04 | [Deployment Options Summary](./04.%20Deployment%20Options%20Summary.md) | Quick comparison of deployment options | 🔍 Overview |
| 05 | [Deployment Comparison](./05.%20Deployment%20Comparison.md) | Detailed comparison of architectures | 📋 Decision |
| 06 | [AWS Lambda Integration](./06.%20AWS%20Lambda%20Integration.md) | Hybrid Lambda deployment option | ☁️ Advanced |
| 07 | [Recent Changes Summary](./07.%20Recent%20Changes%20Summary.md) | Latest deployment updates | 📝 Updates |

---

## 🎯 Quick Start

### For Complete Beginners:
**→ Start with:** [01. Deployment Ready Guide](./01.%20Deployment%20Ready%20Guide.md)

This guide includes EVERY step you need, including:
- Server provisioning
- DNS configuration
- Software installation
- Database setup
- Application configuration
- SSL certificates
- Testing procedures
- Update strategies

### For Experienced DevOps:
**→ Jump to:** [02. Single Server Deployment](./02.%20Single%20Server%20Deployment.md)

More technical details and advanced configurations.

### For Capacity Planning:
**→ Check:** [03. Server Capacity Analysis](./03.%20Server%20Capacity%20Analysis.md)

Understand how many users your server can handle.

### For Architecture Decisions:
**→ Review:** [04. Deployment Options Summary](./04.%20Deployment%20Options%20Summary.md) and [05. Deployment Comparison](./05.%20Deployment%20Comparison.md)

Compare single server vs multi-service vs hybrid approaches.

---

## 🏗️ Deployment Architectures

### 1. **Single Server** (Recommended for Start)
- **Cost:** $12/month (90 days free)
- **Capacity:** 100-300 active users
- **Setup Time:** ~15 minutes (automated)
- **Complexity:** Low
- **Guide:** [01. Deployment Ready Guide](./01.%20Deployment%20Ready%20Guide.md)

### 2. **Hybrid Lambda** (For Specific Tasks)
- **Cost:** $20-40/month
- **Capacity:** 500-1000 users
- **Setup Time:** ~2 hours
- **Complexity:** Medium
- **Guide:** [06. AWS Lambda Integration](./06.%20AWS%20Lambda%20Integration.md)

### 3. **Multi-Service Cloud** (Enterprise Scale)
- **Cost:** $70-90/month
- **Capacity:** 1000+ users
- **Setup Time:** ~4 hours
- **Complexity:** High
- **Guide:** [05. Deployment Comparison](./05.%20Deployment%20Comparison.md)

---

## 🛠️ Automated Deployment

### One-Stop Installation Script:
```bash
# On your Ubuntu 22.04 server:
git clone https://github.com/shabbydg/whatsflow.git
cd whatsflow
bash scripts/deploy-single-server.sh
```

**What it does:**
- ✅ Installs all software (Git, Node.js, MySQL, Redis, Nginx, PM2, Certbot)
- ✅ Sets up database and runs migrations
- ✅ Configures environment variables
- ✅ Builds and starts all applications
- ✅ Configures Nginx and firewall
- ✅ Sets up SSL certificates
- ✅ Creates admin user
- ✅ Tests everything

**Time:** ~15 minutes  
**User Input:** API keys only (4 prompts)

---

## 📋 Deployment Checklist

Before deploying, ensure you have:

- [ ] **Server:** Ubuntu 22.04, 2GB RAM, 2 vCPUs
- [ ] **Domain:** DNS configured for 4 subdomains
- [ ] **API Keys:** Google Gemini, Anthropic Claude, OpenAI
- [ ] **Email:** Gmail app password for notifications
- [ ] **PayHere:** Credentials (optional for testing)

---

## 🌐 Production URLs

After deployment:

- **Landing:** https://whatsflow.digitalarc.lk
- **Main App:** https://app.whatsflow.digitalarc.lk
- **Admin Panel:** https://admin.whatsflow.digitalarc.lk
- **API:** https://api.whatsflow.digitalarc.lk

---

## 🔄 Update Procedures

### Zero-Downtime Updates:
```bash
cd ~/whatsflow
git pull origin master
cd whatsflow/backend && npm install && npm run build
pm2 reload whatsflow-api
```

**Downtime:** 0 seconds (graceful reload)

### Full Details:
See [01. Deployment Ready Guide](./01.%20Deployment%20Ready%20Guide.md) - Section: "Update Strategies"

---

## 📞 Support

- **Issues:** Check deployment guides
- **Troubleshooting:** See guide-specific sections
- **Updates:** Review [07. Recent Changes](./07.%20Recent%20Changes%20Summary.md)

---

**Status:** ✅ Ready for Production Deployment  
**Last Updated:** October 13, 2025

