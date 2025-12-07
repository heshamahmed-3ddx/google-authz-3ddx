# Deployment Checklist & DevOps Preparation

**Meeting Date**: [TBD]  
**Prepared By**: Development Team  
**Project**: InsightHub v1.2.0

---

## 📋 What You Need to Prepare for DevOps

### 1. **Environment Variables Documentation**

#### Backend Environment Variables (server/.env)

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# ============================================
# GOOGLE OAUTH CONFIGURATION (CRITICAL)
# ============================================
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# ============================================
# SESSION & SECURITY (CRITICAL)
# ============================================
SESSION_SECRET=generate-strong-random-secret-min-32-characters
# Use: openssl rand -base64 32

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-secure-db-password
DB_NAME=insighthub_production
DB_CONNECTION_LIMIT=10

# ============================================
# CASBIN CONFIGURATION (Authorization)
# ============================================
CASBIN_TABLE_NAME=casbin_rule
CASBIN_USERS_TABLE_NAME=casbin_users
CASBIN_USE_ENHANCED=true
CASBIN_CACHE_ENABLED=true
CASBIN_CACHE_TTL=300000
CASBIN_BATCH_SIZE=100
CASBIN_MAX_RETRIES=3

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info

# ============================================
# GITHUB CONFIGURATION (Documentation)
# ============================================
GITHUB_REPOSITORY_URL=https://github.com/3ddx/InsightHub
GITHUB_REPOSITORY_NAME=InsightHub
GITHUB_DISPLAY_IN_DOCS=true

# ============================================
# FRONTEND URL (CORS & Redirects)
# ============================================
FRONTEND_URL=https://yourdomain.com
```

#### Frontend Environment Variables (client/.env.production)

```env
# ============================================
# API CONFIGURATION
# ============================================
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_API_TIMEOUT=30000

# ============================================
# EXTERNAL SERVICES (Optional)
# ============================================
VITE_POWERBI_PUBLIC_EMBED_URL=https://app.powerbi.com/view?r=...
VITE_POWERBI_REPORT_ID=your-report-id
VITE_POWERBI_REPORT_NAME=PowerBI Dashboard
VITE_POWERBI_TENANT_ID=your-tenant-id

VITE_GRAFANA_URL=https://grafana.yourdomain.com
VITE_GRAFANA_DASHBOARD_ID=your-dashboard-uid
VITE_GRAFANA_ORG_ID=1
VITE_GRAFANA_DASHBOARD_NAME=Grafana Dashboard

VITE_PROMETHEUS_URL=https://prometheus.yourdomain.com
```

---

### 2. **Build & Deployment Scripts**

#### Build Command (Root)
```bash
npm run build
# This runs: ./scripts/build-prod.sh
# Builds client/dist/ and prepares server/
```

#### Client Build (Manual)
```bash
cd client
npm install
npm run build
# Output: client/dist/
```

#### Server Build (Manual)
```bash
cd server
npm install --only=production
# No build step needed (Node.js ES modules)
```

#### Production Start
```bash
# Server
cd server
NODE_ENV=production node src/index.js

