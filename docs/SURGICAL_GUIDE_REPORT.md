# Surgical Guide Report - Implementation Documentation

## 📋 Overview

The Surgical Guide Report is a comprehensive, modern reporting interface that connects to the PowerBI test CP database (MySQL) to display surgical guide case data with advanced filtering, sorting, and analytics capabilities.

### Key Features
- ✅ **Date Range Filtering**: Select custom date ranges (up to 1 year)
- ✅ **Responsive Data Table**: Sortable columns with pagination
- ✅ **Summary Statistics**: Total cases, costs, averages, doctor counts
- ✅ **Doctor Breakdown**: Per-doctor analytics and performance metrics
- ✅ **CSV Export**: Download report data for external analysis
- ✅ **Role-Based Access**: Finance22 group members only
- ✅ **API Documentation**: Swagger docs for Developers22 group
- ✅ **Mobile Responsive**: Works on all screen sizes
- ✅ **Version Tracking**: v1.1.0 displayed in footer

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express
- MySQL2 (with connection pooling)
- Casbin (RBAC authorization)
- Swagger/OpenAPI documentation
- Winston logging

**Frontend:**
- Vue 3 (Composition API)
- Vuetify 3 (Material Design)
- Axios (API calls)
- Vue Router

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│           Frontend (Vue 3)              │
│  - SurgicalGuideReportView.vue          │
│  - Navigation & Routing                 │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
┌──────────────┴──────────────────────────┐
│           Backend (Express)             │
│  ┌────────────────────────────────────┐ │
│  │   Routes (surgicalGuideReport.routes.js) │
│  └────────────┬───────────────────────┘ │
│  ┌────────────┴───────────────────────┐ │
│  │  Controllers (surgicalGuideReport.controller.js) │
│  └────────────┬───────────────────────┘ │
│  ┌────────────┴───────────────────────┐ │
│  │  Services (surgicalGuideReport.service.js) │
│  └────────────┬───────────────────────┘ │
│  ┌────────────┴───────────────────────┐ │
│  │  Models (surgicalGuideReport.model.js) │
│  └────────────┬───────────────────────┘ │
└───────────────┼─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│     Database (MySQL - PowerBI CP)       │
│     Table: surgical_guides              │
└─────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Required Table: `surgical_guides`

```sql
CREATE TABLE surgical_guides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  procedure_type VARCHAR(100),
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_date (date),
  INDEX idx_doctor (doctor_name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Sample Data Insert

```sql
INSERT INTO surgical_guides (case_number, date, doctor_name, patient_name, cost, procedure_type, status) VALUES
('SG-2024-001', '2024-01-15', 'Dr. John Smith', 'Jane Doe', 1500.00, 'Full Arch', 'Completed'),
('SG-2024-002', '2024-01-20', 'Dr. Sarah Johnson', 'Bob Wilson', 2000.00, 'Implant Guide', 'Completed'),
('SG-2024-003', '2024-02-05', 'Dr. John Smith', 'Alice Brown', 1800.00, 'Partial Guide', 'In Progress'),
('SG-2024-004', '2024-02-10', 'Dr. Michael Lee', 'Charlie Davis', 1650.00, 'Full Arch', 'Completed');
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
# Backend (server directory)
cd server
npm install mysql2

# Dependencies already included:
# - express
# - casbin
# - swagger-jsdoc
# - swagger-ui-express
```

### 2. Configure Database Connection

Create/update `.env` file in the `server` directory:

```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=powerbi_cp_test
DB_CONNECTION_LIMIT=10
```

### 3. Configure Casbin Groups

The following groups are already configured in `server/src/config/casbin/policy.csv`:

- **Finance22**: Full access to surgical guide reports
- **Developers22**: API documentation access

**Test Users:**
- `heshamahmed8877@gmail.com` - Has Finance22 + Developers22 access
- `bob@3ddx.com` - Has Finance22 access

### 4. Create Database Table

Connect to your MySQL database and run the schema creation SQL (see Database Schema section above).

### 5. Start the Application

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend client
cd client
npm run dev
```

### 6. Access the Report

1. Navigate to `http://localhost:3000` (or your configured port)
2. Login with a user that has Finance22 group membership
3. Go to **Finance → Surgical Guide Report** in the sidebar

---

## 🔐 Access Control

### Group Permissions

| Group | Report Access | Export CSV | Swagger Docs | API Access |
|-------|--------------|------------|--------------|------------|
| **Finance22** | ✅ Yes | ✅ Yes | ❌ No | ✅ Read |
| **Developers22** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Full |
| **admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Full |
| Other users | ❌ No | ❌ No | ❌ No | ❌ No |

### Testing Access Control

**Using Development Mode Simulator:**

