#!/bin/bash

# WhatsFlow Single Server Deployment Script
# Complete automated deployment for production
# This script does EVERYTHING - just run it!

set -e  # Exit on any error

echo "🚀 WhatsFlow Complete Production Deployment"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Configuration variables
DOMAIN="whatsflow.digitalarc.lk"
ADMIN_EMAIL="admin@whatsflow.digitalarc.lk"
ADMIN_PASSWORD_HASH="$2b$10$SXuo/hWJ6pH6oy96RNIzle0o1QwyEBa0KtAT.R7MagkrHOC/72eVy"
DB_PASSWORD="SHTech2152!"
JWT_SECRET="rNA2S9felp4XOiv+k9vRcQw3aeJnq+4ws6PxwNZ83oJWle5ZpVwgmAaRaViRBokMnvFiYC0+Qzlw43DvJ0NOLg=="
EMAIL_USER="accounts@digitalarc.lk"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Load environment variables from deploy-env.sh if it exists
if [ -f "scripts/deploy-env.sh" ]; then
    echo "🔑 Loading API keys from deploy-env.sh..."
    source scripts/deploy-env.sh
else
    echo "⚠️  deploy-env.sh not found. Using default placeholder values."
    echo "   Create scripts/deploy-env.sh with your actual API keys."
    GOOGLE_API_KEY="${GOOGLE_API_KEY:-your_google_gemini_api_key_here}"
    ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-your_anthropic_claude_api_key_here}"
    OPENAI_API_KEY="${OPENAI_API_KEY:-}"
    EMAIL_PASSWORD="${EMAIL_PASSWORD:-your_gmail_app_password_here}"
fi
echo "🚀 Starting complete deployment..."
echo ""

# ============================================
# STEP 1: SYSTEM UPDATE & GIT INSTALLATION
# ============================================

print_info "Step 1: Updating system and installing Git..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano htop ufw
print_success "System updated and Git installed"

# ============================================
# STEP 2: NODE.JS INSTALLATION
# ============================================

print_info "Step 2: Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_warning "Node.js already installed: $(node --version)"
fi

# ============================================
# STEP 3: MYSQL INSTALLATION & SETUP
# ============================================

print_info "Step 3: Installing and configuring MySQL..."
if ! command -v mysql &> /dev/null; then
    sudo apt install -y mysql-server
    
    # Secure MySQL installation automatically
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SHTech2152!';"
    sudo mysql -e "DELETE FROM mysql.user WHERE User='';"
    sudo mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    sudo mysql -e "DROP DATABASE IF EXISTS test;"
    sudo mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    sudo mysql -e "FLUSH PRIVILEGES;"
    
    print_success "MySQL installed and secured"
else
    print_warning "MySQL already installed"
fi

# ============================================
# STEP 4: REDIS INSTALLATION
# ============================================

print_info "Step 4: Installing and configuring Redis..."
if ! command -v redis-cli &> /dev/null; then
    sudo apt install -y redis-server
    
    # Configure Redis
    sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
    
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    
    # Test Redis
    redis-cli ping > /dev/null
    print_success "Redis installed and running"
else
    print_warning "Redis already installed"
fi

# ============================================
# STEP 5: NGINX INSTALLATION
# ============================================

print_info "Step 5: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    print_success "Nginx installed and started"
else
    print_warning "Nginx already installed"
fi

# ============================================
# STEP 6: PM2 INSTALLATION
# ============================================

print_info "Step 6: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_warning "PM2 already installed"
fi

# ============================================
# STEP 7: CERTBOT INSTALLATION
# ============================================

print_info "Step 7: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_warning "Certbot already installed"
fi

# ============================================
# STEP 8: REPOSITORY SETUP
# ============================================

print_info "Step 8: Setting up WhatsFlow repository..."
if [ ! -d "$HOME/whatsflow" ]; then
    git clone https://github.com/shabbydg/whatsflow.git "$HOME/whatsflow"
    print_success "Repository cloned"
