# DevOps Deployment Briefing - InsightHub

**Date:** Today  
**Purpose:** First deployment coordination meeting  
**Project:** InsightHub - Authorization & Analytics Platform

---

## 📋 Meeting Agenda

1. **Project Overview** - What we've built
2. **Deployment Requirements** - What we need from DevOps
3. **Monitoring Setup** - Prometheus & Grafana integration
4. **Environment Configuration** - Required variables
5. **Testing & Validation** - Post-deployment checks
6. **Next Steps** - Action items

---

## 🎯 Project Overview

### What is InsightHub?

- **Purpose**: Enterprise authorization & analytics platform
- **Stack**: Node.js backend (Express) + Vue.js frontend (Vuetify)
- **Authentication**: Google OAuth 2.0
- **Authorization**: Casbin RBAC (Role-Based Access Control)
- **Database**: MySQL
- **Sessions**: Redis (optional, can use in-memory)

### Key Features

- ✅ Google Workspace SSO authentication
- ✅ Policy-based authorization (Casbin)
- ✅ Surgical Guide financial reports
- ✅ Admin panel for user/policy management
- ✅ Multi-language support (EN, AR, ES, FR)
- ✅ **Prometheus metrics** (NEW)
- ✅ **Grafana dashboards** (NEW)

---

## 🚀 Deployment Requirements

### 1. Server Requirements

**Minimum:**
- Node.js 18+ (LTS recommended)
- MySQL 8.0+
- Redis (optional, for session storage)
- 2GB RAM minimum
- 10GB disk space

**Recommended:**
- Node.js 20 LTS
- MySQL 8.0+
- Redis 7.0+ (for production sessions)
- 4GB+ RAM
- 20GB+ disk space
- SSL certificate (HTTPS)

### 2. Port Configuration

**Backend (Node.js):**
- Default: `3001`
- Configurable via `PORT` environment variable
- Must be accessible for:
  - Frontend API calls
  - Prometheus scraping (if enabled)

**Frontend (Vue.js):**
- Default: `5173` (dev) or `3000` (production)
- Can be served via Nginx/Apache or Express static files

**Prometheus (if self-hosted):**
- Default: `9090`
- Only needed if you're running Prometheus on the same server

**Grafana (if self-hosted):**
- Default: `3000` (or different port if frontend uses 3000)
- Only needed if you're running Grafana on the same server

---

## 🔧 Environment Configuration

### Backend Environment Variables (`server/.env`)

#### Required

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Database
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=insighthub
DB_CONNECTION_LIMIT=10

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/callback

# Session
SESSION_SECRET=your-strong-random-session-secret-min-32-chars
SESSION_COOKIE_DOMAIN=your-domain.com

# CORS
CORS_ORIGIN=https://your-domain.com
```

#### Optional

```bash
# Redis (if using Redis for sessions)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Prometheus Metrics
PROMETHEUS_ENABLED=true
PROMETHEUS_METRICS_PATH=/metrics
PROMETHEUS_BEARER_TOKEN=your-optional-bearer-token

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/insighthub/app.log

# Database Connection Timeouts
DB_CONNECT_TIMEOUT=10000
DB_ACQUIRE_TIMEOUT=60000
```

### Frontend Environment Variables (`client/.env.production`)

```bash
# API Configuration
VITE_API_URL=https://your-api-domain.com
VITE_APP_TITLE=InsightHub

# Grafana (if using embedded Grafana)
VITE_GRAFANA_URL=https://your-grafana-domain.com
VITE_GRAFANA_DASHBOARD_ID=your-dashboard-id
VITE_GRAFANA_ORG_ID=1
```

---

## 📊 Monitoring & Observability

### Prometheus Metrics Endpoint

**Endpoint:** `http://your-server:3001/metrics`

**Status:** ✅ Already implemented and tested

**Available Metrics:**
1. **`sg_report_db_query_duration_seconds`**
   - Database query execution time
   - Labels: `user_email`, `user_username`
   - Type: Histogram

2. **`sg_report_api_fulfillment_duration_seconds`**
   - End-to-end API latency
   - Labels: `user_email`, `user_username`
   - Type: Histogram
   - Scope: Only `/api/reports/surgical_guide/*` endpoints

3. **Default Node.js Metrics** (via `prom-client`)
   - CPU usage
   - Memory usage
   - Event loop lag
   - Garbage collection
   - Active handles/requests

### What We Need from DevOps

#### Option 1: Use Existing Prometheus Infrastructure

1. **Add scrape target** to your Prometheus configuration:
   ```yaml
   scrape_configs:
     - job_name: 'insighthub-backend'
       scrape_interval: 15s
       metrics_path: /metrics
       static_configs:
         - targets: ['your-server:3001']
           labels:
             instance: 'insighthub-production'
             environment: 'production'
   ```

2. **Test metrics endpoint**:
   ```bash
   curl http://your-server:3001/metrics
   ```

3. **Verify scraping** in Prometheus UI

#### Option 2: Self-Hosted Prometheus

- We have startup scripts: `start-prometheus.sh`
- Configuration example: `docs/prometheus-scrape-config.yml`
- Alert rules example: `docs/prometheus-alerts.yml`

