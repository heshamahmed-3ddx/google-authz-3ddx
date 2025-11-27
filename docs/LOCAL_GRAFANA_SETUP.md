# Local Grafana & Prometheus Setup Guide

This guide helps you set up Grafana and Prometheus locally to monitor InsightHub metrics.

## 📋 Architecture

```
InsightHub Backend (port 3001)
    ↓ exposes /metrics endpoint
Prometheus (port 9090)
    ↓ scrapes metrics every 15s
Grafana (port 8000)
    ↓ queries Prometheus
    ↓ displays dashboards
```

## 🚀 Quick Start

### Step 1: Start InsightHub Backend

Make sure your InsightHub backend is running:
```bash
cd server
npm run dev
```

The backend should be running on `http://localhost:3001` and exposing metrics at `http://localhost:3001/metrics`

### Step 2: Start Prometheus

In a new terminal:
```bash
./start-prometheus.sh
```

Or manually:
```bash
cd prometheus-3.7.2.darwin-amd64
./prometheus --config.file=prometheus.yml --storage.tsdb.path=./data
```

Prometheus will be available at: `http://localhost:9090`

### Step 3: Verify Prometheus is Scraping

1. Open `http://localhost:9090` in your browser
2. Go to **Status → Targets**
3. You should see `insighthub-sg-report` target with status **UP**
4. Go to **Graph** and try query: `sg_report_api_fulfillment_duration_seconds_count`

### Step 4: Start Grafana

In another new terminal:
```bash
./start-grafana.sh
```

Or manually:
```bash
cd grafana-12.3.0
./bin/grafana-server -config=conf/defaults.ini
```

Grafana will be available at: `http://localhost:8000`

### Step 5: Configure Grafana Data Source

1. Open `http://localhost:8000` in your browser
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. Go to **Configuration → Data Sources**
4. Click **Add data source**
5. Select **Prometheus**
6. Configure:
   - **URL**: `http://localhost:9090` (NOT 3001!)
   - **Access**: Server (default)
7. Click **Save & Test**
8. You should see "Data source is working"

### Step 6: Import Dashboard

1. Go to **Dashboards → Import**
2. Upload the dashboard JSON file: `docs/grafana-dashboard-insighthub.json`
3. Select the Prometheus data source
4. Click **Import**

## 🔧 Configuration Details

### Prometheus Configuration

The Prometheus config (`prometheus-3.7.2.darwin-amd64/prometheus.yml`) is already configured to:
- Scrape InsightHub metrics from `localhost:3001/metrics`
- Scrape interval: 15 seconds
- Store data in `./data` directory

### Grafana Configuration

Grafana is configured to:
- Run on port 8000 (see `grafana-12.3.0/conf/defaults.ini`)
- Default admin credentials: admin/admin

## 📊 Available Metrics

Once everything is running, you can query these metrics in Grafana:

1. **API Latency**: `sg_report_api_fulfillment_duration_seconds`
2. **Database Query Duration**: `sg_report_db_query_duration_seconds`
3. **Request Count**: `sg_report_api_fulfillment_duration_seconds_count`
4. **Default Node.js Metrics**: `process_*`, `nodejs_*`

## 🐛 Troubleshooting

### Prometheus can't scrape metrics

**Error**: Target shows as DOWN
- **Solution**: Make sure InsightHub backend is running on port 3001
- Test: `curl http://localhost:3001/metrics`

### Grafana can't connect to Prometheus

**Error**: "connection refused" when adding data source
- **Solution**: Make sure Prometheus is running on port 9090
- Check: `curl http://localhost:9090/api/v1/query?query=up`

### Port conflicts

If ports are already in use:
- Prometheus: Change port in `prometheus.yml` or use `--web.listen-address=:9091`
- Grafana: Change `http_port` in `grafana-12.3.0/conf/defaults.ini`

## 📝 Next Steps

1. Create custom dashboards in Grafana
2. Set up alerts (see `docs/prometheus-alerts.yml`)
3. Export dashboard JSON for sharing
4. Configure for production use

---

**Note**: For production, use your DevOps team's Prometheus and Grafana servers instead of local instances.

