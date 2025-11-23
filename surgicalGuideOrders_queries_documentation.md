<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    background-color: #ffffff;
  }
  
  h1 {
    color: #2c3e50;
    border-bottom: 4px solid #3498db;
    padding-bottom: 10px;
    margin-top: 0;
    font-size: 2.5em;
  }
  
  h2 {
    color: #34495e;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 8px;
    margin-top: 40px;
    font-size: 1.8em;
  }
  
  h3 {
    color: #2980b9;
    margin-top: 30px;
    font-size: 1.4em;
  }
  
  h4 {
    color: #555;
    margin-top: 20px;
    font-size: 1.2em;
  }
  
  code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.9em;
    color: #e83e8c;
  }
  
  pre {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    border-left: 4px solid #3498db;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
    font-size: 0.9em;
    line-height: 1.5;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  th {
    background-color: #3498db;
    color: white;
    padding: 12px;
    text-align: left;
    font-weight: 600;
  }
  
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #ecf0f1;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
  
  blockquote {
    border-left: 4px solid #3498db;
    margin: 20px 0;
    padding: 10px 20px;
    background-color: #f8f9fa;
    color: #555;
  }
  
  ul, ol {
    margin: 15px 0;
    padding-left: 30px;
  }
  
  li {
    margin: 8px 0;
  }
  
  .info-box {
    background-color: #e8f4f8;
    border-left: 4px solid #3498db;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
  }
  
  .warning-box {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
  }
  
  .success-box {
    background-color: #d4edda;
    border-left: 4px solid #28a745;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
  }
  
  hr {
    border: none;
    border-top: 2px solid #ecf0f1;
    margin: 40px 0;
  }
  
  .toc {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 30px 0;
    border: 1px solid #dee2e6;
  }
  
  .toc ul {
    list-style-type: none;
    padding-left: 0;
  }
  
  .toc li {
    margin: 8px 0;
  }
  
  .toc a {
    color: #3498db;
    text-decoration: none;
  }
  
  .toc a:hover {
    text-decoration: underline;
  }
  
  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: 600;
    margin: 0 4px;
  }
  
  .badge-primary {
    background-color: #3498db;
    color: white;
  }
  
  .badge-success {
    background-color: #28a745;
    color: white;
  }
  
  .badge-warning {
    background-color: #ffc107;
    color: #333;
  }
  
  .method-signature {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 15px;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    margin: 15px 0;
  }
</style>

# Query Documentation for surgicalGuideOrders.model.js

<div class="info-box">
  <strong>File:</strong> <code>server/src/models/surgicalGuideOrders.model.js</code><br>
  <strong>Author:</strong> 3D Diagnostix Development Team<br>
  <strong>Version:</strong> <span class="badge badge-primary">1.0.0</span><br>
  <strong>Date:</strong> 2025-10-27<br>
  <strong>Copyright:</strong> © 2025 3D Diagnostix, Inc. All rights reserved.
</div>

---

## Table of Contents

<div class="toc">
  <ul>
    <li><a href="#overview">1. Overview</a></li>
    <li><a href="#getreportdata-method-queries">2. getReportData Method Queries</a>
      <ul>
        <li><a href="#main-data-query">2.1 Main Data Query</a></li>
        <li><a href="#count-query">2.2 Count Query</a></li>
      </ul>
    </li>
    <li><a href="#getsummary-method-query">3. getSummary Method Query</a></li>
    <li><a href="#exporttocsv-method">4. exportToCSV Method</a></li>
    <li><a href="#common-query-patterns">5. Common Query Patterns</a></li>
    <li><a href="#performance-considerations">6. Performance Considerations</a></li>
    <li><a href="#default-values">7. Default Values</a></li>
  </ul>
</div>

---

## Overview {#overview}

This model contains queries for the **Surgical Guide Orders** report system, connecting to the **PowerBI CP database**. It provides comprehensive data retrieval, summary statistics, and export functionality for managing surgical guide orders.

