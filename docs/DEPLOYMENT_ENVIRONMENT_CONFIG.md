# Deployment Environment Configuration Guide

This guide explains how to configure InsightHub for different deployment environments with Prometheus and Grafana integration.

## 📋 Overview

InsightHub uses environment variables to configure:
- **Backend Server** (Node.js/Express)
- **Frontend Client** (Vue.js/Vite)
- **Prometheus** (Metrics scraping)
- **Grafana** (Metrics visualization)

## 🔧 Environment Variables

### Backend Server (`server/.env`)

#### Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback

# Session
SESSION_SECRET=your-strong-random-secret

# CORS
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=insighthub_production
```

#### Prometheus Configuration

```bash
# Prometheus Metrics Configuration
PROMETHEUS_ENABLED=true
PROMETHEUS_METRICS_PATH=/metrics
PROMETHEUS_METRICS_PORT=3001
PROMETHEUS_INSTANCE_NAME=insighthub-backend-prod
PROMETHEUS_JOB_NAME=insighthub-sg-report
PROMETHEUS_ENVIRONMENT=production
PROMETHEUS_SCRAPE_INTERVAL=15s
PROMETHEUS_SCRAPE_TIMEOUT=10s
```

### Frontend Client (`client/.env`)

#### Required Variables

```bash
# API Configuration
VITE_API_URL=https://api.your-domain.com
VITE_FRONTEND_URL=https://your-domain.com

# Grafana Configuration
VITE_GRAFANA_URL=https://grafana.your-domain.com
VITE_GRAFANA_DASHBOARD_ID=insighthub-comprehensive
VITE_GRAFANA_ORG_ID=1
VITE_GRAFANA_DASHBOARD_NAME=InsightHub - Comprehensive System & Application Metrics

# Environment
VITE_NODE_ENV=production
```

## 🚀 Environment-Specific Setup

### Development Environment

1. **Backend** (`server/.env`):
   ```bash
   NODE_ENV=development
   PORT=3001
   HOST=localhost
   PROMETHEUS_ENVIRONMENT=development
   PROMETHEUS_INSTANCE_NAME=insighthub-backend-dev
   ```

2. **Frontend** (`client/.env`):
   ```bash
   VITE_API_URL=http://localhost:3001
   VITE_GRAFANA_URL=http://localhost:8000
   VITE_NODE_ENV=development
   ```

3. **Prometheus** (`prometheus.yml`):
   ```yaml
   scrape_configs:
     - job_name: 'insighthub-sg-report'
       static_configs:
         - targets: ['localhost:3001']
           labels:
             environment: 'development'
   ```

### Staging Environment

1. **Backend** (`server/.env`):
   ```bash
   NODE_ENV=staging
   PORT=3001
   HOST=0.0.0.0
   PROMETHEUS_ENVIRONMENT=staging
   PROMETHEUS_INSTANCE_NAME=insighthub-backend-staging
   ```

2. **Frontend** (`client/.env`):
   ```bash
   VITE_API_URL=https://api-staging.your-domain.com
   VITE_GRAFANA_URL=https://grafana-staging.your-domain.com
   ```

3. **Prometheus** (`prometheus.yml`):
   ```yaml
   scrape_configs:
     - job_name: 'insighthub-sg-report'
       static_configs:
         - targets: ['api-staging.your-domain.com:3001']
           labels:
             environment: 'staging'
   ```

### Production Environment

1. **Backend** (`server/.env`):
   ```bash
   NODE_ENV=production
   PORT=3001
   HOST=0.0.0.0
   PROMETHEUS_ENVIRONMENT=production
   PROMETHEUS_INSTANCE_NAME=insighthub-backend-prod
   LOG_LEVEL=warn
   ```

2. **Frontend** (`client/.env`):
   ```bash
   VITE_API_URL=https://api.your-domain.com
   VITE_GRAFANA_URL=https://grafana.your-domain.com
   VITE_NODE_ENV=production
   ```

3. **Prometheus** (`prometheus.yml`):
   ```yaml
   scrape_configs:
     - job_name: 'insighthub-sg-report'
       static_configs:
         - targets: ['api.your-domain.com:3001']
           labels:
             environment: 'production'
   ```

## 📦 Deployment Steps

### 1. Backend Deployment

```bash
# 1. Copy environment file
cp server/.env.example server/.env