### Grafana Dashboard

**Dashboard JSON:** `docs/grafana-dashboard-insighthub-comprehensive.json`

**What it includes:**
- System Overview (CPU, memory, event loop)
- Node.js Runtime metrics
- Application metrics (API latency, query duration)
- Database performance by user
- System info

**Setup Steps:**
1. Import dashboard JSON into Grafana
2. Configure Prometheus data source (if not already done)
3. Verify all panels are showing data
4. Customize as needed

**Access:**
- Embedded in app: `/reports/grafana` (admin/SWD only)
- Direct Grafana URL: Your Grafana instance

---

## 🔒 Security Considerations

### 1. Authentication & Authorization

- ✅ Google OAuth 2.0 (production-ready)
- ✅ Session-based authentication
- ✅ CSRF protection enabled
- ✅ Rate limiting (100 req/min per IP)

### 2. API Security

- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ CORS configured for production domain
- ✅ Input validation and sanitization
- ✅ SQL injection protection (parameterized queries)

### 3. Metrics Endpoint Security

**Current:** Public endpoint (no authentication)

**Recommendation for Production:**
- Option A: Use `PROMETHEUS_BEARER_TOKEN` (bearer token auth)
- Option B: Network-level restriction (only allow Prometheus server IPs)
- Option C: VPN/internal network only

### 4. Environment Variables

- ⚠️ **Never commit `.env` files** to git
- ⚠️ Use secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
- ⚠️ Rotate `SESSION_SECRET` regularly
- ⚠️ Use strong passwords for database

---

## 🗄️ Database Setup

### Using Existing Database

**We will use your existing database** - no new database creation needed.

### 1. Database Credentials Required

Please provide the following database connection details:

- **Host**: Database server hostname or IP
- **Port**: Database port (default: 3306)
- **Database Name**: Name of the existing database
- **Username**: Database user with appropriate permissions
- **Password**: Database user password

### 2. Required Permissions

The database user needs the following permissions:
- `CREATE TABLE` - To create application tables
- `ALTER TABLE` - For table modifications (if needed)
- `INSERT`, `UPDATE`, `DELETE`, `SELECT` - For data operations
- `CREATE INDEX` - For performance optimization

**Note:** If you prefer, we can provide a list of specific tables that will be created so you can grant permissions only on those tables.

### 3. Tables That Will Be Created

The application will automatically create the following tables on first run (via Casbin adapter):

**Required Tables:**
- `casbin_rule` - Authorization policies and rules
  - Used for RBAC (Role-Based Access Control)
  - Stores user permissions and policies

**Optional Tables (if data exists):**
- `surgical_guide_orders` - Report data for surgical guide reports
  - Only needed if you have existing surgical guide order data
  - If this table doesn't exist, the reports feature will work with empty data

**Important:** 
- Tables are created automatically on first application startup
- No manual migration scripts needed
- Tables use `utf8mb4` character set and `utf8mb4_unicode_ci` collation
- All tables are prefixed appropriately to avoid conflicts

### 4. Connection Configuration

**Environment Variables:**
```bash
DB_HOST=your-existing-db-host
DB_PORT=3306
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-existing-database-name
DB_CONNECTION_LIMIT=10
```

### 5. Connection Pooling

- **Default pool size**: 10 connections
- **Configurable** via `DB_CONNECTION_LIMIT` environment variable
- **Connection timeouts**: 
  - Connect timeout: 10 seconds
  - Acquire timeout: 60 seconds
- **Connection reuse**: Connections are pooled and reused efficiently

### 6. Database Compatibility

**Tested with:**
- MySQL 8.0+
- MariaDB 10.5+

**Requirements:**
- UTF-8 support (utf8mb4 recommended)
- InnoDB storage engine (for transactions)
- Support for prepared statements

### 7. Pre-Deployment Checklist

Before deployment, please confirm:
- [ ] Database host is accessible from application server
- [ ] Database user credentials are provided
- [ ] User has required permissions (CREATE TABLE, etc.)
- [ ] Database name is confirmed
- [ ] Network/firewall rules allow connection
- [ ] SSL/TLS connection (if required) is configured

---

## 📦 Deployment Steps

### 1. Build Frontend

```bash
cd client
npm install
npm run build
# Output: client/dist/
```

### 2. Build Backend (if needed)

```bash
cd server
npm install
# No build step needed (runs directly with Node.js)
```

### 3. Deploy Files

**Option A: Express Serves Frontend**
- Copy `client/dist/` to `server/public/`
- Express will serve static files

**Option B: Nginx/Apache**
- Serve `client/dist/` as static files
- Proxy API requests to backend (port 3001)

### 4. Start Backend

**Using PM2 (recommended):**
```bash
pm2 start server/src/index.js --name insighthub --env production
pm2 save
pm2 startup
```

**Using systemd:**
```bash
# Create service file: /etc/systemd/system/insighthub.service
# Start: systemctl start insighthub
# Enable: systemctl enable insighthub
```

**Using Docker (if containerized):**
```bash
docker build -t insighthub .
docker run -d -p 3001:3001 --env-file .env insighthub
```

