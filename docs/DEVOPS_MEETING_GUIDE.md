# DevOps Meeting Quick Reference Guide

**Meeting Duration**: 30-45 minutes  
**Your Role**: Provide technical specifications  
**DevOps Role**: Set up infrastructure and CI/CD

---

## 🎯 Meeting Objectives

1. **Understand infrastructure requirements**
2. **Set up CI/CD pipeline**
3. **Configure production environment**
4. **Establish deployment process**
5. **Plan monitoring and scaling**

---

## 📊 Quick Facts to Share

### Application Overview
- **Name**: InsightHub v1.2.0
- **Type**: Full-stack web application
- **Architecture**: Monorepo (separate client/server)
- **Tech Stack**: Node.js 18+, Vue 3, Express, MySQL

### Deployment Requirements
- **Backend Port**: 3001 (internal)
- **Frontend**: Static files (80/443 via reverse proxy)
- **Database**: MySQL 8.0+
- **Node.js**: >=18.0.0

### Critical External Services
1. **Google OAuth** - Must configure redirect URI
2. **MySQL Database** - Schema files ready
3. **PowerBI** (optional) - Reporting integration
4. **Grafana/Prometheus** (optional) - Monitoring

---

## 💬 Key Talking Points

### 1. **Infrastructure Questions to Ask**

#### Deployment Model
- "What's our deployment model? Traditional VMs, containers (Docker), or Kubernetes?"
- "Do we need blue-green deployments or can we do rolling updates?"
- "What's our rollback strategy?"

#### Environment Strategy
- "Do we have separate staging and production environments?"
- "How do we manage secrets? (AWS Secrets Manager, HashiCorp Vault, environment files)"
- "Can we update environment variables without redeployment?"

#### Networking & DNS
- "What's our production domain name?"
- "How do we handle SSL certificates? (Let's Encrypt, managed certs)"
- "Do we need a CDN for static assets?"

### 2. **CI/CD Pipeline Discussion**

#### Source Control
- "Which branch triggers production? (`main`, `production`, tagged releases?)"
- "Do we need manual approval before deployment?"
- "How do we handle hotfixes vs regular releases?"

#### Build Process
```bash
# Build command
npm run build

# This creates:
# - client/dist/ (static files)
# - server/ (ready to run)
```

#### Deployment Steps
1. Install dependencies (`npm install`)
2. Build client (`cd client && npm run build`)
3. Deploy server (Node.js application)
4. Serve client/dist as static files (Nginx/Apache)
5. Run database migrations (if needed)
6. Restart application

### 3. **Database Setup**

#### What DevOps Needs to Provide
- MySQL 8.0+ server (managed or self-hosted)
- Database credentials (host, port, user, password, database name)
- Network access (firewall rules for application server)
- SSL/TLS connection (recommended)

#### What You'll Provide
- SQL schema files:
  - `database/casbin_schema.sql`
  - `database/report_access_logs_schema.sql`
  - `database/surgical_guides_schema.sql`

### 4. **Monitoring & Logging**

#### What You Need
- Log aggregation (where logs go, how to access them)
- Application monitoring (APM tool integration)
- Error tracking (Sentry, Rollbar, etc.)
- Uptime monitoring
- Server metrics (CPU, memory, disk)

#### What You're Providing
- Health check endpoint: `GET /api/health`
- Metrics endpoint: `GET /metrics` (Prometheus format)
- Structured logging (JSON format)
- Log files location: `server/logs/`

### 5. **Security Requirements**

#### Must Have
- HTTPS enforcement
- Secure session cookies (httpOnly, secure, sameSite)
- CORS configuration for production domain
- Rate limiting (already implemented)
- Security headers (Helmet.js already configured)

#### Secrets to Protect
- `SESSION_SECRET` - Generate: `openssl rand -base64 32`
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `DB_PASSWORD` - Database password

---

## 📋 Checklist for DevOps

### Before Meeting - What You've Prepared
- [x] Environment variables documentation
- [x] Build scripts identified
- [x] Database schema files ready
- [x] Technology stack documented
- [x] Security requirements listed
- [x] `.env.example` files created