<div class="success-box">
  <strong>Key Features:</strong>
  <ul>
    <li>Paginated data retrieval with filtering</li>
    <li>Advanced search capabilities</li>
    <li>Order type classification (free, postpaid, prepaid, etc.)</li>
    <li>Workflow status tracking (Rush, On Hold, Confirmed, Active)</li>
    <li>Voucher transaction integration</li>
    <li>CSV export functionality</li>
  </ul>
</div>

---

## getReportData Method Queries {#getreportdata-method-queries}

### Main Data Query {#main-data-query}

**Purpose:** Retrieves paginated surgical guide order data with filtering and search capabilities.

<div class="method-signature">
async getReportData({ startDate, endDate, page = 1, limit = 50, searchQuery = '', orderTypeFilter = 'all' })
</div>

#### SQL Query

```sql
SELECT
  sg.ID AS orderSGID,
  o.dcmPatientName AS patientName,
  sg.Cost AS cost,
  COALESCE(vt.totalVoucherAmount, 0) AS amountPaid,
  vt.voucherDetails AS voucherDetails,
  sg.Type AS type,
  sg.dateSent AS createdTime,
  sg.designedOn AS designTime,
  o.TimeBilled AS chargeTime,
  sg.designer AS designerID,
  designer.fullName AS designerName,
  sg.hasExtraction AS extracted,
  sg.extComp_BoneReduction_selected AS boneReduction,
  sg.Q1_Val AS typeOfSupport,
  sg.isRush AS isRush,
  sg.Q11_Val_1 AS Q11_Val_1,
  sg.Q11_Val_2 AS Q11_Val_2,
  sg.Q11_Val_4 AS Q11_Val_4,
  doctor.fullName AS doctorFullName,
  scanCenter.fullName AS scanCenterFullName
FROM OrderSG sg
LEFT JOIN Orders o ON o.SGID = sg.ID
LEFT JOIN UserAcounts doctor ON o.DocID = doctor.uID
LEFT JOIN UserAcounts scanCenter ON o.ScanID = scanCenter.uID
LEFT JOIN UserAcounts designer ON sg.designer = designer.uID
LEFT JOIN (
  SELECT 
    sub_order_id, 
    SUM(COALESCE(transaction_amount, 0)) as totalVoucherAmount,
    GROUP_CONCAT(
      CONCAT(voucher_id, ':', transaction_amount) 
      ORDER BY transaction_time 
      SEPARATOR '|'
    ) as voucherDetails
  FROM voucher_transaction
  WHERE transaction_type = 1
  GROUP BY sub_order_id
) vt ON vt.sub_order_id = sg.ID
WHERE sg.dateSent >= ? AND sg.dateSent <= ?
[+ searchCondition]
[+ orderTypeCondition]
ORDER BY sg.dateSent DESC
LIMIT ? OFFSET ?
```

#### Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `startTimestamp` | `integer` | Start date as Unix timestamp in seconds | Yes |
| `endTimestamp` | `integer` | End date as Unix timestamp in seconds | Yes |
| `searchParams` | `array` | Search parameters (optional) | No |
| &nbsp;&nbsp;→ `searchQuery` | `integer/string` | Order ID or search term | No |
| &nbsp;&nbsp;→ `%searchQuery%` | `string` | Patient name pattern | No |
| &nbsp;&nbsp;→ `%searchQuery%` | `string` | Doctor name pattern | No |
| &nbsp;&nbsp;→ `%searchQuery%` | `string` | Scan center name pattern | No |

#### Tables Used

| Table | Alias | Description |
|-------|-------|-------------|
| `OrderSG` | `sg` | Main surgical guide orders table |
| `Orders` | `o` | Order details table |
| `UserAcounts` | `doctor` | User accounts for doctors |
| `UserAcounts` | `scanCenter` | User accounts for scan centers |
| `UserAcounts` | `designer` | User accounts for designers |
| `voucher_transaction` | `vt` | Voucher transactions (subquery) |