# Or using PM2
pm2 start server/src/index.js --name insighthub-api
```

---

### 3. **Database Schema Files**

Provide these SQL files to DevOps:
- `database/casbin_schema.sql` - Authorization tables
- `database/report_access_logs_schema.sql` - Audit logging tables
- `database/surgical_guides_schema.sql` - Application data tables

**Database Requirements:**
- MySQL 8.0+ or MariaDB 10.3+
- Database name: `insighthub_production` (or as specified)
- User with CREATE, INSERT, UPDATE, DELETE, SELECT permissions
- Connection pooling enabled (recommended limit: 10-20)

---

### 4. **Project Structure**

```
InsightHub/
├── client/              # Vue 3 Frontend
│   ├── dist/           # Build output (serve as static files)
│   └── package.json
├── server/             # Express Backend
│   ├── src/
│   └── package.json
├── database/           # SQL schema files
├── scripts/            # Build & deployment scripts
└── package.json        # Root workspace config
```

---

### 5. **Technology Stack & Versions**

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | >=18.0.0 | Required for ES modules |
| npm | >=8.0.0 | Package manager |
| MySQL | 8.0+ | Database server |
| Nginx/Apache | Latest | Reverse proxy (recommended) |

---

### 6. **Dependencies**

#### Root Dependencies
- `googleapis` - Google API integration
- `prom-client` - Prometheus metrics

#### Server Dependencies (Key)
- `express` - Web framework
- `casbin` - RBAC authorization
- `mysql2` - Database driver
- `express-session` - Session management
- `google-auth-library` - OAuth
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `pino` / `winston` - Logging

#### Client Dependencies (Key)
- `vue` - Framework
- `vuetify` - UI components
- `vue-router` - Routing
- `pinia` - State management
- `axios` - HTTP client

---

### 7. **Security Requirements**

#### Required Middleware
- Helmet.js (security headers)
- CORS (configured for production domain)
- Rate limiting (express-rate-limit)
- HTTPS enforcement (production only)
- Session security (httpOnly, secure, sameSite)

#### Secrets Management
- **SESSION_SECRET**: Strong random string (min 32 chars)
- **GOOGLE_CLIENT_SECRET**: From Google Cloud Console
- **DB_PASSWORD**: Database password

---

### 8. **Monitoring & Logging**

#### Log Files Location
- `server/logs/combined.log` - All logs
- `server/logs/error.log` - Error logs only

#### Health Check Endpoint
- `GET /api/health` - Returns server status

#### Metrics Endpoint (Prometheus)
- `GET /metrics` - Prometheus metrics format

---

## 🎯 What to Ask from DevOps

### 1. **Infrastructure Setup**

- [ ] **Server/Container Requirements**
  - Linux server (Ubuntu 22.04+ recommended)
  - OR Kubernetes cluster setup
  - OR Docker container orchestration
  - Minimum: 2 CPU cores, 4GB RAM, 20GB storage
  - Recommended: 4 CPU cores, 8GB RAM, 50GB storage

- [ ] **Reverse Proxy Configuration**
  - Nginx or Apache configuration
  - SSL/TLS certificates (Let's Encrypt or custom)
  - Domain setup: `yourdomain.com` → Frontend
  - API routing: `yourdomain.com/api` → Backend (port 3001)

- [ ] **Domain & DNS**
  - Production domain name
  - SSL certificate management
  - DNS A/CNAME records
  - Redirect HTTP → HTTPS

### 2. **Environment & Secrets Management**

- [ ] **Secrets Storage**
  - Where to store `.env` files?
  - Use secret management tool? (AWS Secrets Manager, HashiCorp Vault, etc.)
  - How to inject environment variables into containers?

- [ ] **Environment Variables**
  - Separate environments (staging, production)?
  - How to update environment variables without redeployment?
  - Variable validation before deployment?

### 3. **Database Setup**

- [ ] **Database Server**
  - Managed MySQL service (AWS RDS, Azure Database, etc.)?
  - OR self-hosted MySQL server?
  - Connection string format
  - Database backup strategy
  - Connection pooling configuration

- [ ] **Database Access**
  - Network access (firewall rules)
  - SSL/TLS for database connections
  - Database user permissions
  - Migration strategy for schema updates

### 4. **CI/CD Pipeline Requirements**

- [ ] **Source Control**
  - Which branch triggers production deployment? (`main`, `production`, etc.)
  - Manual approval required?
  - Rollback strategy?

- [ ] **Build Pipeline**
  - Build triggers (on push, scheduled, manual)
  - Build environment (Node.js version)
  - Build artifacts storage
  - Build cache strategy

- [ ] **Deployment Pipeline**
  - Blue-green deployment?
  - Rolling updates?
  - Zero-downtime deployment strategy
  - Health checks before traffic routing

### 5. **Containerization (If Applicable)**

- [ ] **Docker**
  - Do we need Dockerfile creation?
  - Multi-stage builds?
  - Image registry location?
  - Image tagging strategy?

- [ ] **Container Orchestration**
  - Kubernetes?
  - Docker Swarm?
  - ECS/Fargate?
  - Resource limits (CPU, memory)

### 6. **Monitoring & Observability**

- [ ] **Application Monitoring**
  - APM tool (New Relic, Datadog, etc.)?
  - Log aggregation (ELK, Splunk, CloudWatch, etc.)?
  - Error tracking (Sentry, Rollbar, etc.)?
  - Uptime monitoring?

- [ ] **Infrastructure Monitoring**
  - Server metrics (CPU, memory, disk)
  - Database metrics
  - Network metrics
  - Alert configuration

### 7. **Backup & Disaster Recovery**

- [ ] **Database Backups**
  - Automated daily backups?
  - Backup retention policy
  - Backup restoration procedure
  - Point-in-time recovery?

- [ ] **Application Backups**
  - Code repository backups
  - Configuration backups
  - Disaster recovery plan

### 8. **Security & Compliance**

- [ ] **Security Scanning**
  - Dependency vulnerability scanning
  - Container image scanning
  - Code security scanning
  - Penetration testing schedule

- [ ] **Access Control**
  - Server SSH access
  - Database access
  - Deployment credentials
  - Audit logging

### 9. **Performance & Scaling**

- [ ] **Load Balancing**
  - Multiple server instances?
  - Load balancer configuration
  - Session affinity (sticky sessions) needed?

- [ ] **Auto-scaling**
  - Horizontal scaling triggers (CPU, memory, requests)
  - Minimum/maximum instances
  - Scale-down cooldown period

- [ ] **Caching**
  - CDN for static assets?
  - Application-level caching strategy
  - Cache invalidation strategy

### 10. **Documentation & Runbooks**

- [ ] **Operational Documentation**
  - Deployment runbook
  - Rollback procedure
  - Incident response plan
  - On-call rotation

- [ ] **Configuration Documentation**
  - Infrastructure diagram
  - Network topology
  - Environment variable reference

---

## 📝 Quick Reference for DevOps Meeting

### Application Details
- **Name**: InsightHub
- **Version**: 1.2.0
- **Type**: Full-stack web application (Node.js + Vue.js)
- **Architecture**: Monorepo with separate client/server

### Ports Required
- **Backend API**: 3001 (internal)
- **Frontend**: 80/443 (public, via reverse proxy)

### Critical External Dependencies
1. **Google OAuth** - Must configure redirect URI
2. **MySQL Database** - Schema files provided
3. **PowerBI** (optional) - If using PowerBI reporting
4. **Grafana/Prometheus** (optional) - If using monitoring

### Build Output
- **Client**: `client/dist/` (static files to serve)
- **Server**: `server/` directory (Node.js application)

### Health Checks
- **API Health**: `GET /api/health`
- **Metrics**: `GET /metrics` (Prometheus format)

---

## ✅ Pre-Meeting Checklist

- [x] Environment variables documented
- [x] Build scripts identified
- [x] Database schema files ready
- [x] Technology stack documented
- [x] Security requirements listed
- [ ] **TODO**: Create `.env.example` files (if not exist)
- [ ] **TODO**: Document Google OAuth redirect URI requirements
- [ ] **TODO**: Prepare architecture diagram (optional)
- [ ] **TODO**: List known deployment blockers/issues

---

## 🔗 Additional Resources

- Deployment Guide: `docs/deployment.md`
- Security Guide: `docs/security-guide.md`
- Getting Started: `docs/getting-started.md`
- API Documentation: `/api-docs` (after deployment)

---

**Last Updated**: 2025-01-XX  
**Next Review**: After DevOps meeting
