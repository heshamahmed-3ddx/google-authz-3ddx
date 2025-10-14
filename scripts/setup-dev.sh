#!/bin/bash

# Development setup script for Google AuthZ 3DDX
# This script sets up the development environment

set -e

echo "🚀 Setting up Google AuthZ 3DDX development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
if [ ! -f package.json ]; then
    echo "❌ Server package.json not found"
    exit 1
fi
npm install
echo "✅ Server dependencies installed"

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
if [ ! -f package.json ]; then
    echo "❌ Client package.json not found"
    exit 1
fi
npm install
echo "✅ Client dependencies installed"

# Setup environment files
cd ..
echo "🔧 Setting up environment files..."

if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env from template"
    echo "⚠️  Please edit server/.env with your Google OAuth credentials"
else
    echo "ℹ️  server/.env already exists"
fi

if [ ! -f client/.env ]; then
    cp client/.env.example client/.env
    echo "✅ Created client/.env from template"
else
    echo "ℹ️  client/.env already exists"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your Google OAuth credentials"
echo "2. Run 'npm run dev:all' to start both server and client"
echo "3. Visit http://localhost:3000 to view the application"
echo ""
echo "For more information, see docs/getting-started.md"