1. Enable dev toolbar (bottom of screen in development)
2. Click "Groups" chip
3. Select "Finance22" checkbox
4. Navigate to Finance → Surgical Guide Report
5. Report should now be accessible

**Adding Real Users:**

Edit `server/src/config/casbin/policy.csv`:

```csv
# Add user to Finance22 group
g, user.email@domain.com, Finance22

# Add user to Developers22 group (for Swagger access)
g, developer.email@domain.com, Developers22
```

---

## 📡 API Reference

### Base URL
```
http://localhost:3001/api/reports
```

### Endpoints

#### 1. Get Report Data
```http
GET /surgical_guide
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 50, max: 100) |
| sortBy | string | No | Sort field (default: 'date') |
| sortOrder | string | No | Sort order: 'asc' or 'desc' (default: 'desc') |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "caseNumber": "SG-2024-001",
      "date": "2024-01-15",
      "dDoctor": "Dr. John Smith",
      "patientName": "Jane Doe",
      "cost": 1500.00,
      "procedureType": "Full Arch",
      "status": "Completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "sort": {
    "field": "date",
    "order": "DESC"
  },
  "requestId": "req_abc123"
}
```

#### 2. Get Summary Statistics
```http
GET /surgical_guide/summary?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCases": 150,
    "totalCost": 225000.00,
    "averageCost": 1500.00,
    "minCost": 500.00,
    "maxCost": 5000.00,
    "uniqueDoctors": 12,
    "uniquePatients": 145
  },
  "requestId": "req_xyz789"
}
```

#### 3. Get Doctor Breakdown
```http
GET /surgical_guide/doctors?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "doctorName": "Dr. John Smith",
      "caseCount": 25,
      "totalCost": 37500.00,
      "averageCost": 1500.00
    }
  ],
  "requestId": "req_def456"
}
```

#### 4. Export to CSV
```http
GET /surgical_guide/export?startDate=2024-01-01&endDate=2024-12-31
```

**Response:** CSV file download

#### 5. Check Access Permissions
```http
GET /surgical_guide/access
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasReportAccess": true,
    "hasSwaggerAccess": false,
    "userGroups": ["Finance22", "users"]
  }
}
```

### Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "http": 400,
    "message": "Invalid date range. Start date must be before end date."
  },
  "requestId": "req_abc123"
}
```

**Error Codes:**
- `400` - Validation error (invalid dates, missing parameters)
- `401` - Authentication required
- `403` - Access denied (not a Finance22 member)
- `500` - Internal server error

---

## 🎨 UI Components

### Main Features

1. **Date Range Picker**
   - Start and end date selection
   - Validation (max 1 year range)
   - YYYY-MM-DD format

2. **Summary Cards**
   - Total Cases (Primary color)
   - Total Cost (Success color)
   - Average Cost (Info color)
   - Unique Doctors (Secondary color)

3. **Data Table**
   - Sortable columns
   - Pagination controls
   - Row hover effects
   - Status color chips
   - Responsive layout

4. **Doctor Breakdown Table**
   - Doctor avatars
   - Case counts
   - Cost analytics
   - Sortable columns

5. **Export Button**
   - Download CSV
   - Loading state
   - Success notification

6. **Swagger Link** (Developers22 only)
   - Opens in new tab
   - Top-right corner
   - API icon

---

## 🧪 Testing

### Manual Testing Checklist

#### Access Control
- [ ] Non-Finance22 users see "Access Denied" message
- [ ] Finance22 users can view report
- [ ] Developers22 users see Swagger link
- [ ] Admin users have full access

#### Functionality
- [ ] Date range validation works
- [ ] Report loads with valid date range
- [ ] Sorting works on all columns
- [ ] Pagination navigates correctly
- [ ] Summary statistics display accurately
- [ ] Doctor breakdown shows correct data
- [ ] CSV export downloads successfully

#### Responsive Design
- [ ] Desktop layout (1920px+)
- [ ] Tablet layout (768px-1919px)
- [ ] Mobile layout (<768px)
- [ ] Table scrolls horizontally on small screens
- [ ] Summary cards stack on mobile

#### Error Handling
- [ ] Invalid date range shows warning
- [ ] API errors display user-friendly messages
- [ ] Loading states show during data fetch
- [ ] Empty state displays when no data

### API Testing with cURL

```bash
# Test report endpoint (requires authentication cookie)
curl -X GET "http://localhost:3001/api/reports/surgical_guide?startDate=2024-01-01&endDate=2024-12-31" \
  --cookie "session_cookie_here"

# Test summary endpoint
curl -X GET "http://localhost:3001/api/reports/surgical_guide/summary?startDate=2024-01-01&endDate=2024-12-31" \
  --cookie "session_cookie_here"

