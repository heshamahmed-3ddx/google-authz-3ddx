#!/bin/bash

# Production build script for Google AuthZ 3DDX

set -e

echo "🏗️  Building Google AuthZ 3DDX for production..."

# Build client
echo "📦 Building client..."
cd client
npm run build
echo "✅ Client build complete"

# Build server (if needed)
echo "📦 Preparing server for production..."
cd ../server
npm install --only=production
echo "✅ Server dependencies installed (production only)"

cd ..
echo "🎉 Production build complete!"
echo ""
echo "Deployment files:"
echo "- Client: client/dist/"
echo "- Server: server/"
echo ""
echo "See docs/deployment.md for deployment instructions"