else
    print_warning "Repository already exists, updating..."
    cd "$HOME/whatsflow"
    git pull origin master
    print_success "Repository updated"
fi

# ============================================
# STEP 9: DATABASE SETUP
# ============================================

print_info "Step 9: Setting up database..."
cd "$HOME/whatsflow"

# Drop existing database if it exists (fresh install)
print_info "Dropping existing database if it exists..."
mysql -u root -p"SHTech2152!" -e "DROP DATABASE IF EXISTS whatsflow;"

# Create database and user
print_info "Creating database and user..."
mysql -u root -p"SHTech2152!" -e "
CREATE DATABASE whatsflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'whatsflow'@'localhost' IDENTIFIED BY 'SHTech2152!';
GRANT ALL PRIVILEGES ON whatsflow.* TO 'whatsflow'@'localhost';
FLUSH PRIVILEGES;
"

# Import the complete database backup
print_info "Importing database backup..."
mysql -u whatsflow -p"SHTech2152!" whatsflow < scripts/whatsflow_db_backup.sql

print_success "Database created and backup imported successfully"

# ============================================
# STEP 10: BACKEND CONFIGURATION
# ============================================

print_info "Step 10: Configuring backend..."
cd "$HOME/whatsflow/whatsflow/backend"

# Install dependencies
npm install

# Create production .env file
cat > .env << EOF
NODE_ENV=production
PORT=2152

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsflow
DB_USER=whatsflow
DB_PASSWORD=SHTech2152!

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-sessions

# PayHere (placeholder - configure later)
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_secret
PAYHERE_APP_ID=your_app_id
PAYHERE_APP_SECRET=your_app_secret
PAYHERE_MODE=live
PAYHERE_RETURN_URL=https://app.$DOMAIN/billing/success
PAYHERE_CANCEL_URL=https://app.$DOMAIN/billing/cancel
PAYHERE_NOTIFY_URL=https://api.$DOMAIN/api/v1/billing/webhook

# Frontend URL
FRONTEND_URL=https://app.$DOMAIN

# CORS
CORS_ORIGIN=https://app.$DOMAIN,https://admin.$DOMAIN

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$EMAIL_USER
SMTP_PASS=$EMAIL_PASSWORD

# AI API Keys
GOOGLE_API_KEY=$GOOGLE_API_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
OPENAI_API_KEY=$OPENAI_API_KEY
EOF

print_success "Backend .env file created"

# ============================================
# STEP 11: FRONTEND CONFIGURATION
# ============================================

print_info "Step 11: Configuring frontend applications..."

# Main Frontend
cd "$HOME/whatsflow/frontend"
npm install
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.$DOMAIN
NEXT_PUBLIC_SOCKET_URL=https://api.$DOMAIN
EOF

# Landing Page
cd "$HOME/whatsflow/landing"
npm install

# Admin Panel
cd "$HOME/whatsflow/admin"
npm install
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.$DOMAIN
EOF

print_success "Frontend applications configured"

# ============================================
# STEP 12: BUILD APPLICATIONS
# ============================================

print_info "Step 12: Building applications..."

# Build backend
cd "$HOME/whatsflow/whatsflow/backend"
npm run build
print_success "Backend built"

# Build frontend apps
cd "$HOME/whatsflow/frontend"
npm run build
print_success "Main frontend built"

cd "$HOME/whatsflow/landing"
npm run build
print_success "Landing page built"

cd "$HOME/whatsflow/admin"
npm run build
print_success "Admin panel built"

# ============================================
# STEP 13: START APPLICATIONS WITH PM2
# ============================================

print_info "Step 13: Starting applications with PM2..."

# Start backend
cd "$HOME/whatsflow/whatsflow/backend"
pm2 start dist/app.js --name whatsflow-api

# Start frontend apps
cd "$HOME/whatsflow/frontend"
pm2 start npm --name whatsflow-app -- start

cd "$HOME/whatsflow/landing"
pm2 start npm --name whatsflow-landing -- start

