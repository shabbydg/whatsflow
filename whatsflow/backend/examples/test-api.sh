#!/bin/bash

# WhatsFlow API Test Script
# Tests all major API endpoints

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_KEY=${WHATSFLOW_API_KEY:-""}
BASE_URL=${WHATSFLOW_BASE_URL:-"http://localhost:2152/api/public/v1"}

echo "🚀 WhatsFlow API Test Script"
echo "============================"
echo ""

# Check if API key is set
if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ Error: WHATSFLOW_API_KEY environment variable not set${NC}"
    echo ""
    echo "Usage:"
    echo "  export WHATSFLOW_API_KEY='wf_live_your_key_here'"
    echo "  ./test-api.sh"
    echo ""
    echo "Or:"
    echo "  WHATSFLOW_API_KEY='wf_live_xxx' ./test-api.sh"
    exit 1
fi

echo "API Key: ${API_KEY:0:20}..." 
echo "Base URL: $BASE_URL"
echo ""

# Test 1: List Devices
echo -e "${YELLOW}📱 Test 1: List Devices${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  "$BASE_URL/devices")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success${NC}"
    echo "$BODY" | python3 -m json.tool
else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

# Test 2: List Contacts
echo -e "${YELLOW}👥 Test 2: List Contacts${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  "$BASE_URL/contacts?limit=5")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success${NC}"
    echo "$BODY" | python3 -m json.tool | head -n 20
else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

# Test 3: Send Message (optional - uncomment to test)
# echo -e "${YELLOW}📬 Test 3: Send Message${NC}"
# RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
#   -H "Authorization: Bearer $API_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "phone_number": "+94771234567",
#     "message": "Test message from API"
#   }' \
#   "$BASE_URL/messages/send")
#
# HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# BODY=$(echo "$RESPONSE" | sed '$d')
#
# if [ "$HTTP_CODE" -eq 200 ]; then
#     echo -e "${GREEN}✅ Success${NC}"
#     echo "$BODY" | python3 -m json.tool
# else
#     echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
#     echo "$BODY"
# fi
# echo ""

# Test 4: Check Rate Limits
echo -e "${YELLOW}⚡ Test 4: Check Rate Limits${NC}"
RESPONSE=$(curl -s -i \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  "$BASE_URL/devices" 2>&1)

RATE_LIMIT=$(echo "$RESPONSE" | grep -i "x-ratelimit-limit:" | cut -d' ' -f2 | tr -d '\r')
RATE_REMAINING=$(echo "$RESPONSE" | grep -i "x-ratelimit-remaining:" | cut -d' ' -f2 | tr -d '\r')
RATE_RESET=$(echo "$RESPONSE" | grep -i "x-ratelimit-reset:" | cut -d' ' -f2 | tr -d '\r')

if [ -n "$RATE_LIMIT" ]; then
    echo -e "${GREEN}✅ Rate Limit Headers Present${NC}"
    echo "  Limit: $RATE_LIMIT requests/minute"
    echo "  Remaining: $RATE_REMAINING requests"
    echo "  Resets at: $(date -r $RATE_RESET 2>/dev/null || echo $RATE_RESET)"
else
    echo -e "${YELLOW}⚠️  No rate limit headers found${NC}"
fi
echo ""

# Test 5: Invalid API Key
echo -e "${YELLOW}🔒 Test 5: Invalid API Key (should fail)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer wf_live_invalid_key_12345" \
  -H "Content-Type: application/json" \
  "$BASE_URL/devices")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✅ Correctly rejected invalid key${NC}"
    echo "$BODY" | python3 -m json.tool
else
    echo -e "${RED}❌ Unexpected response (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

echo "============================"
echo -e "${GREEN}✅ API Tests Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Create webhooks: Settings → Webhooks"
echo "  2. View API docs: http://localhost:2153/docs"
echo "  3. Monitor usage: Settings → API Keys"

