#!/bin/bash
# Create database and user

echo "Creating WhatsFlow database..."

mysql -u root -p << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS whatsflow;
GRANT ALL PRIVILEGES ON whatsflow.* TO 'whatsflow_user'@'localhost' IDENTIFIED BY 'whatsflow_password';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo "✓ Database created successfully!"
echo "You can now run: npm run setup-db"