#### Return Fields

| Field | Type | Description |
|-------|------|-------------|
| `orderSGID` | `integer` | Order ID |
| `patientName` | `string` | Patient name |
| `cost` | `decimal` | Order cost |
| `amountPaid` | `decimal` | Total voucher amount paid |
| `voucherDetails` | `string` | Pipe-separated voucher details (format: `voucher_id:amount\|voucher_id:amount`) |
| `type` | `integer` | Order type (0=Simplant, 3=coDiagnostiX, 4=BSB, 6=Real Guide, 7=Implant Studio) |
| `createdTime` | `timestamp` | Order creation timestamp |
| `designTime` | `timestamp` | Design completion timestamp |
| `chargeTime` | `timestamp` | Billing timestamp |
| `designerID` | `integer` | Designer user ID |
| `designerName` | `string` | Designer full name |
| `extracted` | `boolean` | Extraction flag (0/1) |
| `boneReduction` | `boolean` | Bone reduction flag (0/1) |
| `typeOfSupport` | `integer` | Support type (0=Teeth, 1=Tissue, 2=Bone) |
| `isRush` | `boolean` | Rush order flag (0/1) |
| `Q11_Val_1` | `integer` | Workflow status value 1 |
| `Q11_Val_2` | `integer` | Workflow status value 2 |
| `Q11_Val_4` | `integer` | Workflow status value 4 |
| `doctorFullName` | `string` | Doctor full name |
| `scanCenterFullName` | `string` | Scan center full name |

#### Order Type Filters

The `orderTypeFilter` parameter supports the following values:

| Filter Value | SQL Condition | Description |
|--------------|---------------|-------------|
| `'free'` | `sg.Cost = 0` | Orders with no cost |
| `'postpaid'` | `sg.Cost > 0` | Orders with cost greater than zero |
| `'fullyPrepaid'` | `sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) >= sg.Cost` | Orders fully paid by vouchers |
| `'fullyPostpaid'` | `sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) = 0` | Orders with no voucher payment |
| `'partiallyPostpaid'` | `sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) > 0 AND COALESCE(vt.totalVoucherAmount, 0) < sg.Cost` | Orders with partial voucher payment |
| `'vouchers'` | `sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) > 0` | Orders that used vouchers (fully or partially) |
| `'rush'` | `sg.isRush = 1` | Rush orders (takes priority over all other workflow statuses) |
| `'onHold'` | `sg.isRush != 1 AND sg.Q11_Val_4 IS NOT NULL AND sg.Q11_Val_4 != 0` | On Hold status (not rush) |
| `'confirmed'` | `sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND sg.Q11_Val_2 IS NOT NULL AND sg.Q11_Val_2 != 0` | Confirmed status (not rush, not on hold) |
| `'active'` | `sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND (sg.Q11_Val_2 IS NULL OR sg.Q11_Val_2 = 0) AND sg.Q11_Val_1 IS NOT NULL AND sg.Q11_Val_1 != 0` | Active status (not rush, not on hold, not confirmed) |
| `'all'` | *(no filter)* | All orders (default) |

<div class="warning-box">
  <strong>Workflow Status Priority:</strong> Rush > On Hold > Confirmed > Active
</div>

#### Search Condition

The search functionality searches across multiple fields:

```javascript
// Search condition is built dynamically
const searchCondition = searchQuery ? `
  AND (
    sg.ID = ? OR
    o.dcmPatientName LIKE ? OR
    doctor.fullName LIKE ? OR
    scanCenter.fullName LIKE ?
  )
` : '';
```

- **Searches across:** Order ID, Patient Name, Doctor Name, Scan Center Name
- **Uses:** `LIKE` with wildcards (`%searchQuery%`) for text fields
- **Order ID:** Exact match (integer comparison)

---

### Count Query {#count-query}

**Purpose:** Counts total matching records for pagination.