cd "$HOME/whatsflow/admin"
pm2 start npm --name whatsflow-admin -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup | grep -E '^sudo' | bash

print_success "All applications started with PM2"

# ============================================
# STEP 14: NGINX CONFIGURATION
# ============================================

print_info "Step 14: Configuring Nginx..."

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/whatsflow > /dev/null << EOF
# Backend API
server {
    listen 80;
    server_name api.$DOMAIN;

    location / {
        proxy_pass http://localhost:2152;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}

# Main Application
server {
    listen 80;
    server_name app.$DOMAIN;

    location / {
        proxy_pass http://localhost:2153;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Landing Page
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:5253;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.$DOMAIN;

    location / {
        proxy_pass http://localhost:5153;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/whatsflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

print_success "Nginx configured"

# ============================================
# STEP 15: FIREWALL CONFIGURATION
# ============================================

print_info "Step 15: Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
print_success "Firewall configured"

# ============================================
# STEP 16: SSL CERTIFICATES
# ============================================

print_info "Step 16: Setting up SSL certificates..."
sudo certbot --nginx -d $DOMAIN -d app.$DOMAIN -d admin.$DOMAIN -d api.$DOMAIN --non-interactive --agree-tos --email $EMAIL_USER --redirect
print_success "SSL certificates installed"

# ============================================
# STEP 17: CREATE ADMIN USER
# ============================================

print_info "Step 17: Creating admin user..."
mysql -u whatsflow -p"SHTech2152!" whatsflow -e "
INSERT IGNORE INTO admin_users (id, email, password, role, created_at) VALUES (
  UUID(), 
  '$ADMIN_EMAIL', 
  '$ADMIN_PASSWORD_HASH', 
  'super_admin', 
  NOW()
);
"
print_success "Admin user created"

# ============================================
# STEP 18: FINAL VERIFICATION
# ============================================

print_info "Step 18: Final verification..."

# Check PM2 status
echo ""
echo "📊 Application Status:"
pm2 status

# Check services
echo ""
echo "🔧 Service Status:"
sudo systemctl is-active nginx mysql redis-server

# Test URLs
echo ""
echo "🌐 Testing URLs:"
curl -I https://$DOMAIN > /dev/null 2>&1 && print_success "Landing page accessible" || print_error "Landing page not accessible"
curl -I https://app.$DOMAIN > /dev/null 2>&1 && print_success "Main app accessible" || print_error "Main app not accessible"
curl -I https://admin.$DOMAIN > /dev/null 2>&1 && print_success "Admin panel accessible" || print_error "Admin panel not accessible"
curl -s https://api.$DOMAIN/health > /dev/null 2>&1 && print_success "API accessible" || print_error "API not accessible"

# ============================================
# DEPLOYMENT COMPLETE
# ============================================

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "✅ WhatsFlow is now running on your server!"
echo ""
echo "🌐 Your URLs:"
echo "   Landing:    https://$DOMAIN"
echo "   Main App:   https://app.$DOMAIN"
echo "   Admin:      https://admin.$DOMAIN"
echo "   API:        https://api.$DOMAIN"
echo ""
echo "👤 Admin Login:"
echo "   Email:    $ADMIN_EMAIL"
echo "   Password: reacher53#Jack"
echo ""
echo "📋 Next Steps:"
echo "   1. Update your DNS to point to this server's IP"
echo "   2. Test user registration and login"
echo "   3. Configure PayHere payment gateway when ready"
echo "   4. Set up monitoring and backups"
echo ""
echo "🔧 Useful Commands:"
echo "   pm2 status          # Check app status"
echo "   pm2 logs            # View logs"
echo "   pm2 restart all     # Restart all apps"
echo "   sudo nginx -t       # Test Nginx config"
echo ""
echo "📚 Documentation:"
echo "   DEPLOYMENT_READY.md for maintenance guides"
echo "   SERVER_CAPACITY_ANALYSIS.md for scaling info"
echo ""
echo "🎯 Your WhatsFlow deployment is ready for production! 🚀"