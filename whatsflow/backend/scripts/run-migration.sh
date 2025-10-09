#!/bin/bash

# Run database migration for devices and personas

echo "🔄 Running database migration..."

# Database credentials
DB_NAME="whatsflow"
DB_USER="root"
DB_PASSWORD=""
DB_HOST="localhost"

# Run the migration
if [ -z "$DB_PASSWORD" ]; then
  mysql -h "$DB_HOST" -u "$DB_USER" "$DB_NAME" < ../migrations/add_devices_and_personas.sql
else
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ../migrations/add_devices_and_personas.sql
fi

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully!"
  echo ""
  echo "The following have been added:"
  echo "  - personas table"
  echo "  - device_name, persona_id, is_primary columns to whatsapp_connections"
  echo "  - auto_reply_enabled, working_hours columns"
  echo "  - ai_conversations table"
  echo "  - Enhanced business_profiles table"
  echo "  - Default personas (Sales, Support, General)"
  echo ""
  echo "Your existing WhatsApp connection has been updated to 'Primary Device' with General persona."
else
  echo "❌ Migration failed. Please check the error messages above."
  exit 1
fi
