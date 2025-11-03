#!/bin/bash
# Run backend, frontend, and docs servers in parallel

# Start backend
(cd server && npm run dev) &
BACKEND_PID=$!
echo "Backend server started with PID $BACKEND_PID"

# Start frontend
(cd client && npm run dev) &
FRONTEND_PID=$!
echo "Frontend client started with PID $FRONTEND_PID"

# Start Docusaurus docs
(cd Docusaurus/docs && npm start) &
DOCS_PID=$!
echo "Docusaurus docs started with PID $DOCS_PID"

# Wait for all
wait $BACKEND_PID $FRONTEND_PID $DOCS_PID
