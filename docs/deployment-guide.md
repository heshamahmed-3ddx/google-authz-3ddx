# Deployment Guide

Complete guide to deploying InsightHub to production servers with all configurations for app and server.

---

## 📋 Overview

This guide covers:
- Server requirements and setup
- Application configuration (backend & frontend)
- Database setup and migrations
- Monitoring setup (Prometheus & Grafana)
- SSL/HTTPS configuration
- Production deployment steps
- Post-deployment validation

---

## 🖥️ Server Requirements

### Minimum Requirements

- **OS**: Linux (Ubuntu 20.04+ or CentOS 8+ recommended)
- **CPU**: 2 cores
- **RAM**: 2GB
- **Disk**: 10GB
- **Node.js**: 18+ (LTS)
- **MySQL**: 8.0+

### Recommended Production Setup

- **OS**: Ubuntu 22.04 LTS
- **CPU**: 4+ cores
- **RAM**: 4GB+
- **Disk**: 20GB+ SSD
- **Node.js**: 20 LTS
- **MySQL**: 8.0+
- **Redis**: 7.0+ (for session storage)
- **Reverse Proxy**: Nginx or Apache
- **SSL Certificate**: Let's Encrypt or commercial

---

## 🔧 Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install build tools
sudo apt install -y build-essential git
```

### 2. Install MySQL

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

```sql
-- In MySQL shell
CREATE DATABASE insighthub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'insighthub_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON insighthub.* TO 'insighthub_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Install Redis (Optional but Recommended)

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### 4. Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 5. Create Application User

```bash
# Create dedicated user for the app
sudo useradd -m -s /bin/bash insighthub
sudo usermod -aG sudo insighthub

# Switch to app user
sudo su - insighthub
```

---

## 📦 Application Deployment

### 1. Clone Repository

```bash
# As insighthub user
cd /home/insighthub
git clone https://github.com/your-org/InsightHub.git
cd InsightHub
```

### 2. Backend Configuration

#### Create Server Environment File

```bash
cd /home/insighthub/InsightHub/server
nano .env
```

**Production `.env` Configuration:**

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=insighthub_user
DB_PASSWORD=your_secure_password
DB_NAME=insighthub
DB_CONNECTION_LIMIT=10
DB_CONNECT_TIMEOUT=10000
DB_ACQUIRE_TIMEOUT=60000

# ============================================
# GOOGLE OAUTH 2.0 CONFIGURATION
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/callback

# Allowed domains (comma-separated)
ALLOWED_DOMAINS=yourdomain.com,yourcompany.com

# ============================================
# SESSION CONFIGURATION
# ============================================
SESSION_SECRET=your-strong-random-secret-min-64-chars-long
SESSION_NAME=insighthub.sid
SESSION_COOKIE_DOMAIN=your-domain.com
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=lax
SESSION_MAX_AGE=86400000

# ============================================
# REDIS SESSION STORE (RECOMMENDED)
# ============================================
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# ============================================
# CORS CONFIGURATION
# ============================================
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true
FRONTEND_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com

# ============================================
# POWERBI CONFIGURATION (IF APPLICABLE)
# ============================================
POWERBI_WORKSPACE_ID=your-workspace-id
POWERBI_REPORT_ID=your-report-id
POWERBI_TENANT_ID=your-tenant-id
POWERBI_CLIENT_ID=your-powerbi-client-id
POWERBI_CLIENT_SECRET=your-powerbi-client-secret

# ============================================
# PROMETHEUS METRICS CONFIGURATION
# ============================================
PROMETHEUS_ENABLED=true
PROMETHEUS_METRICS_PATH=/metrics
PROMETHEUS_METRICS_PORT=3001
PROMETHEUS_INSTANCE_NAME=insighthub-backend-prod
PROMETHEUS_JOB_NAME=insighthub-sg-report
PROMETHEUS_ENVIRONMENT=production
PROMETHEUS_SCRAPE_INTERVAL=15s
PROMETHEUS_SCRAPE_TIMEOUT=10s
PROMETHEUS_BEARER_TOKEN=your-optional-bearer-token

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/insighthub/app.log
LOG_ROTATION_MAX_SIZE=10m
LOG_ROTATION_MAX_FILES=10