### 5. Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check metrics endpoint
curl http://localhost:3001/metrics

# Check frontend
curl http://localhost:3000
```

---

## ✅ Post-Deployment Testing Checklist

### Authentication
- [ ] Google OAuth login works
- [ ] Callback redirects correctly
- [ ] Session persists after login
- [ ] Logout works correctly

### Authorization
- [ ] Users can only access permitted routes
- [ ] Admin panel accessible to admin users only
- [ ] Reports accessible to Finance22/admin only

### API Endpoints
- [ ] `/api/user/details` returns user info
- [ ] `/api/user/rights` returns permissions
- [ ] `/api/reports/surgical_guide` returns data
- [ ] `/api/reports/surgical_guide/export` exports CSV

### Monitoring
- [ ] `/metrics` endpoint accessible
- [ ] Prometheus can scrape metrics
- [ ] Grafana dashboard shows data
- [ ] Metrics update in real-time

### Performance
- [ ] Page load times acceptable (< 2s)
- [ ] API response times acceptable (< 500ms)
- [ ] Database queries optimized
- [ ] No memory leaks

### Security
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] No sensitive data in logs

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Timeout**
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- Verify network connectivity
- Check firewall rules
- Increase `DB_CONNECT_TIMEOUT` if needed

**2. OAuth Callback Fails**
- Verify `GOOGLE_CALLBACK_URL` matches Google Console settings
- Check `CORS_ORIGIN` matches frontend domain
- Verify `SESSION_COOKIE_DOMAIN` is correct

**3. Metrics Not Scraping**
- Verify `/metrics` endpoint is accessible
- Check Prometheus scrape config
- Verify network connectivity between Prometheus and backend
- Check for authentication issues (if bearer token enabled)

**4. Frontend Can't Connect to API**
- Verify `VITE_API_URL` in frontend `.env.production`
- Check CORS configuration
- Verify backend is running and accessible

---

## 📚 Documentation References

- **Deployment Guide**: `docs/vitepress/deployment.md`
- **Monitoring Guide**: `docs/vitepress/monitoring.md`
- **DevOps Coordination**: `docs/DEVOPS_COORDINATION.md`
- **Environment Config**: `docs/DEPLOYMENT_ENVIRONMENT_CONFIG.md`
- **API Reference**: `docs/vitepress/backend-api.md`

---

## 🎯 Action Items for DevOps Team

### Immediate (Today)

1. [ ] Review server requirements and confirm capacity
2. [ ] Set up database (MySQL) and provide credentials
3. [ ] Configure environment variables
4. [ ] Set up Prometheus scrape target (if using existing Prometheus)
5. [ ] Import Grafana dashboard JSON
6. [ ] Configure SSL/HTTPS certificates
7. [ ] Set up reverse proxy (Nginx/Apache) if needed

### Short-term (This Week)

1. [ ] Deploy to staging environment
2. [ ] Run post-deployment testing checklist
3. [ ] Configure monitoring alerts
4. [ ] Set up log aggregation
5. [ ] Configure backup strategy
6. [ ] Document deployment runbook

### Long-term (This Month)

1. [ ] Set up CI/CD pipeline
2. [ ] Configure auto-scaling (if needed)
3. [ ] Set up disaster recovery
4. [ ] Performance optimization
5. [ ] Security audit

---

## 💬 Questions to Discuss

1. **Infrastructure:**
   - What's our server architecture? (Single server, load balanced, containerized?)
   - Do we have existing Prometheus/Grafana infrastructure?
   - What's our backup and disaster recovery strategy?

2. **Monitoring:**
   - Where should we host Prometheus? (Existing infrastructure or new?)
   - What alerting channels do we use? (PagerDuty, Slack, email?)
   - What are our SLOs/SLAs for this application?

3. **Security:**
   - How do we manage secrets? (AWS Secrets Manager, Vault, etc.)
   - What's our SSL certificate management process?
   - Do we need VPN access for metrics endpoint?

4. **Deployment:**
   - What's our deployment process? (Manual, CI/CD, blue-green, canary?)
   - Do we have staging environment?
   - What's our rollback procedure?

5. **Support:**
   - Who's on-call for this application?
   - What's our incident response process?
   - How do we handle escalations?

---

## 📞 Contact & Support

**Development Team:**
- Repository: `github.com:swd-3ddx/InsightHub.git`
- Branch: `feature/pagination-fixes-and-monitoring-config`
- Documentation: `docs/vitepress/`

**Key Files:**
- Backend entry: `server/src/index.js`
- Frontend entry: `client/src/main.js`
- Environment examples: `.env.example` files

---

## 🎉 What's Ready

✅ **Code is production-ready:**
- All features implemented and tested
- Error handling in place
- Security measures implemented
- Monitoring integrated

✅ **Documentation is complete:**
- Deployment guides
- API documentation
- Monitoring setup
- Troubleshooting guides

✅ **Monitoring is ready:**
- Metrics endpoint exposed
- Grafana dashboard prepared
- Alert rules defined

---

**Next Steps:** Let's discuss infrastructure, set up environments, and plan the deployment timeline!

