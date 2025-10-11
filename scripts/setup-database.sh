#!/bin/bash

# WhatsFlow Database Setup Script
# Automates database creation and migration

set -e

echo "🗄️  WhatsFlow Database Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Get database credentials
read -p "MySQL root password: " -s MYSQL_ROOT_PASS
echo ""
read -p "New database name [whatsflow]: " DB_NAME
DB_NAME=${DB_NAME:-whatsflow}

read -p "New database user [whatsflow]: " DB_USER
DB_USER=${DB_USER:-whatsflow}

read -p "New database password: " -s DB_PASS
echo ""

# Create database and user
echo "Creating database and user..."
mysql -u root -p"$MYSQL_ROOT_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "Database '$DB_NAME' created"
print_success "User '$DB_USER' created with privileges"

# Run migrations
BACKEND_DIR="$HOME/whatsflow/whatsflow/backend"

if [ -d "$BACKEND_DIR" ]; then
    echo ""
    echo "Running migrations..."
    
    migrations=(
        "scripts/setup-database.sql"
        "migrations/create_billing_system.sql"
        "migrations/create_admin_system.sql"
        "migrations/seed_plans.sql"
        "migrations/add_lead_generation.sql"
    )
    
    for migration in "${migrations[@]}"; do
        if [ -f "$BACKEND_DIR/$migration" ]; then
            mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BACKEND_DIR/$migration"
            print_success "Applied: $migration"
        else
            echo "⚠️  Skipped: $migration (file not found)"
        fi
    done
    
    print_success "All migrations applied"
else
    print_error "Backend directory not found at $BACKEND_DIR"
    exit 1
fi

echo ""
echo "======================================"
print_success "Database setup complete!"
echo ""
echo "📋 Credentials:"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: [hidden]"
echo ""
echo "Add these to your .env file:"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASS"
echo "======================================"

