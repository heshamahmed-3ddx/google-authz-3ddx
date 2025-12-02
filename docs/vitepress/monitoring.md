---
title: Monitoring & Observability
---

# Monitoring & Observability

InsightHub includes comprehensive monitoring and observability features using Prometheus metrics and Grafana dashboards.

## Overview

The application exposes detailed performance and usage metrics through a Prometheus-compatible `/metrics` endpoint. These metrics enable:

- **Performance Tracking** - Monitor database query times and API response latency
- **Usage Analytics** - Track user behavior and report usage patterns
- **System Health** - Monitor Node.js runtime metrics (CPU, memory, event loop)
- **Alerting** - Configure alerts for performance degradation or errors

## Metrics Endpoint

### Endpoint Details

- **URL**: `http://localhost:3001/metrics` (or your configured API port)
- **Format**: Prometheus exposition format (text/plain)
- **Content-Type**: `text/plain; version=0.0.4; charset=utf-8`
- **Authentication**: Optional (configured via `PROMETHEUS_BEARER_TOKEN`)

### Accessing Metrics

```bash
# Basic request
curl http://localhost:3001/metrics

# With authentication (if configured)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/metrics
```

## Available Metrics

### Phase 1 Metrics (Implemented)

#### Database Query Duration

**Metric**: `sg_report_db_query_duration_seconds`

- **Type**: Histogram
- **Labels**: `user_email`, `user_username`
- **Description**: Time spent executing database queries for surgical guide reports
- **Unit**: Seconds
- **Buckets**: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, +Inf

**Example Query**:
```promql
# Average query duration
rate(sg_report_db_query_duration_seconds_sum[5m]) / rate(sg_report_db_query_duration_seconds_count[5m])

# 95th percentile
histogram_quantile(0.95, rate(sg_report_db_query_duration_seconds_bucket[5m]))
```

#### API Fulfillment Duration

**Metric**: `sg_report_api_fulfillment_duration_seconds`

- **Type**: Histogram
- **Labels**: `user_email`, `user_username`
- **Description**: End-to-end API latency including DB time, processing, and response generation
- **Unit**: Seconds
- **Scope**: Only tracked for `/api/reports/surgical_guide/*` endpoints
- **Buckets**: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, +Inf

**Example Query**:
```promql
# Average API latency
rate(sg_report_api_fulfillment_duration_seconds_sum[5m]) / rate(sg_report_api_fulfillment_duration_seconds_count[5m])

# 99th percentile by user
histogram_quantile(0.99, sum(rate(sg_report_api_fulfillment_duration_seconds_bucket[5m])) by (le, user_email))
```

### Default Node.js Metrics

The application also exposes standard Node.js metrics via `prom-client`:

#### Process Metrics
- `process_cpu_user_seconds_total` - Total user CPU time
- `process_cpu_system_seconds_total` - Total system CPU time
- `process_resident_memory_bytes` - Resident memory size
- `process_start_time_seconds` - Process start time

#### Event Loop Metrics
- `nodejs_eventloop_lag_seconds` - Current event loop lag
- `nodejs_eventloop_lag_p50_seconds` - 50th percentile lag
- `nodejs_eventloop_lag_p99_seconds` - 99th percentile lag

#### Memory Metrics
- `nodejs_heap_size_total_bytes` - Total heap size
- `nodejs_heap_size_used_bytes` - Used heap size
- `nodejs_external_memory_bytes` - External memory size

#### Resource Metrics
- `nodejs_active_handles_total` - Active libuv handles
- `nodejs_active_requests_total` - Active libuv requests
- `nodejs_active_resources_total` - Active resources

#### Garbage Collection
- `nodejs_gc_duration_seconds` - GC duration by kind (minor, major, incremental)

## Prometheus Configuration

### Scrape Configuration

Add the following to your Prometheus `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'insighthub-backend'
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    static_configs:
      - targets: ['localhost:3001']  # Update with your server host:port
        labels:
          instance: 'insighthub-production'
          environment: 'production'
    # Optional: Add authentication
    bearer_token: 'YOUR_PROMETHEUS_BEARER_TOKEN'
    # Or use basic auth
    # basic_auth:
    #   username: 'prometheus'
    #   password: 'secret'
```

### Environment Variables

Configure monitoring in your `.env` file:

```bash
# Enable/disable Prometheus metrics
PROMETHEUS_ENABLED=true

# Metrics endpoint path (default: /metrics)
PROMETHEUS_METRICS_PATH=/metrics

# Optional: Bearer token for authentication
PROMETHEUS_BEARER_TOKEN=your-secret-token-here
```

## Grafana Integration

### Setting Up Grafana

1. **Install Grafana** (if not already installed):
   ```bash
   # Using Homebrew (macOS)
   brew install grafana
   
   # Or download from https://grafana.com/grafana/download
   ```

2. **Start Grafana**:
   ```bash
   # Using the provided script
   ./start-grafana.sh
   
   # Or manually
   grafana-server --config=/path/to/grafana.ini
   ```

3. **Access Grafana**: Open `http://localhost:3000` (default port)

### Adding Prometheus Data Source