# ============================================
# SECURITY HEADERS
# ============================================
HELMET_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# APPLICATION URLS
# ============================================
BASE_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com/api
```

#### Install Backend Dependencies

```bash
cd /home/insighthub/InsightHub/server
npm install --production
```

#### Run Database Migrations

```bash
# Import database schemas
mysql -u insighthub_user -p insighthub < /home/insighthub/InsightHub/database/casbin_schema.sql
mysql -u insighthub_user -p insighthub < /home/insighthub/InsightHub/database/surgical_guides_schema.sql
mysql -u insighthub_user -p insighthub < /home/insighthub/InsightHub/database/report_access_logs_schema.sql

# Or if you have migration scripts
npm run migrate
```

### 3. Frontend Configuration

#### Create Client Environment File

```bash
cd /home/insighthub/InsightHub/client
nano .env.production
```

**Production `.env.production` Configuration:**

```bash
# ============================================
# API CONFIGURATION
# ============================================
VITE_API_URL=https://your-domain.com
VITE_FRONTEND_URL=https://your-domain.com

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_TITLE=InsightHub
VITE_NODE_ENV=production

# ============================================
# GRAFANA DASHBOARD CONFIGURATION
# ============================================
VITE_GRAFANA_URL=https://grafana.your-domain.com
VITE_GRAFANA_DASHBOARD_ID=insighthub-comprehensive
VITE_GRAFANA_ORG_ID=1
VITE_GRAFANA_DASHBOARD_NAME=InsightHub - Comprehensive System & Application Metrics

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_GRAFANA=true
VITE_ENABLE_DEV_TOOLS=false
VITE_ENABLE_ANALYTICS=true

# ============================================
# OAUTH CONFIGURATION
# ============================================
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

#### Build Frontend

```bash
cd /home/insighthub/InsightHub/client
npm install
npm run build

# Build output will be in client/dist/
```

---

## 🚀 PM2 Process Configuration

### Create PM2 Ecosystem File

```bash
cd /home/insighthub/InsightHub
nano ecosystem.config.js
```

**PM2 Configuration:**

```javascript
module.exports = {
  apps: [
    {
      name: 'insighthub-backend',
      cwd: '/home/insighthub/InsightHub/server',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/insighthub/pm2-error.log',
      out_file: '/var/log/insighthub/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

### Start Application with PM2

```bash
# Create log directory
sudo mkdir -p /var/log/insighthub
sudo chown insighthub:insighthub /var/log/insighthub

# Start application
cd /home/insighthub/InsightHub
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Verify status
pm2 status
pm2 logs insighthub-backend
```

---

## 🔒 Nginx Configuration

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx as Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/insighthub
```

