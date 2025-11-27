#!/bin/bash

# Start Grafana server
# This script starts Grafana from the manually downloaded installation

cd "$(dirname "$0")/grafana-12.3.0"

echo "Starting Grafana..."
echo "Grafana will be available at: http://localhost:8000"
echo "Default credentials: admin / admin"
echo ""
echo "Press Ctrl+C to stop Grafana"
echo ""

./bin/grafana-server -config=conf/defaults.ini

