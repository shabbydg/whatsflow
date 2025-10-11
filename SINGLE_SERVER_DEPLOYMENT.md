# Single Server Deployment Guide - WhatsFlow

**Domain:** whatsflow.digitalarc.lk  
**Architecture:** All-in-One Server  
**OS:** Ubuntu 22.04 LTS

---

## 🎯 Overview

This guide will deploy:
- `whatsflow.digitalarc.lk` → Landing Page
- `app.whatsflow.digitalarc.lk` → Main Application
- `admin.whatsflow.digitalarc.lk` → Admin Panel
- `api.whatsflow.digitalarc.lk` → Backend API

All on a single VPS server using Nginx, PM2, MySQL, and Redis.

---

## 📋 Prerequisites

### What You Need:
- [x] VPS Server (DigitalOcean, Hetzner, Vultr)
- [x] Domain: `whatsflow.digitalarc.lk`
- [x] DNS Access to create A records
- [x] SSH Access to server

### Server Specs:
- **Minimum:** 2 CPU, 4GB RAM, 50GB SSD (~$20/month)
- **Recommended:** 4 CPU, 8GB RAM, 100GB SSD (~$40/month)
- **OS:** Ubuntu 22.04 LTS

---

## 🌐 Part 1: DNS Configuration

### 1.1 Create DNS A Records

In your DNS provider (where you manage digitalarc.lk):

```
Type    Name                        Value (IP)              TTL
A       whatsflow                   YOUR_SERVER_IP          3600
A       app.whatsflow              YOUR_SERVER_IP          3600
A       admin.whatsflow            YOUR_SERVER_IP          3600
A       api.whatsflow              YOUR_SERVER_IP          3600
```

**Wait 5-10 minutes** for DNS propagation.

### 1.2 Verify DNS

```bash
# Check if DNS is working
nslookup whatsflow.digitalarc.lk
nslookup app.whatsflow.digitalarc.lk
nslookup admin.whatsflow.digitalarc.lk
nslookup api.whatsflow.digitalarc.lk

# All should return YOUR_SERVER_IP
```

---

## 🖥️ Part 2: Server Setup

### 2.1 Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

### 2.2 Update System

```bash
apt update && apt upgrade -y
```

### 2.3 Create Non-Root User

```bash
# Create user
adduser whatsflow

# Add to sudo group
usermod -aG sudo whatsflow

# Switch to new user
su - whatsflow
```

### 2.4 Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should show v20.x
npm --version   # Should show 10.x
```

### 2.5 Install MySQL

```bash
# Install MySQL
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation
# Answer: Y, 2 (STRONG), password, Y, Y, Y, Y

# Create database
sudo mysql -u root -p
```

In MySQL shell:

```sql
CREATE DATABASE whatsflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'whatsflow'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON whatsflow.* TO 'whatsflow'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.6 Install Redis

```bash
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Find: supervised no
# Change to: supervised systemd

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Test
redis-cli ping  # Should return PONG
```

### 2.7 Install Nginx

```bash
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Test
curl http://localhost  # Should show Nginx welcome page
```

### 2.8 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

### 2.9 Install Certbot (for SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 📦 Part 3: Deploy Application Code

### 3.1 Clone Repository

```bash
cd /home/whatsflow
git clone https://github.com/shabbydg/whatsflow.git
cd whatsflow
```

### 3.2 Set Up Backend

```bash
cd whatsflow/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Backend `.env`:**

```env
NODE_ENV=production
PORT=2152

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsflow
DB_USER=whatsflow
DB_PASSWORD=YOUR_STRONG_PASSWORD

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE
JWT_EXPIRES_IN=7d

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-sessions

# PayHere
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_secret
PAYHERE_APP_ID=your_app_id
PAYHERE_APP_SECRET=your_app_secret
PAYHERE_MODE=live
PAYHERE_RETURN_URL=https://app.whatsflow.digitalarc.lk/billing/success
PAYHERE_CANCEL_URL=https://app.whatsflow.digitalarc.lk/billing/cancel
PAYHERE_NOTIFY_URL=https://api.whatsflow.digitalarc.lk/api/v1/billing/webhook

