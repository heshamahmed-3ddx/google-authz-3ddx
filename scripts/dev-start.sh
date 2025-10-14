#!/bin/bash

# Start both development servers concurrently

echo "🚀 Starting Google AuthZ 3DDX development servers..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start server in background
echo "📡 Starting backend server on port 3001..."
cd server
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Start client in background
echo "🌐 Starting frontend client on port 3000..."
cd ../client
npm run dev &
CLIENT_PID=$!

# Wait a moment for client to start
sleep 3

echo ""
echo "🎉 Development servers started!"
echo "📡 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait