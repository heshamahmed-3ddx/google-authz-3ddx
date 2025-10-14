#!/bin/bash

# Run all tests across the project

set -e

echo "🧪 Running Google AuthZ 3DDX test suite..."

# Run server tests
echo "📡 Running server tests..."
cd server
if [ -f package.json ]; then
    npm test
    echo "✅ Server tests complete"
else
    echo "⚠️  No server package.json found, skipping server tests"
fi

# Run client tests
echo "🌐 Running client tests..."
cd ../client
if [ -f package.json ]; then
    npm test
    echo "✅ Client tests complete"
else
    echo "⚠️  No client package.json found, skipping client tests"
fi

# Run integration tests
echo "🔗 Running integration tests..."
cd ../tests
if [ -f package.json ]; then
    npm test
    echo "✅ Integration tests complete"
else
    echo "⚠️  No integration test package.json found, skipping integration tests"
fi

cd ..
echo "🎉 All tests complete!"