# Frontend URL
FRONTEND_URL=https://app.whatsflow.digitalarc.lk

# CORS
CORS_ORIGIN=https://app.whatsflow.digitalarc.lk,https://admin.whatsflow.digitalarc.lk

# Email (configure later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3.3 Run Database Migrations

```bash
# Still in /home/whatsflow/whatsflow/backend
mysql -u whatsflow -p whatsflow < scripts/setup-database.sql
mysql -u whatsflow -p whatsflow < migrations/create_billing_system.sql
mysql -u whatsflow -p whatsflow < migrations/create_admin_system.sql
mysql -u whatsflow -p whatsflow < migrations/seed_plans.sql
mysql -u whatsflow -p whatsflow < migrations/add_lead_generation.sql
# Run any other migrations you have
```

### 3.4 Build and Start Backend

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/app.js --name whatsflow-api

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
# Run the command it outputs
```

### 3.5 Set Up Frontend Apps

#### Main Frontend:

```bash
cd /home/whatsflow/whatsflow/frontend

# Install dependencies
npm install

# Create .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.whatsflow.digitalarc.lk
NEXT_PUBLIC_SOCKET_URL=https://api.whatsflow.digitalarc.lk
```

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name whatsflow-app -- start
```

#### Landing Page:

```bash
cd /home/whatsflow/whatsflow/landing

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name whatsflow-landing -- start
```

#### Admin Panel:

```bash
cd /home/whatsflow/whatsflow/admin

# Install dependencies
npm install

# Create .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.whatsflow.digitalarc.lk
```

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name whatsflow-admin -- start
```

### 3.6 Check All Services

```bash
pm2 list
# Should show:
# whatsflow-api (port 2152)
# whatsflow-app (port 2153)
# whatsflow-landing (port 5253)
# whatsflow-admin (port 5153)

pm2 save
```

---

## 🌐 Part 4: Nginx Configuration

### 4.1 Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/whatsflow
```

**Nginx Configuration:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.whatsflow.digitalarc.lk;

    location / {
        proxy_pass http://localhost:2152;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}

# Main Application
server {
    listen 80;
    server_name app.whatsflow.digitalarc.lk;

    location / {
        proxy_pass http://localhost:2153;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Landing Page
server {
    listen 80;
    server_name whatsflow.digitalarc.lk;

    location / {
        proxy_pass http://localhost:5253;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.whatsflow.digitalarc.lk;

    location / {
        proxy_pass http://localhost:5153;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.2 Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/whatsflow /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Part 5: SSL Certificates (HTTPS)

### 5.1 Generate SSL Certificates

```bash
# Get certificates for all subdomains
sudo certbot --nginx -d whatsflow.digitalarc.lk \
  -d app.whatsflow.digitalarc.lk \
  -d admin.whatsflow.digitalarc.lk \
  -d api.whatsflow.digitalarc.lk

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (Option 2)
```

### 5.2 Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job
# Certificates will auto-renew every 60 days
```

---

## ✅ Part 6: Verification

### 6.1 Check All URLs

```bash
# Landing page
curl https://whatsflow.digitalarc.lk

# Main app
curl https://app.whatsflow.digitalarc.lk

# Admin panel
curl https://admin.whatsflow.digitalarc.lk

# API health check
curl https://api.whatsflow.digitalarc.lk/health
```

### 6.2 Check PM2 Processes

```bash
pm2 status
pm2 logs --lines 50
```

### 6.3 Test in Browser

1. **Landing:** https://whatsflow.digitalarc.lk
2. **Register:** https://app.whatsflow.digitalarc.lk/register
3. **Login:** https://app.whatsflow.digitalarc.lk/login
4. **Admin:** https://admin.whatsflow.digitalarc.lk/login

---

## 🔧 Part 7: Maintenance

### 7.1 Update Application

```bash
cd /home/whatsflow/whatsflow

# Pull latest code
git pull origin master

# Update backend
cd whatsflow/backend
npm install
npm run build
pm2 restart whatsflow-api

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart whatsflow-app

# Update landing
cd ../landing
npm install
npm run build
pm2 restart whatsflow-landing

# Update admin
cd ../admin
npm install
npm run build
pm2 restart whatsflow-admin
```

### 7.2 View Logs

```bash
# All logs
pm2 logs

# Specific app
pm2 logs whatsflow-api
pm2 logs whatsflow-app
pm2 logs whatsflow-landing
pm2 logs whatsflow-admin

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 7.3 Database Backup

```bash
# Create backup script
nano /home/whatsflow/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/whatsflow/backups"
mkdir -p $BACKUP_DIR

mysqldump -u whatsflow -p'YOUR_PASSWORD' whatsflow > $BACKUP_DIR/whatsflow_$DATE.sql
gzip $BACKUP_DIR/whatsflow_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "whatsflow_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /home/whatsflow/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/whatsflow/backup-db.sh
```

### 7.4 Monitor Resources

```bash
# CPU and RAM
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit
```

---

## 🔥 Part 8: Firewall Setup

### 8.1 Configure UFW

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## 🚨 Part 9: Troubleshooting

### Issue: Can't connect to site

```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check DNS
nslookup whatsflow.digitalarc.lk

# Check firewall
sudo ufw status
```

### Issue: PM2 process crashed

```bash
# Check logs
pm2 logs whatsflow-api --lines 100

# Restart process
pm2 restart whatsflow-api

# Restart all
pm2 restart all
```

### Issue: Database connection error

```bash
# Check MySQL
sudo systemctl status mysql

# Test connection
mysql -u whatsflow -p whatsflow

# Check credentials in .env
nano /home/whatsflow/whatsflow/whatsflow/backend/.env
```

### Issue: Out of memory

```bash
# Check memory
free -h

# Restart services
pm2 restart all

# Consider upgrading server
```

---

## 📊 Part 10: Monitoring (Optional but Recommended)

### 10.1 Install Netdata (Real-time monitoring)

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access: http://YOUR_SERVER_IP:19999
```

### 10.2 Set Up PM2 Web Dashboard

```bash
pm2 install pm2-server-monit
```

---

## 💰 Cost Breakdown

### Monthly Costs:
- **VPS Server (4GB):** $20-30/month
- **Domain (already owned):** $0
- **SSL Certificates:** $0 (Let's Encrypt)
- **Total:** ~$20-30/month

vs. Multi-service setup:
- Vercel: $20+/month
- Railway: $10+/month
- PlanetScale: $29+/month
- Redis Cloud: $10+/month
- Total: $70+/month

**Savings: ~$40-50/month** 💰

---

## 🎯 Quick Commands Reference

```bash
# Check all services
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Update code
cd /home/whatsflow/whatsflow && git pull

# Backup database
mysqldump -u whatsflow -p whatsflow > backup.sql

# Check Nginx
sudo nginx -t
sudo systemctl reload nginx

# Renew SSL
sudo certbot renew
```

---

## ✅ Success Checklist

- [ ] DNS records created
- [ ] Server provisioned and updated
- [ ] Node.js, MySQL, Redis installed
- [ ] Repository cloned
- [ ] Backend configured and running
- [ ] Frontend apps built and running
- [ ] Nginx configured
- [ ] SSL certificates installed
- [ ] All URLs accessible via HTTPS
- [ ] Database backed up
- [ ] Firewall configured

---

**Deployment Status:** 🚀 Ready for Production  
**Estimated Setup Time:** 2-3 hours  
**Difficulty Level:** Intermediate

---

Need help? Check logs with `pm2 logs` and `sudo tail -f /var/log/nginx/error.log`