# 2. Update with production values
nano server/.env

# 3. Install dependencies
cd server
npm ci --production

# 4. Start server
npm start
```

### 2. Frontend Deployment

```bash
# 1. Copy environment file
cp client/.env.example client/.env

# 2. Update with production values
nano client/.env

# 3. Build for production
cd client
npm ci
npm run build

# 4. Serve static files (using nginx, etc.)
# The built files will be in client/dist/
```

### 3. Prometheus Configuration

```bash
# 1. Copy example configuration
cp prometheus-3.7.2.darwin-amd64/prometheus.yml.example prometheus-3.7.2.darwin-amd64/prometheus.yml

# 2. Update with your environment values
nano prometheus-3.7.2.darwin-amd64/prometheus.yml

# 3. Start Prometheus
./start-prometheus.sh
```

### 4. Grafana Configuration

1. Access Grafana: `http://your-grafana-url:8000`
2. Add Prometheus data source:
   - URL: `http://your-prometheus-url:9090`
   - Access: Server (default)
3. Import dashboard:
   - Upload: `docs/grafana-dashboard-insighthub-comprehensive.json`
   - Select Prometheus data source

## 🔒 Security Considerations

### Production Security

1. **Metrics Endpoint Protection**:
   - Consider adding authentication to `/metrics` endpoint in production
   - Use firewall rules to restrict access
   - Use TLS/HTTPS for all connections

2. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Rotate secrets regularly

3. **Network Security**:
   - Use private networks for Prometheus scraping
   - Restrict Grafana access to authorized users
   - Use VPN or bastion hosts for access

### Example: Secured Metrics Endpoint

```javascript
// In server/src/index.js
app.get('/metrics', async (req, res) => {
  // Add authentication check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.PROMETHEUS_BEARER_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

Then update Prometheus config:
```yaml
authorization:
  credentials: '${PROMETHEUS_BEARER_TOKEN}'
```

## 🧪 Testing Configuration

### Verify Backend Metrics

```bash
# Check metrics endpoint
curl http://localhost:3001/metrics

# Should return Prometheus format metrics
```

### Verify Prometheus Scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Should show insighthub-sg-report target as UP
```

### Verify Grafana Connection

1. Go to Grafana → Configuration → Data Sources
2. Click "Test" on Prometheus data source
3. Should show "Data source is working"

## 📊 Monitoring Checklist

- [ ] Backend metrics endpoint accessible
- [ ] Prometheus scraping successfully
- [ ] Grafana connected to Prometheus
- [ ] Dashboard imported and displaying data
- [ ] Environment labels correct in metrics
- [ ] Alerts configured (if applicable)
- [ ] Logs showing metrics collection
- [ ] Performance metrics within acceptable ranges

## 🔄 Environment Variable Reference

### Backend Prometheus Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROMETHEUS_ENABLED` | `true` | Enable/disable Prometheus metrics |
| `PROMETHEUS_METRICS_PATH` | `/metrics` | Metrics endpoint path |
| `PROMETHEUS_METRICS_PORT` | `3001` | Port for metrics endpoint |
| `PROMETHEUS_INSTANCE_NAME` | `insighthub-backend-{env}` | Instance identifier |
| `PROMETHEUS_JOB_NAME` | `insighthub-sg-report` | Prometheus job name |
| `PROMETHEUS_ENVIRONMENT` | `development` | Environment label |

### Frontend Grafana Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_GRAFANA_URL` | `http://localhost:8000` | Grafana server URL |
| `VITE_GRAFANA_DASHBOARD_ID` | - | Dashboard ID to embed |
| `VITE_GRAFANA_ORG_ID` | `1` | Grafana organization ID |
| `VITE_GRAFANA_DASHBOARD_NAME` | - | Dashboard display name |

## 📝 Notes

- Environment variables prefixed with `VITE_` are exposed to the frontend bundle
- Backend environment variables are server-side only
- Prometheus configuration uses YAML with optional environment variable substitution
- Always test configuration in staging before production deployment

---

For more details, see:
- [Prometheus Setup Guide](./LOCAL_GRAFANA_SETUP.md)
- [Grafana Quick Start](./GRAFANA_QUICK_START.md)
- [DevOps Coordination](./DEVOPS_COORDINATION.md)

