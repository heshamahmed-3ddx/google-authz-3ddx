#!/bin/bash

# Start Prometheus server
# This script starts Prometheus with the configuration to scrape InsightHub metrics

cd "$(dirname "$0")/prometheus-3.7.2.darwin-amd64"

echo "Starting Prometheus..."
echo "Prometheus will scrape metrics from: http://localhost:3001/metrics"
echo "Prometheus UI will be available at: http://localhost:9090"
echo ""
echo "Press Ctrl+C to stop Prometheus"
echo ""

./prometheus --config.file=prometheus.yml --storage.tsdb.path=./data --web.console.libraries=./console_libraries --web.console.templates=./consoles --web.listen-address=0.0.0.0:9090

