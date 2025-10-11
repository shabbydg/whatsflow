#!/bin/bash

# WhatsFlow Single Server Deployment Script
# This script automates the deployment process on Ubuntu 22.04

set -e  # Exit on any error

echo "🚀 WhatsFlow Single Server Deployment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Node.js
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Install MySQL
echo "📦 Installing MySQL..."
if ! command -v mysql &> /dev/null; then
    sudo apt install -y mysql-server
    print_success "MySQL installed"
    print_warning "Run 'sudo mysql_secure_installation' manually after this script"
else
    print_warning "MySQL already installed"
fi

# Install Redis
echo "📦 Installing Redis..."
if ! command -v redis-cli &> /dev/null; then
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    print_success "Redis installed and started"
else
    print_warning "Redis already installed"
fi

# Install Nginx
echo "📦 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    print_success "Nginx installed and started"
else
    print_warning "Nginx already installed"
fi

# Install PM2
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_warning "PM2 already installed"
fi

# Install Certbot
echo "📦 Installing Certbot for SSL..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_warning "Certbot already installed"
fi

# Clone repository (if not already present)
echo "📥 Checking for WhatsFlow repository..."
if [ ! -d "$HOME/whatsflow" ]; then
    read -p "Enter your GitHub repository URL: " REPO_URL
    git clone "$REPO_URL" "$HOME/whatsflow"
    print_success "Repository cloned"
else
    print_warning "Repository already exists at $HOME/whatsflow"
fi

# Install dependencies
echo "📦 Installing application dependencies..."

# Backend
if [ -d "$HOME/whatsflow/whatsflow/backend" ]; then
    cd "$HOME/whatsflow/whatsflow/backend"
    npm install
    print_success "Backend dependencies installed"
fi

# Frontend
if [ -d "$HOME/whatsflow/frontend" ]; then
    cd "$HOME/whatsflow/frontend"
    npm install
    print_success "Frontend dependencies installed"
fi

# Landing
if [ -d "$HOME/whatsflow/landing" ]; then
    cd "$HOME/whatsflow/landing"
    npm install
    print_success "Landing page dependencies installed"
fi

# Admin
if [ -d "$HOME/whatsflow/admin" ]; then
    cd "$HOME/whatsflow/admin"
    npm install
    print_success "Admin panel dependencies installed"
fi

echo ""
echo "======================================"
print_success "Base installation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure MySQL database (see SINGLE_SERVER_DEPLOYMENT.md)"
echo "2. Set up .env files for each application"
echo "3. Run database migrations"
echo "4. Build and start applications with PM2"
echo "5. Configure Nginx with your domains"
echo "6. Set up SSL with Certbot"
echo ""
echo "📖 Full guide: SINGLE_SERVER_DEPLOYMENT.md"
echo "======================================"

