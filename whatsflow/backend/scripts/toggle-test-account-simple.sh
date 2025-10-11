#!/bin/bash

# Simple SQL-based script to toggle test accounts
# Usage: ./toggle-test-account-simple.sh enable user@example.com "Testing notes"
#        ./toggle-test-account-simple.sh disable user@example.com
#        ./toggle-test-account-simple.sh list

COMMAND=$1
EMAIL=$2
NOTES=$3

# Database connection (update these if needed)
DB_USER="whatsflow"
DB_NAME="whatsflow"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ "$COMMAND" == "enable" ]; then
    if [ -z "$EMAIL" ]; then
        echo -e "${RED}❌ Email required${NC}"
        exit 1
    fi

    NOTES=${NOTES:-"Test account"}

    echo -e "${GREEN}Enabling test account for: $EMAIL${NC}"
    
    mysql -u $DB_USER -p $DB_NAME <<EOF
UPDATE users 
SET is_test_account = true, 
    test_account_notes = '$NOTES' 
WHERE email = '$EMAIL';

SELECT 'Test account enabled!' as status, 
       email, 
       is_test_account, 
       test_account_notes 
FROM users 
WHERE email = '$EMAIL';
EOF

    echo -e "${GREEN}✅ Done! User can now use the app without limits.${NC}"

elif [ "$COMMAND" == "disable" ]; then
    if [ -z "$EMAIL" ]; then
        echo -e "${RED}❌ Email required${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Disabling test account for: $EMAIL${NC}"
    
    mysql -u $DB_USER -p $DB_NAME <<EOF
UPDATE users 
SET is_test_account = false, 
    test_account_notes = NULL 
WHERE email = '$EMAIL';

SELECT 'Test account disabled!' as status, 
       email, 
       is_test_account 
FROM users 
WHERE email = '$EMAIL';
EOF

    echo -e "${GREEN}✅ Done! User will now follow normal billing rules.${NC}"

elif [ "$COMMAND" == "list" ]; then
    echo -e "${GREEN}Test Accounts:${NC}"
    
    mysql -u $DB_USER -p $DB_NAME <<EOF
SELECT 
    email,
    full_name,
    test_account_notes,
    created_at
FROM users
WHERE is_test_account = true
ORDER BY created_at DESC;
EOF

else
    echo "Usage:"
    echo "  ./toggle-test-account-simple.sh enable user@example.com \"Testing notes\""
    echo "  ./toggle-test-account-simple.sh disable user@example.com"
    echo "  ./toggle-test-account-simple.sh list"
fi