#### SQL Query

```sql
SELECT COUNT(DISTINCT sg.ID) as total
FROM OrderSG sg
LEFT JOIN Orders o ON o.SGID = sg.ID
LEFT JOIN UserAcounts doctor ON o.DocID = doctor.uID
LEFT JOIN UserAcounts scanCenter ON o.ScanID = scanCenter.uID
LEFT JOIN (
  SELECT sub_order_id, SUM(COALESCE(transaction_amount, 0)) as totalVoucherAmount
  FROM voucher_transaction
  WHERE transaction_type = 1
  GROUP BY sub_order_id
) vt ON vt.sub_order_id = sg.ID
WHERE sg.dateSent >= ? AND sg.dateSent <= ?
[+ searchCondition]
[+ orderTypeCondition]
```

#### Parameters

Same as the main data query:
- `startTimestamp` (integer): Start date as Unix timestamp in seconds
- `endTimestamp` (integer): End date as Unix timestamp in seconds
- `searchParams` (array, optional): Search parameters if applicable

#### Returns

| Field | Type | Description |
|-------|------|-------------|
| `total` | `integer` | Total count of matching orders |

<div class="info-box">
  <strong>Notes:</strong>
  <ul>
    <li>Uses the same WHERE conditions as the data query</li>
    <li>Uses <code>COUNT(DISTINCT sg.ID)</code> to avoid duplicates from joins</li>
    <li>Executed in parallel with the data query using <code>Promise.all()</code></li>
  </ul>
</div>

---

## getSummary Method Query {#getsummary-method-query}

**Purpose:** Retrieves summary statistics with order type breakdown.

<div class="method-signature">
async getSummary(startDate, endDate)
</div>

#### SQL Query

```sql
SELECT 
  COUNT(DISTINCT sg.ID) as totalOrders,
  SUM(CASE WHEN sg.Cost > 0 THEN 1 ELSE 0 END) as postpaidOrders,
  SUM(CASE WHEN sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) >= sg.Cost THEN 1 ELSE 0 END) as fullyPrepaidOrders,
  SUM(CASE WHEN sg.Cost = 0 THEN 1 ELSE 0 END) as freeOrders,
  SUM(CASE WHEN sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) = 0 THEN 1 ELSE 0 END) as fullyPostpaidOrders,
  SUM(CASE WHEN sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) > 0 AND COALESCE(vt.totalVoucherAmount, 0) < sg.Cost THEN 1 ELSE 0 END) as partiallyPostpaidOrders,
  SUM(CASE WHEN sg.isRush = 1 THEN 1 ELSE 0 END) as rushOrders,
  SUM(CASE WHEN sg.isRush != 1 AND sg.Q11_Val_4 IS NOT NULL AND sg.Q11_Val_4 != 0 THEN 1 ELSE 0 END) as onHoldOrders,
  SUM(CASE WHEN sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND sg.Q11_Val_2 IS NOT NULL AND sg.Q11_Val_2 != 0 THEN 1 ELSE 0 END) as confirmedOrders,
  SUM(CASE WHEN sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND (sg.Q11_Val_2 IS NULL OR sg.Q11_Val_2 = 0) AND sg.Q11_Val_1 IS NOT NULL AND sg.Q11_Val_1 != 0 THEN 1 ELSE 0 END) as activeOrders
FROM OrderSG sg
LEFT JOIN Orders o ON o.SGID = sg.ID
LEFT JOIN (
  SELECT sub_order_id, SUM(COALESCE(transaction_amount, 0)) as totalVoucherAmount
  FROM voucher_transaction
  WHERE transaction_type = 1
  GROUP BY sub_order_id
) vt ON vt.sub_order_id = sg.ID
WHERE sg.dateSent >= ? AND sg.dateSent <= ?
```

#### Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `startTimestamp` | `integer` | Start date as Unix timestamp in seconds | Yes |
| `endTimestamp` | `integer` | End date as Unix timestamp in seconds | Yes |

