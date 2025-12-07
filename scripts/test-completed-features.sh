#!/bin/bash

# Test Script for Completed Features
# This script helps verify that all completed features are working correctly

set -e

echo "========================================="
echo "Testing Completed Features"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Check if server is running
echo "1. Checking if server is running..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_result 0 "Server is running on port 3001"
else
    print_result 1 "Server is not running on port 3001"
    echo "   Please start the server first: cd server && npm start"
    exit 1
fi

# Check if client is running
echo ""
echo "2. Checking if client is running..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_result 0 "Client is running on port 5173"
else
    echo -e "${YELLOW}⚠ WARN${NC}: Client may not be running on port 5173"
    echo "   Manual testing may be required"
fi

# Check database connection (if credentials are available)
echo ""
echo "3. Checking database table for report logging..."
if [ -f ".env" ]; then
    DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2)
    DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
    DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
    
    if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_USER" ] && [ ! -z "$DB_NAME" ]; then
        if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES LIKE 'report_access_logs';" 2>/dev/null | grep -q report_access_logs; then
            print_result 0 "report_access_logs table exists"
        else
            print_result 1 "report_access_logs table does not exist"
            echo "   Run: mysql -u user -p database < database/report_access_logs_schema.sql"
        fi
    else
        echo -e "${YELLOW}⚠ INFO${NC}: Database credentials not found, skipping table check"
    fi
else
    echo -e "${YELLOW}⚠ INFO${NC}: .env file not found, skipping database check"
fi

# Test GitHub config endpoint (requires authentication - manual check)
echo ""
echo "4. Testing GitHub config endpoint..."
echo -e "${YELLOW}⚠ INFO${NC}: GitHub endpoint requires authentication"
echo "   Manual test: curl -X GET http://localhost:3001/api/config/github"
echo "   Expected: JSON with repositoryUrl and repositoryName"

# Check if date formatter files exist
echo ""
echo "5. Checking date formatter utilities..."
if [ -f "server/src/utils/dateFormatter.js" ]; then
    print_result 0 "Server date formatter exists"
else
    print_result 1 "Server date formatter missing"
fi

if [ -f "client/src/utils/dateFormatter.js" ]; then
    print_result 0 "Client date formatter exists"
else
    print_result 1 "Client date formatter missing"
fi

# Check if progress bar component exists
echo ""
echo "6. Checking enhanced progress bar component..."
if [ -f "client/src/components/ProgressBarEnhanced.vue" ]; then
    print_result 0 "ProgressBarEnhanced component exists"
else
    print_result 1 "ProgressBarEnhanced component missing"
fi

# Check if report logging service exists
echo ""
echo "7. Checking report logging service..."
if [ -f "server/src/services/reportLogging.service.js" ]; then
    print_result 0 "Report logging service exists"
else
    print_result 1 "Report logging service missing"
fi

if [ -f "server/src/middleware/reportLogging.js" ]; then
    print_result 0 "Report logging middleware exists"
else
    print_result 1 "Report logging middleware missing"
fi

# Check if database schema exists
echo ""
echo "8. Checking database schema file..."
if [ -f "database/report_access_logs_schema.sql" ]; then
    print_result 0 "Report access logs schema file exists"
else
    print_result 1 "Report access logs schema file missing"
fi

# Summary
echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All automated checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run manual tests: see docs/TESTING_GUIDE_COMPLETED_FEATURES.md"
    echo "2. Test in browser: http://localhost:5173"
    echo "3. Check server logs: tail -f server/logs/app.log"
    exit 0
else
    echo -e "${RED}Some checks failed. Please review the errors above.${NC}"
    exit 1
fi

