#!/bin/bash

# WhatsFlow API Installation Verification Script
# Checks if all required files for the Public API system are in place

set -e

echo "🔍 WhatsFlow API Installation Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
  else
    echo -e "${RED}❌ MISSING:${NC} $1"
    ((ERRORS++))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✅${NC} $1/"
  else
    echo -e "${RED}❌ MISSING:${NC} $1/"
    ((ERRORS++))
  fi
}

warn_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
  else
    echo -e "${YELLOW}⚠️  Optional:${NC} $1"
    ((WARNINGS++))
  fi
}

echo "📄 Documentation Files:"
check_file "START_HERE_API.md"
check_file "API_README.md"
check_file "API_QUICKSTART.md"
check_file "API_SETUP_GUIDE.md"
check_file "API_IMPLEMENTATION_SUMMARY.md"
check_file "API_FILES_REFERENCE.md"
check_file "API_DEPLOYMENT_CHECKLIST.md"
check_file "API_SYSTEM_COMPLETE.md"
echo ""

echo "🗄️  Backend - Database:"
check_file "whatsflow/backend/migrations/create_api_system.sql"
echo ""

echo "🔧 Backend - Services:"
check_file "whatsflow/backend/src/services/api-key.service.ts"
check_file "whatsflow/backend/src/services/webhook.service.ts"
echo ""

echo "🛡️  Backend - Middleware:"
check_file "whatsflow/backend/src/middleware/api-auth.middleware.ts"
check_file "whatsflow/backend/src/middleware/api-rate-limit.middleware.ts"
echo ""

echo "🛤️  Backend - Routes & Controllers:"
check_file "whatsflow/backend/src/routes/public-api.routes.ts"
check_file "whatsflow/backend/src/routes/api-keys.routes.ts"
check_file "whatsflow/backend/src/controllers/public-api.controller.ts"
check_file "whatsflow/backend/API_PUBLIC_REFERENCE.md"
echo ""

echo "📚 Backend - Examples:"
check_file "whatsflow/backend/examples/README.md"
check_file "whatsflow/backend/examples/nodejs-sdk.js"
check_file "whatsflow/backend/examples/python-sdk.py"
check_file "whatsflow/backend/examples/webhook-server-express.js"
check_file "whatsflow/backend/examples/webhook-server-flask.py"
check_file "whatsflow/backend/examples/test-api.sh"
check_file "whatsflow/backend/examples/whatsflow-api.postman_collection.json"
echo ""

echo "🎨 Frontend - API Clients:"
check_file "frontend/src/lib/api/api-keys.ts"
check_file "frontend/src/lib/api/webhooks.ts"
echo ""

echo "🖥️  Frontend - Management Pages:"
check_file "frontend/src/app/(dashboard)/settings/api-keys/page.tsx"
check_file "frontend/src/app/(dashboard)/settings/webhooks/page.tsx"
echo ""

echo "📖 Frontend - Documentation Pages:"
check_dir "frontend/src/app/(dashboard)/docs"
check_file "frontend/src/app/(dashboard)/docs/page.tsx"
check_file "frontend/src/app/(dashboard)/docs/authentication/page.tsx"
check_file "frontend/src/app/(dashboard)/docs/messaging/page.tsx"
check_file "frontend/src/app/(dashboard)/docs/devices/page.tsx"
check_file "frontend/src/app/(dashboard)/docs/contacts/page.tsx"
check_file "frontend/src/app/(dashboard)/docs/webhooks/page.tsx"
check_file "frontend/src/app/(dashboard)/docs/rate-limits/page.tsx"
echo ""

echo "🧩 Frontend - Documentation Components:"
check_file "frontend/src/components/docs/CodeBlock.tsx"
check_file "frontend/src/components/docs/ApiEndpoint.tsx"
check_file "frontend/src/components/docs/DocsSidebar.tsx"
echo ""

echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ SUCCESS! All required files are present.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Run database migration:"
  echo "     cd whatsflow/backend"
  echo "     mysql -u whatsapp_user -p whatsapp_db < migrations/create_api_system.sql"
  echo ""
  echo "  2. Restart backend:"
  echo "     npm run dev"
  echo ""
  echo "  3. Create API key:"
  echo "     http://localhost:2153/settings/api-keys"
  echo ""
  echo "  4. Read quick start:"
  echo "     cat API_QUICKSTART.md"
else
  echo -e "${RED}❌ ERRORS FOUND: $ERRORS missing files${NC}"
  echo ""
  echo "Please check the missing files above."
fi

if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warnings: $WARNINGS optional files missing${NC}"
fi

echo ""
echo "For help, read: START_HERE_API.md"

