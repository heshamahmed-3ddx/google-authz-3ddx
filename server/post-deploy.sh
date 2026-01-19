#!/bin/bash
# Post-deployment script for InsightHub backend
# This script runs after pulling code from git to ensure proper environment setup

echo "🚀 Running post-deployment setup..."

# Navigate to server directory
cd "$(dirname "$0")"

# Copy production environment file if .env doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env from .env.production..."
    cp .env.production .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies if package.json changed
if [ -f package.json ]; then
    echo "📦 Checking dependencies..."
    npm install --production
    echo "✅ Dependencies updated"
fi

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart insighthub-backend --update-env

echo "✅ Deployment complete!"
pm2 status

# Show recent logs
echo ""
echo "📋 Recent logs:"
pm2 logs insighthub-backend --lines 10 --nostream