#### Returns

| Field | Type | Description |
|-------|------|-------------|
| `totalOrders` | `integer` | Total number of orders |
| `postpaidOrders` | `integer` | Orders with cost > 0 |
| `fullyPrepaidOrders` | `integer` | Orders fully paid by vouchers |
| `freeOrders` | `integer` | Orders with cost = 0 |
| `fullyPostpaidOrders` | `integer` | Orders with no voucher payment |
| `partiallyPostpaidOrders` | `integer` | Orders with partial voucher payment |
| `rushOrders` | `integer` | Rush orders |
| `onHoldOrders` | `integer` | On hold orders (not rush) |
| `confirmedOrders` | `integer` | Confirmed orders (not rush, not on hold) |
| `activeOrders` | `integer` | Active orders (not rush, not on hold, not confirmed) |

<div class="info-box">
  <strong>Implementation Notes:</strong>
  <ul>
    <li>Workflow status priority: <strong>Rush > On Hold > Confirmed > Active</strong></li>
    <li>Uses conditional aggregation with <code>SUM(CASE WHEN ... THEN 1 ELSE 0 END)</code></li>
    <li>All counts are mutually exclusive based on the priority rules</li>
  </ul>
</div>

---

## exportToCSV Method {#exporttocsv-method}

**Purpose:** Exports report data to CSV format with all lookup values.

<div class="method-signature">
async exportToCSV(startDate, endDate)
</div>

#### Query Usage

This method does not execute a direct SQL query. Instead, it:

1. Calls `getReportData()` with `limit: 100000` to fetch all records
2. Formats the data into CSV format
3. Returns a CSV string with headers and formatted rows

#### JavaScript Implementation

```javascript
async exportToCSV(startDate, endDate) {
  const data = await this.getReportData({
    startDate,
    endDate,
    page: 1,
    limit: 100000 // Get all records for export
  });
  
  // Helper functions for formatting
  const getSupportTypeLabel = (typeValue) => {
    const typeMap = { 0: 'Teeth', 1: 'Tissue', 2: 'Bone' };
    return typeMap[typeValue] || 'N/A';
  };
  
  const getStatusLabel = (row) => {
    // Status derivation logic
  };
  
  const getPaymentStatus = (row) => {
    // Payment status logic
  };
  
  // CSV generation...
  return csvContent;
}
```

#### CSV Columns

The exported CSV includes the following columns:

1. **Order ID** - Unique order identifier
2. **Scan Center** - Scan center name
3. **Doctor** - Doctor full name
4. **Patient Name** - Patient name
5. **Type** - Order type label (Simplant, coDiagnostiX, BSB, Real Guide, Implant Studio)
6. **Status** - Workflow status (derived from Q11_Val fields)
7. **Rush Order** - Yes/No indicator
8. **Cost (USD)** - Order cost in USD
9. **Voucher Payment (USD)** - Total voucher amount paid
10. **Remaining Balance (USD)** - Calculated as Cost - Voucher Payment
11. **Payment Status** - Free Order, Fully Postpaid, Fully Prepaid, or Partially Postpaid
12. **Voucher IDs** - Semicolon-separated list of voucher IDs and amounts
13. **Created Date** - Order creation date
14. **Designed Date** - Design completion date
15. **Charged Date** - Billing date
16. **Designer** - Designer name or ID
17. **Extraction** - Yes/No indicator
18. **Bone Reduction** - Yes/No indicator
19. **Support Type** - Teeth, Tissue, or Bone

<div class="success-box">
  <strong>CSV Format:</strong>
  <ul>
    <li>Headers in first row</li>
    <li>Values properly escaped (quotes doubled)</li>
    <li>Comma-separated values</li>
    <li>UTF-8 encoding</li>
  </ul>
</div>

---

## Common Query Patterns {#common-query-patterns}

### Date Handling