1. Log in to Grafana (default: admin/admin)
2. Go to **Configuration** → **Data Sources**
3. Click **Add data source**
4. Select **Prometheus**
5. Configure:
   - **URL**: `http://localhost:9090` (or your Prometheus URL)
   - **Access**: Server (default)
   - Click **Save & Test**

### Importing Dashboard

A comprehensive dashboard is available in `docs/grafana-dashboard-insighthub-comprehensive.json`.

1. Go to **Dashboards** → **Import**
2. Upload the JSON file or paste its contents
3. Select your Prometheus data source
4. Click **Import**

The dashboard includes:
- **System Overview** - CPU, memory, event loop metrics
- **Node.js Runtime** - Heap, GC, active resources
- **Application Metrics** - API latency, query duration
- **Database Metrics** - Query performance by user
- **System Info** - Process uptime, version info

### Dashboard Features

- **Real-time Updates** - Auto-refresh every 30 seconds
- **User Context** - Metrics labeled by user email/username
- **Percentile Analysis** - P50, P95, P99 latency tracking
- **Time Range Selection** - View metrics over different time periods
- **Alert Thresholds** - Visual indicators for performance issues

## Local Development Setup

### Starting Prometheus Locally

1. **Download Prometheus**:
   ```bash
   # macOS
   wget https://github.com/prometheus/prometheus/releases/download/v3.7.2/prometheus-3.7.2.darwin-amd64.tar.gz
   tar -xzf prometheus-3.7.2.darwin-amd64.tar.gz
   ```

2. **Configure Prometheus**:
   Create `prometheus.yml`:
   ```yaml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'insighthub'
       static_configs:
         - targets: ['localhost:3001']
   ```

3. **Start Prometheus**:
   ```bash
   # Using the provided script
   ./start-prometheus.sh
   
   # Or manually
   ./prometheus --config.file=prometheus.yml --web.listen-address=0.0.0.0:9090
   ```

4. **Access Prometheus**: Open `http://localhost:9090`

### Starting Grafana Locally

1. **Download Grafana**:
   ```bash
   # macOS
   wget https://dl.grafana.com/oss/release/grafana-12.3.0.darwin-amd64.tar.gz
   tar -xzf grafana-12.3.0.darwin-amd64.tar.gz
   ```

2. **Start Grafana**:
   ```bash
   # Using the provided script
   ./start-grafana.sh
   
   # Or manually
   cd grafana-12.3.0
   ./bin/grafana-server
   ```

3. **Access Grafana**: Open `http://localhost:3000`

## Alerting Rules

### Example Alert Rules

Create `prometheus-alerts.yml`:

```yaml
groups:
  - name: insighthub_alerts
    interval: 30s
    rules:
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(sg_report_api_fulfillment_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
          description: "95th percentile API latency is {{ $value }}s (threshold: 2s)"

      - alert: SlowDatabaseQueries
        expr: histogram_quantile(0.95, rate(sg_report_db_query_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow database queries detected"
          description: "95th percentile DB query time is {{ $value }}s (threshold: 1s)"

      - alert: HighEventLoopLag
        expr: nodejs_eventloop_lag_seconds > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High event loop lag"
          description: "Event loop lag is {{ $value }}s (threshold: 0.1s)"
```

Add to `prometheus.yml`:
```yaml
rule_files:
  - "prometheus-alerts.yml"
```

## Best Practices

### Metric Labeling

- Use consistent label names across metrics
- Keep label cardinality low (avoid high-cardinality labels like request IDs)
- Include user context for usage analytics

### Scrape Intervals

- **Production**: 15-30 seconds
- **Development**: 5-15 seconds
- Balance between granularity and resource usage

### Retention

- **Prometheus**: 15-30 days (adjust based on storage)
- **Grafana**: Use data source retention policies
- Archive long-term data to object storage if needed

### Security

- Use authentication for `/metrics` endpoint in production
- Restrict Prometheus network access
- Use TLS for Prometheus-Grafana communication
- Rotate bearer tokens regularly

## Troubleshooting

### Metrics Not Appearing

1. **Check endpoint accessibility**:
   ```bash
   curl http://localhost:3001/metrics
   ```

2. **Verify Prometheus configuration**:
   - Check `prometheus.yml` scrape config
   - Verify target is reachable
   - Check Prometheus logs

3. **Check application logs**:
   - Ensure `PROMETHEUS_ENABLED=true`
   - Verify metrics are being recorded

### Grafana Not Showing Data

1. **Verify data source connection**:
   - Test connection in Grafana UI
   - Check Prometheus URL is correct

2. **Check query syntax**:
   - Use PromQL query builder
   - Verify metric names match exactly

3. **Verify time range**:
   - Ensure time range includes data points
   - Check Prometheus has scraped data

### High Cardinality Issues

If you see high memory usage in Prometheus:

1. Review label usage
2. Use recording rules to pre-aggregate metrics
3. Consider reducing label cardinality
4. Increase Prometheus memory limits

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client Documentation](https://github.com/siimon/prom-client)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)

## Related Documentation

- [Deployment Guide](./deployment) - Production deployment including monitoring
- [Backend API Reference](./backend-api) - API endpoint documentation
- [DevOps Coordination](../DEVOPS_COORDINATION.md) - Detailed DevOps setup guide

