# Grafana Quick Start Guide

## 🎯 The Problem

You're getting this error in Grafana:
```
Post "http://localhost:3001/api/v1/query": dial tcp [::1]:3001: connect: connection refused
```

**Why?** Grafana is trying to connect to `localhost:3001`, but that's your InsightHub backend, not Prometheus!

## ✅ The Solution

Grafana needs to connect to **Prometheus** (port 9090), not your backend (port 3001).

The flow is:
```
InsightHub Backend (3001) → exposes /metrics
    ↓
Prometheus (9090) → scrapes /metrics every 15s
    ↓
Grafana (8000) → queries Prometheus
```

## 🚀 Setup Steps

### 1. Start Prometheus

```bash
./start-prometheus.sh
```

Or manually:
```bash
cd prometheus-3.7.2.darwin-amd64
./prometheus --config.file=prometheus.yml --storage.tsdb.path=./data
```

**Verify**: Open `http://localhost:9090` → Status → Targets
- Should see `insighthub-sg-report` with status **UP**

### 2. Start Grafana

```bash
./start-grafana.sh
```

Or manually:
```bash
cd grafana-12.3.0
./bin/grafana-server -config=conf/defaults.ini
```

**Access**: `http://localhost:8000`
- Username: `admin`
- Password: `admin`

### 3. Add Prometheus Data Source in Grafana

1. Go to **Configuration → Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. **IMPORTANT**: Set URL to `http://localhost:9090` (NOT 3001!)
5. Click **Save & Test**
6. Should see: ✅ "Data source is working"

### 4. Import Dashboard

1. Go to **Dashboards → Import**
2. Click **Upload JSON file**
3. Select: `docs/grafana-dashboard-insighthub.json`
4. Select your Prometheus data source
5. Click **Import**

## 📊 What You'll See

The dashboard includes:
- **API Latency Percentiles** (P50, P95, P99)
- **Request Rate** (requests per second)
- **Database Query Duration** (P50, P95, P99)
- **Request Rate by User**
- **User Activity Summary** (table)
- **Average API Latency by User**

## 🧪 Test It

1. Make some API requests to your InsightHub backend:
   ```bash
   curl http://localhost:3001/api/reports/surgical_guide?startDate=2014-01-01&endDate=2020-12-31
   ```

2. Wait 15-30 seconds for Prometheus to scrape

3. Refresh Grafana dashboard - you should see metrics!

## 🐛 Troubleshooting

### "Data source is not working"
- Check Prometheus is running: `curl http://localhost:9090/api/v1/query?query=up`
- Verify URL in Grafana is `http://localhost:9090` (not 3001)

### No metrics showing
- Check Prometheus targets: `http://localhost:9090/targets`
- Verify backend is running: `curl http://localhost:3001/metrics`
- Make some API requests to generate metrics

### Port conflicts
- Prometheus: Change port with `--web.listen-address=:9091`
- Grafana: Change `http_port` in `grafana-12.3.0/conf/defaults.ini`

---

**Quick Reference**:
- Backend: `http://localhost:3001/metrics`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:8000`

