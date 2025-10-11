#!/bin/bash

# WhatsFlow Production Start Script
# Builds and starts all applications with PM2

set -e

echo "🚀 Starting WhatsFlow in Production Mode"
echo "======================================"
echo ""

GREEN='\033[0;32m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

BASE_DIR="$HOME/whatsflow"

# Backend
echo "📦 Building and starting Backend..."
cd "$BASE_DIR/whatsflow/backend"
npm run build
pm2 delete whatsflow-api 2>/dev/null || true
pm2 start dist/app.js --name whatsflow-api
print_success "Backend started on port 2152"

# Frontend
echo "📦 Building and starting Frontend..."
cd "$BASE_DIR/frontend"
npm run build
pm2 delete whatsflow-app 2>/dev/null || true
pm2 start npm --name whatsflow-app -- start
print_success "Frontend started on port 2153"

# Landing
echo "📦 Building and starting Landing Page..."
cd "$BASE_DIR/landing"
npm run build
pm2 delete whatsflow-landing 2>/dev/null || true
pm2 start npm --name whatsflow-landing -- start
print_success "Landing page started on port 5253"

# Admin
echo "📦 Building and starting Admin Panel..."
cd "$BASE_DIR/admin"
npm run build
pm2 delete whatsflow-admin 2>/dev/null || true
pm2 start npm --name whatsflow-admin -- start
print_success "Admin panel started on port 5153"

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved"

echo ""
echo "======================================"
pm2 list
echo "======================================"
echo ""
print_success "All services started successfully!"
echo ""
echo "📋 Access URLs (after Nginx setup):"
echo "Landing:  https://whatsflow.digitalarc.lk"
echo "App:      https://app.whatsflow.digitalarc.lk"
echo "Admin:    https://admin.whatsflow.digitalarc.lk"
echo "API:      https://api.whatsflow.digitalarc.lk"
echo ""
echo "📖 View logs: pm2 logs"
echo "📊 Monitor: pm2 monit"
echo "======================================"