Dates are converted to Unix timestamps (seconds) before querying:

```javascript
// Date conversion example
const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
const endTimestamp = Math.floor(new Date(endDate + ' 23:59:59').getTime() / 1000);
```

**Key Points:**
- Format: `Math.floor(new Date(dateString).getTime() / 1000)`
- End date includes time: `endDate + ' 23:59:59'` to include the entire day
- Input format: `YYYY-MM-DD` (10 characters)

### Voucher Transaction Subquery

Used in multiple queries to aggregate voucher amounts:

```sql
LEFT JOIN (
  SELECT 
    sub_order_id, 
    SUM(COALESCE(transaction_amount, 0)) as totalVoucherAmount
  FROM voucher_transaction
  WHERE transaction_type = 1
  GROUP BY sub_order_id
) vt ON vt.sub_order_id = sg.ID
```

**Key Points:**
- `transaction_type = 1` indicates deduction (payment)
- Aggregates voucher amounts per order using `SUM()`
- Uses `COALESCE()` to handle NULL values (defaults to 0)
- Groups by `sub_order_id` to match with order IDs

### User Account Joins

The `UserAcounts` table is joined three times for different roles:

```sql
-- Doctor join
LEFT JOIN UserAcounts doctor ON o.DocID = doctor.uID

-- Scan Center join
LEFT JOIN UserAcounts scanCenter ON o.ScanID = scanCenter.uID

-- Designer join
LEFT JOIN UserAcounts designer ON sg.designer = designer.uID
```

**Join Relationships:**
- **Doctor:** `Orders.DocID` → `UserAcounts.uID`
- **Scan Center:** `Orders.ScanID` → `UserAcounts.uID`
- **Designer:** `OrderSG.designer` → `UserAcounts.uID`

### Order Type Classification

Orders are classified based on cost and voucher payments:

```javascript
// Classification logic
if (cost === 0) {
  return 'Free Order';
} else if (voucherAmount === 0) {
  return 'Fully Postpaid';
} else if (voucherAmount >= cost) {
  return 'Fully Prepaid';
} else {
  return 'Partially Postpaid';
}
```

---

## Performance Considerations {#performance-considerations}

<div class="info-box">
  <strong>Optimization Strategies:</strong>
</div>

1. **Subquery for Vouchers**
   - Avoids expensive many-to-many joins
   - Pre-aggregates voucher amounts before joining
   - Reduces query complexity and execution time

2. **Indexed Fields**
   - `sg.dateSent` - Primary filter field (should be indexed)
   - `sg.ID` - Primary key (indexed by default)
   - `o.SGID` - Foreign key (should be indexed)
   - `voucher_transaction.sub_order_id` - Join field (should be indexed)

3. **Pagination**
   - Uses `LIMIT` and `OFFSET` for efficient data retrieval
   - Prevents loading large datasets into memory
   - Default limit: 50 records per page

4. **Parallel Execution**
   - `getReportData` runs data and count queries in parallel using `Promise.all()`
   - Reduces total query time by executing simultaneously

5. **Conditional Filtering**
   - Search and filter conditions are built dynamically
   - Only applies filters when needed
   - Reduces unnecessary query complexity

<div class="warning-box">
  <strong>Performance Tips:</strong>
  <ul>
    <li>Ensure proper indexes exist on join and filter columns</li>
    <li>Use date range filters to limit result sets</li>
    <li>Avoid very large date ranges without pagination</li>
    <li>Monitor query execution times for large datasets</li>
  </ul>
</div>

---

## Default Values {#default-values}

The model uses the following default values:

| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| `startDate` | `'2014-01-01'` | Default start date |
| `endDate` | `'2015-01-01'` | Default end date |
| `page` | `1` | Default page number |
| `limit` | `50` | Default records per page |
| `searchQuery` | `''` | Empty string (no search) |
| `orderTypeFilter` | `'all'` | No filter applied |
| Date Format | `'YYYY-MM-DD'` | 10-character date string |