# Test doctor breakdown
curl -X GET "http://localhost:3001/api/reports/surgical_guide/doctors?startDate=2024-01-01&endDate=2024-12-31" \
  --cookie "session_cookie_here"

# Test access check
curl -X GET "http://localhost:3001/api/reports/surgical_guide/access" \
  --cookie "session_cookie_here"
```

---

## 📝 Code Organization

### Backend Files

```
server/src/
├── controllers/
│   └── surgicalGuideReport.controller.js  # HTTP request handlers
├── services/
│   ├── surgicalGuideReport.service.js     # Business logic
│   └── database.js                         # MySQL connection pool
├── models/
│   └── surgicalGuideReport.model.js       # Database queries
├── routes/
│   └── surgicalGuideReport.routes.js      # API endpoints + Swagger docs
├── middleware/
│   └── auth.js                             # Authentication guards
└── config/
    └── casbin/
        ├── policy.csv                      # Finance22, Developers22 policies
        └── users.json                      # Group definitions
```

### Frontend Files

```
client/src/
├── views/
│   └── Reports/
│       └── SurgicalGuideReportView.vue    # Main report component
├── router/
│   └── index.js                            # Route definition
├── config/
│   └── navigationConfig.js                 # Sidebar navigation
└── stores/
    └── devMode.js                          # Development mode simulator
```

---

## 🚀 Deployment

### Production Checklist

#### Backend
- [ ] Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` in production `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Ensure MySQL connection pooling configured (10-20 connections)
- [ ] Enable database SSL if required
- [ ] Configure CORS for production client URL
- [ ] Set up log rotation for Winston logs
- [ ] Enable rate limiting for report endpoints

#### Frontend
- [ ] Build production bundle: `npm run build`
- [ ] Update `VITE_API_URL` to production API endpoint
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify mobile responsiveness
- [ ] Check Lighthouse performance score

#### Database
- [ ] Create indexes on `date`, `doctor_name`, `status` columns
- [ ] Set up automated backups
- [ ] Configure database monitoring
- [ ] Test query performance with large datasets (10,000+ records)
- [ ] Create read-only database user for report queries

#### Security
- [ ] Verify Casbin policies are correct
- [ ] Test access control with real user groups
- [ ] Enable HTTPS in production
- [ ] Configure session security (secure cookies, HTTPS-only)
- [ ] Set up API rate limiting
- [ ] Review and sanitize all SQL queries (parameterized)

---

## 🔧 Troubleshooting

### Common Issues

#### "Access Denied" for Finance22 users

**Solution:**
1. Check Casbin policy.csv:
   ```csv
   g, user@email.com, Finance22
   ```
2. Restart backend server after policy changes
3. Clear browser cookies and re-login

#### "Database connection failed"

**Solution:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check `.env` file has correct credentials
3. Ensure `surgical_guides` table exists
4. Check firewall allows MySQL port (3306)

#### Report loads slowly

**Solution:**
1. Add database indexes:
   ```sql
   CREATE INDEX idx_date ON surgical_guides(date);
   CREATE INDEX idx_doctor ON surgical_guides(doctor_name);
   ```
2. Reduce date range (max 3 months for large datasets)
3. Increase database connection pool size

#### CSV export fails

**Solution:**
1. Check browser console for errors
2. Verify user has Finance22 group membership
3. Ensure date range is valid
4. Check server logs for errors

---

## 📚 Additional Resources

- **Swagger API Docs**: http://localhost:3001/docs
- **Casbin Documentation**: https://casbin.org/docs/en/overview
- **Vuetify 3 Components**: https://vuetifyjs.com/en/components/data-tables/
- **MySQL2 Documentation**: https://github.com/sidorares/node-mysql2

---

## 📞 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review server logs: `server/logs/`
3. Check browser console for frontend errors
4. Contact the 3D Diagnostix development team

---

## 📋 Version History

### v1.1.0 (2025-01-XX)
- ✅ Enhanced filter section UI with professional statistics cards
- ✅ Improved date picker using Vuetify date picker components
- ✅ Enhanced pagination UI with compact and professional design
- ✅ Improved table layout with fixed header and footer
- ✅ Better spacing and visual hierarchy in filter section
- ✅ Horizontal layout for action buttons (Reload/Export)
- ✅ Enhanced summary statistics cards with icons and better styling
- ✅ Improved responsive design for mobile devices

### v1.0.0 (2025-10-27)
- ✅ Initial release
- ✅ Date range filtering
- ✅ Summary statistics
- ✅ Doctor breakdown
- ✅ CSV export
- ✅ Finance22/Developers22 group access
- ✅ Swagger API documentation
- ✅ Responsive design
- ✅ Complete test coverage

---

**Built with ❤️ by 3D Diagnostix Development Team**
