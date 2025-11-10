#!/bin/bash

# Start all development servers concurrently

echo "🚀 Starting Google AuthZ 3DDX development servers..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    jobs -p | xargs -r kill
    exit 0
}

trap cleanup EXIT INT TERM

# Start server in background (with nodemon --quiet)
echo "📡 Starting backend server on port 3001..."
cd server
npx nodemon --quiet src/index.js &
SERVER_PID=$!

sleep 2

# Start client in background
echo "🌐 Starting frontend client on port 5173..."
cd ../client
npm run dev &
CLIENT_PID=$!

sleep 2

# Start docs in background
echo "📖 Starting VitePress docs on port 8080..."
cd ../Docusaurus
npx vitepress dev &
DOCS_PID=$!

sleep 2

# Print status table
cd ..
node scripts/dev-status.js

echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait