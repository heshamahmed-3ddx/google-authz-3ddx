#!/bin/bash

###############################################################################
# InsightHub Deployment Script
# This script deploys both frontend and backend for InsightHub application
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="InsightHub"
DEPLOY_USER="${DEPLOY_USER:-insighthub}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/insighthub}"
NODE_VERSION="${NODE_VERSION:-18}"
PM2_APP_NAME_BACKEND="insighthub-backend"
PM2_APP_NAME_FRONTEND="insighthub-frontend"
BACKUP_DIR="${DEPLOY_PATH}/backups"
NGINX_CONFIG="/etc/nginx/sites-available/insighthub"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root for system operations
check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        log_warning "Some operations may require sudo privileges"
    fi
}

# Backup current deployment
backup_deployment() {
    log_info "Creating backup of current deployment..."
    
    if [ -d "$DEPLOY_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        mkdir -p "$BACKUP_DIR"
        
        if [ -d "${DEPLOY_PATH}/server" ] || [ -d "${DEPLOY_PATH}/client" ]; then
            tar -czf "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" \
                -C "$DEPLOY_PATH" \
                --exclude='node_modules' \
                --exclude='.env' \
                --exclude='logs/*' \
                . 2>/dev/null || true
            
            # Keep only last 5 backups
            ls -t "${BACKUP_DIR}"/backup_*.tar.gz | tail -n +6 | xargs rm -f 2>/dev/null || true
            
            log_success "Backup created: backup_${TIMESTAMP}.tar.gz"
        fi
    fi
}

# Install system dependencies
install_system_dependencies() {
    log_info "Checking system dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js ${NODE_VERSION} first."
        log_info "You can install it using: curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2 is not installed. Installing PM2 globally..."
        npm install -g pm2
    fi
    
    log_success "All system dependencies are satisfied"
}

# Install project dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install root dependencies
    if [ -f "package.json" ]; then
        log_info "Installing root dependencies..."
        npm ci --production
    fi
    
    # Install server dependencies
    if [ -d "server" ]; then
        log_info "Installing server dependencies..."
        cd server
        npm ci --production
        cd ..
    fi
    
    # Install client dependencies
    if [ -d "client" ]; then
        log_info "Installing client dependencies..."
        cd client
        npm ci
        cd ..
    fi
    
    log_success "All dependencies installed"
}

# Build client application
build_client() {
    log_info "Building client application..."
    
    if [ -d "client" ]; then
        cd client
        
        # Check if .env file exists
        if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
            log_warning "No .env or .env.production file found in client directory"
            log_info "Using .env.development as template"
            if [ -f ".env.development" ]; then
                cp .env.development .env.production
            fi
        fi
        
        npm run build
        cd ..
        
        log_success "Client build completed"
    else
        log_error "Client directory not found"
        exit 1
    fi
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."
    
    # Server environment
    if [ -d "server" ] && [ ! -f "server/.env" ]; then
        if [ -f "server/.env.example" ]; then
            log_warning "No server/.env file found. Please create one from .env.example"
            log_info "Creating .env from .env.example template..."
            cp server/.env.example server/.env
            log_warning "IMPORTANT: Please update server/.env with your actual credentials!"
        else
            log_error "No server/.env.example file found"
            exit 1
        fi
    fi
    
    log_success "Environment setup completed"
}

# Stop running applications
stop_applications() {
    log_info "Stopping running applications..."
    
    pm2 stop $PM2_APP_NAME_BACKEND 2>/dev/null || true
    pm2 delete $PM2_APP_NAME_BACKEND 2>/dev/null || true
    
    log_success "Applications stopped"
}

# Start backend with PM2
start_backend() {
    log_info "Starting backend application..."
    
    if [ -d "server" ]; then
        cd server
        
        # Check if ecosystem.config.js exists
        if [ -f "ecosystem.config.js" ]; then
            pm2 start ecosystem.config.js --env production
        else
            # Start with basic PM2 configuration
            pm2 start src/server.js \
                --name $PM2_APP_NAME_BACKEND \
                --instances 2 \
                --exec-mode cluster \
                --max-memory-restart 512M \
                --node-args="--max-old-space-size=512" \
                --env NODE_ENV=production
        fi
        
        cd ..
        log_success "Backend started with PM2"
    else
        log_error "Server directory not found"
        exit 1
    fi
}

# Setup nginx configuration
setup_nginx() {
    log_info "Setting up Nginx configuration..."
    
    if command -v nginx &> /dev/null; then
        if [ ! -f "$NGINX_CONFIG" ]; then
            log_info "Creating Nginx configuration..."
            
            sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
# InsightHub Nginx Configuration

upstream insighthub_backend {
    least_conn;
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name insighthub.local;  # Change this to your domain
    
    # Client files
    root ${DEPLOY_PATH}/client/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # Client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://insighthub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # OAuth routes
    location /auth {
        proxy_pass http://insighthub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
            
            # Enable site
            sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/insighthub 2>/dev/null || true
            
            # Test and reload nginx
            if sudo nginx -t 2>/dev/null; then
                sudo systemctl reload nginx
                log_success "Nginx configured and reloaded"
            else
                log_warning "Nginx configuration test failed. Please check manually."
            fi
        else
            log_info "Nginx configuration already exists"
        fi
    else
        log_warning "Nginx not installed. Skipping nginx setup."
    fi
}

# Save PM2 configuration
save_pm2_config() {
    log_info "Saving PM2 configuration..."
    
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true
    
    log_success "PM2 configuration saved"
}

# Display deployment information
display_info() {
    echo ""
    log_success "=========================================="
    log_success "  $PROJECT_NAME Deployment Complete!"
    log_success "=========================================="
    echo ""
    log_info "Backend Status:"
    pm2 list | grep $PM2_APP_NAME_BACKEND || echo "Backend not running"
    echo ""
    log_info "Useful Commands:"
    echo "  View logs:        pm2 logs $PM2_APP_NAME_BACKEND"
    echo "  Restart backend:  pm2 restart $PM2_APP_NAME_BACKEND"
    echo "  Stop backend:     pm2 stop $PM2_APP_NAME_BACKEND"
    echo "  Monitor:          pm2 monit"
    echo ""
    log_info "Application URLs:"
    echo "  Frontend: http://localhost (via Nginx) or http://localhost:5173 (dev)"
    echo "  Backend:  http://localhost:3001"
    echo "  API:      http://localhost:3001/api"
    echo ""
    log_warning "Don't forget to:"
    echo "  1. Update server/.env with production credentials"
    echo "  2. Configure your domain in Nginx config"
    echo "  3. Set up SSL certificates (certbot)"
    echo "  4. Configure firewall rules"
    echo ""
}

# Main deployment process
main() {
    log_info "Starting deployment of $PROJECT_NAME..."
    echo ""
    
    # Change to deploy directory
    if [ -n "$DEPLOY_PATH" ] && [ -d "$DEPLOY_PATH" ]; then
        cd "$DEPLOY_PATH"
    fi
    
    check_sudo
    backup_deployment
    install_system_dependencies
    setup_environment
    install_dependencies
    build_client
    stop_applications
    start_backend
    setup_nginx
    save_pm2_config
    display_info
    
    log_success "Deployment completed successfully!"
}

# Run main function
main "$@"
