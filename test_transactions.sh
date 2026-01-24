#!/bin/bash

# Transaction Management API Testing Script
# Make sure the server is running on port 5000

BASE_URL="http://localhost:5000/api/transactions"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Transaction Management API Tests"
echo "========================================="
echo ""

# Note: Replace USER_ID with an actual user ID from your database
# You can get one by querying your User collection or creating a test user
USER_ID="507f1f77bcf86cd799439011"  # Replace with actual user ID

echo -e "${YELLOW}Note: Please replace USER_ID in this script with an actual user ID from your database${NC}"
echo ""

# Test 1: Create a transaction (Online payment)
echo -e "${YELLOW}Test 1: Creating Online transaction...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"amount\": 4087,
    \"type\": \"Online\",
    \"status\": \"Success\",
    \"paymentMode\": \"Card ending in 4242\"
  }")

echo "$RESPONSE" | jq '.'
echo ""

# Test 2: Create a COD transaction
echo -e "${YELLOW}Test 2: Creating COD transaction...${NC}"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"amount\": 2599,
    \"type\": \"COD\",
    \"status\": \"Pending\",
    \"paymentMode\": \"Cash on Delivery\"
  }" | jq '.'
echo ""

# Test 3: Create a Refund transaction
echo -e "${YELLOW}Test 3: Creating Refund transaction...${NC}"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"amount\": 1500,
    \"type\": \"Refund\",
    \"status\": \"Success\",
    \"paymentMode\": \"UPI Refund\"
  }" | jq '.'
echo ""

# Test 4: Get all transactions for user
echo -e "${YELLOW}Test 4: Fetching all transactions for user...${NC}"
curl -s "$BASE_URL?userId=$USER_ID" | jq '.'
echo ""

# Test 5: Filter by type (Online)
echo -e "${YELLOW}Test 5: Filtering by type (Online)...${NC}"
curl -s "$BASE_URL?userId=$USER_ID&type=Online" | jq '.'
echo ""

# Test 6: Filter by date range
echo -e "${YELLOW}Test 6: Filtering by date range...${NC}"
DATE_FROM="2026-01-01T00:00:00.000Z"
DATE_TO="2026-12-31T23:59:59.000Z"
curl -s "$BASE_URL?userId=$USER_ID&dateFrom=$DATE_FROM&dateTo=$DATE_TO" | jq '.'
echo ""

# Test 7: Export as CSV
echo -e "${YELLOW}Test 7: Exporting transactions as CSV...${NC}"
curl -s "$BASE_URL/export?userId=$USER_ID&format=csv" -o transactions.csv
if [ -f transactions.csv ]; then
  echo -e "${GREEN}✓ CSV file created successfully${NC}"
  head -n 5 transactions.csv
else
  echo -e "${RED}✗ CSV export failed${NC}"
fi
echo ""

# Test 8: Export as PDF
echo -e "${YELLOW}Test 8: Exporting transactions as PDF...${NC}"
curl -s "$BASE_URL/export?userId=$USER_ID&format=pdf" -o transactions.pdf
if [ -f transactions.pdf ]; then
  echo -e "${GREEN}✓ PDF file created successfully ($(du -h transactions.pdf | cut -f1))${NC}"
else
  echo -e "${RED}✗ PDF export failed${NC}"
fi
echo ""

# Test 9: Error handling - Missing userId
echo -e "${YELLOW}Test 9: Testing error handling (missing userId)...${NC}"
curl -s "$BASE_URL" | jq '.'
echo ""

# Test 10: Error handling - Invalid type
echo -e "${YELLOW}Test 10: Testing error handling (invalid type)...${NC}"
curl -s "$BASE_URL?userId=$USER_ID&type=InvalidType" | jq '.'
echo ""

echo "========================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "========================================="