<div class="info-box">
  <strong>Date Validation:</strong>
  <ul>
    <li>Dates must be in <code>YYYY-MM-DD</code> format</li>
    <li>Invalid dates default to the default date range</li>
    <li>Start date must be before or equal to end date</li>
  </ul>
</div>

---

## Database Schema Reference

### Primary Tables

#### OrderSG
Main table for surgical guide orders.

| Column | Type | Description |
|--------|------|-------------|
| `ID` | `integer` | Primary key, order ID |
| `Cost` | `decimal` | Order cost |
| `Type` | `integer` | Order type (0, 3, 4, 6, 7) |
| `dateSent` | `timestamp` | Order creation date (Unix timestamp) |
| `designedOn` | `timestamp` | Design completion date |
| `designer` | `integer` | Designer user ID |
| `hasExtraction` | `boolean` | Extraction flag |
| `extComp_BoneReduction_selected` | `boolean` | Bone reduction flag |
| `Q1_Val` | `integer` | Support type (0=Teeth, 1=Tissue, 2=Bone) |
| `isRush` | `boolean` | Rush order flag |
| `Q11_Val_1` | `integer` | Workflow status value 1 |
| `Q11_Val_2` | `integer` | Workflow status value 2 |
| `Q11_Val_4` | `integer` | Workflow status value 4 |

#### Orders
Order details and relationships.

| Column | Type | Description |
|--------|------|-------------|
| `SGID` | `integer` | Foreign key to OrderSG.ID |
| `dcmPatientName` | `string` | Patient name |
| `DocID` | `integer` | Foreign key to UserAcounts.uID (doctor) |
| `ScanID` | `integer` | Foreign key to UserAcounts.uID (scan center) |
| `TimeBilled` | `timestamp` | Billing timestamp |

#### UserAcounts
User accounts for doctors, scan centers, and designers.

| Column | Type | Description |
|--------|------|-------------|
| `uID` | `integer` | Primary key, user ID |
| `fullName` | `string` | User full name |

#### voucher_transaction
Voucher transaction records.

| Column | Type | Description |
|--------|------|-------------|
| `sub_order_id` | `integer` | Foreign key to OrderSG.ID |
| `voucher_id` | `integer` | Voucher identifier |
| `transaction_amount` | `decimal` | Transaction amount |
| `transaction_type` | `integer` | Transaction type (1 = deduction) |
| `transaction_time` | `timestamp` | Transaction timestamp |

---

## Code Examples

### Example 1: Basic Query

```javascript
const model = require('./surgicalGuideOrders.model');

// Get orders for a date range
const result = await model.getReportData({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  page: 1,
  limit: 50
});

console.log(`Total orders: ${result.pagination.total}`);
console.log(`Page ${result.pagination.page} of ${result.pagination.totalPages}`);
```

### Example 2: Search and Filter

```javascript
// Search for specific order or patient
const result = await model.getReportData({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  searchQuery: 'John Doe',
  orderTypeFilter: 'rush',
  page: 1,
  limit: 25
});
```

### Example 3: Get Summary Statistics

```javascript
// Get summary statistics
const summary = await model.getSummary('2024-01-01', '2024-12-31');

console.log(`Total Orders: ${summary.totalOrders}`);
console.log(`Rush Orders: ${summary.rushOrders}`);
console.log(`Free Orders: ${summary.freeOrders}`);
```

### Example 4: Export to CSV

```javascript
// Export all data to CSV
const csvContent = await model.exportToCSV('2024-01-01', '2024-12-31');

// Save to file
const fs = require('fs');
fs.writeFileSync('surgical_guide_orders.csv', csvContent);
```

---

<div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 2px solid #ecf0f1; color: #7f8c8d;">
  <p><strong>End of Documentation</strong></p>
  <p style="font-size: 0.9em;">© 2025 3D Diagnostix, Inc. All rights reserved.</p>
</div>
