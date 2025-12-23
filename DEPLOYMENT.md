# InsightHub Deployment Guide

## Prerequisites

- Ubuntu/Debian server (20.04 LTS or newer)
- Node.js 18.x or newer
- Git
- PM2 (will be installed by script)
- Nginx (optional, for production)
- Sudo access

## Quick Start

### 1. Clone the repository

```bash
git clone git@github.com:swd-3ddx/InsightHub.git
cd InsightHub
```

### 2. Make deployment script executable

```bash
chmod +x deploy.sh
```

### 3. Run deployment script

```bash
./deploy.sh
```

## Manual Deployment

### Step 1: Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install -y nginx
```

### Step 2: Setup Environment Variables

#### Backend (.env)
```bash
cd server
cp .env.example .env
nano .env
```

Required variables:
```env
NODE_ENV=production
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=PowerBi_db

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Session
SESSION_SECRET=your_secure_random_string_here

# PowerBI Configuration
POWERBI_WORKSPACE_ID=your_workspace_id
POWERBI_REPORT_ID=your_report_id
POWERBI_TENANT_ID=your_tenant_id
POWERBI_CLIENT_ID=your_client_id
POWERBI_CLIENT_SECRET=your_client_secret
```

#### Frontend (.env.production)
```bash
cd ../client
nano .env.production
```

Required variables:
```env
VITE_API_URL=https://yourdomain.com
VITE_POWERBI_WORKSPACE_ID=your_workspace_id
VITE_POWERBI_REPORT_ID=your_report_id
VITE_POWERBI_TENANT_ID=your_tenant_id
VITE_POWERBI_CLIENT_ID=your_client_id
```

### Step 3: Install Dependencies

```bash
# Root dependencies
npm ci --production

# Server dependencies
cd server
npm ci --production

# Client dependencies
cd ../client
npm ci
```

### Step 4: Build Client

```bash
cd client
npm run build
cd ..
```

### Step 5: Start Backend with PM2

```bash
cd server
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 6: Configure Nginx (Optional)

```bash
sudo nano /etc/nginx/sites-available/insighthub
```

Add the configuration:
```nginx
upstream insighthub_backend {
    least_conn;
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/insighthub/client/dist;
    index index.html;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://insighthub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /auth {
        proxy_pass http://insighthub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/insighthub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Setup SSL with Certbot (Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## GitHub Actions CI/CD

The repository includes a GitHub Actions workflow for automated deployment.

### Required GitHub Secrets

Add these secrets in your GitHub repository settings:

```
VITE_API_URL                  # Production API URL
VITE_POWERBI_WORKSPACE_ID     # PowerBI workspace ID
VITE_POWERBI_REPORT_ID        # PowerBI report ID
VITE_POWERBI_TENANT_ID        # Azure tenant ID
VITE_POWERBI_CLIENT_ID        # Azure client ID (public)
SSH_PRIVATE_KEY               # SSH private key for deployment
REMOTE_HOST                   # Production server IP/hostname
REMOTE_USER                   # SSH user
DEPLOY_PATH                   # Deployment path on server
```

### Workflow Triggers

- Push to `main` branch → Deploy to production
- Push to `staging` branch → Deploy to staging
- Pull request to `main` → Run tests only

## PM2 Management Commands

```bash
# View logs
pm2 logs insighthub-backend

# Monitor
pm2 monit

# Restart
pm2 restart insighthub-backend

# Stop
pm2 stop insighthub-backend

# View status
pm2 status

# Reload (zero-downtime)
pm2 reload insighthub-backend
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs insighthub-backend --lines 100

# Check environment variables
cd server && cat .env

# Test manually
cd server && node src/server.js
```

### Database connection issues
```bash
# Test MySQL connection
mysql -u your_user -p -h localhost PowerBi_db

# Check MySQL service
sudo systemctl status mysql
```

### Nginx issues
```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Port conflicts
```bash
# Check what's using port 3001
sudo lsof -i :3001

# Kill process on port 3001
sudo kill -9 $(sudo lsof -t -i:3001)
```

## Rollback Procedure

If deployment fails, you can rollback to previous version:

```bash
# Stop current version
pm2 stop insighthub-backend

# Navigate to backup directory
cd /var/www/insighthub/backups

# List backups
ls -lht

# Extract backup
tar -xzf backup_TIMESTAMP.tar.gz -C /var/www/insighthub/

# Restart application
cd /var/www/insighthub/server
pm2 restart ecosystem.config.js
```

## Performance Optimization

### PM2 Cluster Mode
The ecosystem.config.js is configured to run 2 instances in cluster mode for load balancing.

### Nginx Caching
Add caching for static assets:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Connection Pooling
Ensure your database connection pool is configured in server config:
```javascript
pool: {
  min: 2,
  max: 10,
}
```

## Monitoring

### Setup PM2 Plus (Optional)
```bash
pm2 link <secret> <public>
```

### Log Rotation
PM2 handles log rotation automatically, but you can configure:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Security Checklist

- [ ] Environment variables secured
- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Database users with minimal privileges
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Secrets not committed to Git

## Support

For issues or questions:
- Check logs: `pm2 logs insighthub-backend`
- GitHub Issues: https://github.com/swd-3ddx/InsightHub/issues
- Contact DevOps team