**Nginx Configuration:**

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root directory for static files
    root /home/insighthub/InsightHub/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Auth endpoints proxy
    location /auth {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Prometheus metrics endpoint (optional, secure this!)
    location /metrics {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Optional: Restrict access to Prometheus server IP
        # allow 192.168.1.100;  # Prometheus server IP
        # deny all;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### Enable Site and Restart Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/insighthub /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔐 SSL Certificate Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certificate auto-renewal (already set up by certbot)
sudo certbot renew --dry-run

# Certificates will be automatically renewed
# Check renewal timer
sudo systemctl status certbot.timer
```

---

## 📊 Monitoring Setup

### Prometheus Configuration

Create Prometheus configuration file:

```bash
sudo mkdir -p /etc/prometheus
sudo nano /etc/prometheus/prometheus.yml
```

**Prometheus Configuration:**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'insighthub-production'

# Alertmanager configuration (optional)
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them
rule_files:
  # - "alerts.yml"

# Scrape configurations
scrape_configs:
  # InsightHub Backend
  - job_name: 'insighthub-sg-report'
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:3001']
        labels:
          environment: 'production'
          service: 'insighthub-backend'
          instance: 'insighthub-backend-prod'

  # Node Exporter (system metrics)
  - job_name: 'node-exporter'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:9100']
        labels:
          environment: 'production'

  # MySQL Exporter (database metrics)
  - job_name: 'mysql-exporter'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:9104']
        labels:
          environment: 'production'
```

### Install and Run Prometheus

```bash
# Download Prometheus
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-2.45.0.linux-amd64.tar.gz
sudo mv prometheus-2.45.0.linux-amd64 /opt/prometheus

# Create Prometheus user
sudo useradd --no-create-home --shell /bin/false prometheus

# Set permissions
sudo chown -R prometheus:prometheus /opt/prometheus
sudo chown -R prometheus:prometheus /etc/prometheus

# Create systemd service
sudo nano /etc/systemd/system/prometheus.service
```

**Prometheus Service File:**

```ini
[Unit]
Description=Prometheus Monitoring
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/opt/prometheus/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus/ \
  --web.console.templates=/opt/prometheus/consoles \
  --web.console.libraries=/opt/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```

```bash
# Create data directory
sudo mkdir -p /var/lib/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus

# Start Prometheus
sudo systemctl daemon-reload
sudo systemctl start prometheus
sudo systemctl enable prometheus
sudo systemctl status prometheus
```

### Grafana Setup

```bash
# Install Grafana
sudo apt-get install -y software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install -y grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
sudo systemctl status grafana-server
```

**Grafana Configuration:**

1. Access Grafana at `http://your-server-ip:3000`
2. Default credentials: `admin` / `admin` (change immediately)
3. Add Prometheus data source:
   - URL: `http://localhost:9090`
   - Access: Server (default)
4. Import InsightHub dashboard from `/home/insighthub/InsightHub/docs/grafana-dashboard-insighthub-comprehensive.json`

---

## 🔥 Firewall Configuration

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH (IMPORTANT!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Grafana (optional, if accessing directly)
sudo ufw allow 3000/tcp

# Allow Prometheus (optional, if accessing directly)
sudo ufw allow 9090/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## ✅ Post-Deployment Validation

### 1. Health Checks

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check metrics endpoint
curl http://localhost:3001/metrics

# Check frontend
curl http://localhost/

# Check SSL
curl -I https://your-domain.com
```

### 2. Application Tests

```bash
# Test authentication flow
# Visit: https://your-domain.com
# Click "Sign in with Google"
# Verify successful login

# Test API endpoints
curl https://your-domain.com/api/user/rights

# Check database connectivity
mysql -u insighthub_user -p -e "USE insighthub; SHOW TABLES;"
```

### 3. Monitoring Checks

```bash
# Verify Prometheus is scraping
# Visit: http://your-server-ip:9090/targets

# Verify Grafana dashboards
# Visit: http://your-server-ip:3000

# Check PM2 processes
pm2 status
pm2 logs insighthub-backend --lines 50
```

---

## 🔄 Updating the Application

### Pull Latest Changes

```bash
# As insighthub user
cd /home/insighthub/InsightHub

# Backup current version
git branch backup-$(date +%Y%m%d-%H%M%S)

# Pull latest changes
git pull origin main

# Update backend
cd server
npm install --production

# Rebuild frontend
cd ../client
npm install
npm run build

# Restart backend with PM2
pm2 restart insighthub-backend

# Clear Nginx cache (if applicable)
sudo systemctl reload nginx
```

### Database Migrations

```bash
# If there are new migrations
cd /home/insighthub/InsightHub
mysql -u insighthub_user -p insighthub < database/new_migration.sql

# Or run migration script
cd server
npm run migrate
```

---

## 🛠️ Troubleshooting

### Backend Issues

```bash
# Check PM2 logs
pm2 logs insighthub-backend

# Check application logs
tail -f /var/log/insighthub/app.log

# Restart backend
pm2 restart insighthub-backend

# Check process status
pm2 status
```

### Database Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Test database connection
mysql -u insighthub_user -p insighthub -e "SELECT 1;"

# Check database logs
sudo tail -f /var/log/mysql/error.log
```

### Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate validity
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Check certificate expiry
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 📝 Maintenance Tasks

### Daily

- Monitor PM2 dashboard: `pm2 monit`
- Check application logs for errors
- Review Grafana dashboards for anomalies

### Weekly

- Review security logs
- Check disk space: `df -h`
- Review database performance
- Check SSL certificate status

### Monthly

- Update system packages: `sudo apt update && sudo apt upgrade`
- Update Node.js dependencies (after testing)
- Review and rotate logs
- Database backups verification
- Security audit

---

## 🔐 Security Best Practices

1. **Keep secrets secure**: Never commit `.env` files
2. **Regular updates**: Update dependencies monthly
3. **Strong passwords**: Use 32+ character random strings for secrets
4. **Firewall rules**: Only open necessary ports
5. **SSL/TLS**: Always use HTTPS in production
6. **Database security**: Restrict MySQL to localhost only
7. **Monitoring**: Set up alerts for suspicious activity
8. **Backups**: Daily automated backups
9. **Rate limiting**: Implement API rate limiting
10. **Session security**: Use Redis for production sessions

---

## 📞 Support

For deployment issues:
- Check logs first
- Review [Troubleshooting](#troubleshooting) section
- Contact DevOps team
- Create GitHub issue with logs

---

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
