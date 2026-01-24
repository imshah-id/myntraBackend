# Transaction API Quick Reference

## Base URL

```
http://localhost:5000/api/transactions
```

## Endpoints

### 1. Create Transaction

**POST** `/api/transactions`

**Body:**

```json
{
  "userId": "string (required)",
  "amount": "number (required, >= 0)",
  "type": "Online | COD | Refund (required)",
  "status": "Success | Pending | Failed (required)",
  "paymentMode": "string (required)",
  "date": "ISO date string (optional)"
}
```

**Response:** `201 Created`

```json
{
  "_id": "...",
  "userId": "...",
  "date": "2026-01-24T09:10:00.000Z",
  "amount": 4087,
  "type": "Online",
  "status": "Success",
  "paymentMode": "Card ending in 4242",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 2. Get Transactions

**GET** `/api/transactions`

**Query Parameters:**

- `userId` (required) - User's MongoDB ObjectId
- `type` (optional) - Filter: `Online`, `COD`, or `Refund`
- `dateFrom` (optional) - ISO date string
- `dateTo` (optional) - ISO date string

**Examples:**

```bash
# All transactions
?userId=507f1f77bcf86cd799439011

# Filter by type
?userId=507f1f77bcf86cd799439011&type=Online

# Date range
?userId=507f1f77bcf86cd799439011&dateFrom=2026-01-01T00:00:00.000Z&dateTo=2026-01-31T23:59:59.000Z
```

**Response:** `200 OK` - Array of transactions (sorted by date, newest first)

---

### 3. Export Transactions

**GET** `/api/transactions/export`

**Query Parameters:**

- `userId` (required)
- `format` (required) - `pdf` or `csv`
- `type` (optional) - Filter by type
- `dateFrom` (optional) - Start date
- `dateTo` (optional) - End date

**Examples:**

```bash
# CSV export
?userId=507f1f77bcf86cd799439011&format=csv

# PDF export with filters
?userId=507f1f77bcf86cd799439011&format=pdf&type=Online
```

**Response:** File download (CSV or PDF)

---

## Error Responses

**400 Bad Request:**

```json
{
  "error": "Missing required fields",
  "required": ["userId", "amount", "type", "status", "paymentMode"]
}
```

**500 Server Error:**

```json
{
  "error": "Error message"
}
```

---

## Testing

Run the test script:

```bash
# 1. Update USER_ID in test_transactions.sh
# 2. Run tests
./test_transactions.sh
```

Or test manually with curl:

```bash
# Create transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"YOUR_USER_ID","amount":4087,"type":"Online","status":"Success","paymentMode":"Card ending in 4242"}'

# Get transactions
curl "http://localhost:5000/api/transactions?userId=YOUR_USER_ID"

# Export CSV
curl "http://localhost:5000/api/transactions/export?userId=YOUR_USER_ID&format=csv" -o transactions.csv
```