### During Meeting - What to Discuss
- [ ] Infrastructure choice (VMs, Docker, Kubernetes)
- [ ] CI/CD tool choice (GitHub Actions, GitLab CI, Jenkins, etc.)
- [ ] Deployment strategy (blue-green, rolling, etc.)
- [ ] Secrets management approach
- [ ] Database hosting (managed vs self-hosted)
- [ ] Monitoring tools (Prometheus, Grafana, APM, etc.)
- [ ] Backup strategy
- [ ] Scaling strategy (manual vs auto-scaling)

### After Meeting - Action Items
- [ ] DevOps creates infrastructure
- [ ] DevOps sets up CI/CD pipeline
- [ ] You provide production environment variables
- [ ] DevOps configures reverse proxy (Nginx/Apache)
- [ ] You test deployment in staging
- [ ] Schedule production deployment

---

## 🔧 Technical Details to Share

### Environment Variables

**Backend** (`server/.env`):
- See `server/.env.example` for complete list
- Critical: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `DB_*`

**Frontend** (`client/.env.production`):
- See `client/.env.example` for complete list
- Critical: `VITE_API_URL`

### Build Commands

```bash
# Full build (from root)
npm run build

# Or manually:
cd client && npm install && npm run build
cd ../server && npm install --only=production
```

### Start Commands

```bash
# Development
npm run dev

# Production (server only)
cd server
NODE_ENV=production node src/index.js

# With PM2
pm2 start server/src/index.js --name insighthub-api
```

### File Structure After Build

```
InsightHub/
├── client/
│   └── dist/          # Static files to serve via Nginx/Apache
│       ├── index.html
│       ├── assets/
│       └── ...
└── server/
    ├── src/
    │   └── index.js   # Entry point
    ├── node_modules/
    └── package.json
```

---

## ❓ Questions DevOps Might Ask (Be Ready)

### Q: "What ports do you need?"
**A**: 
- Backend: 3001 (internal, not exposed to public)
- Frontend: 80/443 (via reverse proxy)

### Q: "What's the expected traffic?"
**A**: 
- Initial: Low to medium
- Scaling: Can be added later based on metrics
- Sessions: Sticky sessions not required (stateless API)

### Q: "Do you need persistent storage?"
**A**: 
- Only for logs (`server/logs/`)
- Database is separate
- No file uploads stored on server

### Q: "What happens if the database is down?"
**A**: 
- Application will fail to start (database connection required)
- Health check endpoint will report unhealthy
- Error logging enabled for troubleshooting

### Q: "How do we update the application?"
**A**: 
1. Pull latest code from Git
2. Run `npm run build`
3. Deploy new `client/dist/` and `server/` directory
4. Restart Node.js process
5. (Optional) Run database migrations if schema changed

### Q: "Do you have any cron jobs or scheduled tasks?"
**A**: 
- No cron jobs currently
- Future: Report scheduling system (not yet implemented)

### Q: "What about backup and disaster recovery?"
**A**: 
- Database backups needed (application data)
- Configuration backups needed (`.env` files)
- Code is in Git (backed up)
- Log rotation configured (10 files, 10MB each)

---

## 📞 Follow-Up After Meeting

### Immediate Next Steps
1. DevOps creates infrastructure
2. You provide environment variables
3. DevOps sets up CI/CD
4. Test in staging environment
5. Schedule production deployment

### Documentation to Share
- `docs/DEPLOYMENT_CHECKLIST.md` - Complete deployment guide
- `docs/deployment.md` - Deployment instructions
- `server/.env.example` - Environment variables template
- `client/.env.example` - Frontend environment variables

---

## 🚨 Important Notes

1. **Google OAuth Redirect URI** must be configured in Google Cloud Console after production domain is set
2. **Session Secret** must be generated securely (use `openssl rand -base64 32`)
3. **Database Schema** must be created before first deployment
4. **SSL Certificates** are required for production (HTTPS mandatory)
5. **CORS** must be configured for production domain only

---

**Good luck with your meeting! 🚀**

