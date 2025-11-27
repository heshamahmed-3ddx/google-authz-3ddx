# DevOps Coordination Guide - Prometheus & Grafana Integration

This document outlines the steps needed to integrate InsightHub's Prometheus metrics with your existing Prometheus and Grafana infrastructure.

## 📋 Overview

InsightHub exposes Prometheus metrics at the `/metrics` endpoint. These metrics track:
- Database query performance for Surgical Guide Reports
- End-to-end API latency for report requests
- User context (email/username) for usage analytics

## 🔧 Technical Requirements

### Metrics Endpoint
- **URL**: `http://<server-host>:<port>/metrics`
- **Format**: Prometheus exposition format
- **Authentication**: None (public endpoint for scraping)
- **Content-Type**: `text/plain; version=0.0.4; charset=utf-8`

### Available Metrics

#### Phase 1 Metrics (Currently Implemented)

1. **`sg_report_db_query_duration_seconds`**
   - Type: Histogram
   - Labels: `user_email`, `user_username`
   - Description: Time spent on database query execution
   - Unit: Seconds

2. **`sg_report_api_fulfillment_duration_seconds`**
   - Type: Histogram
   - Labels: `user_email`, `user_username`
   - Description: End-to-end API latency (DB + processing + response)
   - Unit: Seconds

#### Default Node.js Metrics
- CPU usage
- Memory usage
- Event loop lag
- Active handles/requests
- And more (via `prom-client` default metrics)

## 📝 Prometheus Configuration

### Scrape Configuration

Add the following to your Prometheus `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'insighthub-sg-report'
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    static_configs:
      - targets:
          - '<insighthub-server-host>:<port>'
        labels:
          environment: 'production'  # or 'staging', 'development'
          service: 'insighthub'
          component: 'surgical-guide-report'
    # Optional: Add relabeling if needed
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
```

### Example Configurations

#### Development Environment
```yaml
scrape_configs:
  - job_name: 'insighthub-dev'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:3001']
        labels:
          environment: 'development'
```

#### Production Environment
```yaml
scrape_configs:
  - job_name: 'insighthub-prod'
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    static_configs:
      - targets:
          - 'insighthub-prod.example.com:3001'
        labels:
          environment: 'production'
          service: 'insighthub'
          component: 'backend'
    # Optional: Service discovery if using Kubernetes/Consul/etc.
    # kubernetes_sd_configs:
    #   - role: pod
    #     namespaces:
    #       names:
    #         - insighthub
```

## 📊 Grafana Dashboard Setup

### Dashboard Variables (Recommended)

Create dashboard variables for flexibility:

1. **Instance**: `label_values(instance)`
2. **User Email**: `label_values(sg_report_db_query_duration_seconds, user_email)`
3. **Environment**: `label_values(environment)`

### Sample Queries

#### Database Query Duration (P95)
```promql
histogram_quantile(0.95, 
  rate(sg_report_db_query_duration_seconds_bucket[5m])
) by (user_email, le)
```

#### API Fulfillment Duration (Average)
```promql
rate(sg_report_api_fulfillment_duration_seconds_sum[5m]) 
/ 
rate(sg_report_api_fulfillment_duration_seconds_count[5m])
```

#### Request Rate by User
```promql
rate(sg_report_api_fulfillment_duration_seconds_count[5m]) 
by (user_email)
```

#### Database Query Duration (Average)
```promql
rate(sg_report_db_query_duration_seconds_sum[5m]) 
/ 
rate(sg_report_db_query_duration_seconds_count[5m])
by (user_email)
```

### Recommended Panels

1. **API Latency Overview**
   - P50, P95, P99 percentiles
   - Average latency
   - Request rate

2. **Database Performance**
   - Query duration percentiles
   - Query rate
   - Slow queries (>1s threshold)

3. **User Activity**
   - Requests per user
   - Top users by request count
   - User-specific latency

4. **Error Tracking** (Future Phase 2)
   - Error rate
   - Timeout count
   - Database errors

## 🚨 Alerting Rules

### Recommended Alerts

Create alert rules in Prometheus:

```yaml
groups:
  - name: insighthub_sg_report
    interval: 30s
    rules:
      # Alert on slow API responses
      - alert: HighAPILatency
        expr: |
          histogram_quantile(0.95, 
            rate(sg_report_api_fulfillment_duration_seconds_bucket[5m])
          ) > 5
        for: 5m
        labels:
          severity: warning
          service: insighthub
        annotations:
          summary: "High API latency detected"
          description: "P95 API latency is {{ $value }}s (threshold: 5s)"

      # Alert on slow database queries
      - alert: SlowDatabaseQueries
        expr: |
          histogram_quantile(0.95, 
            rate(sg_report_db_query_duration_seconds_bucket[5m])
          ) > 2
        for: 5m
        labels:
          severity: warning
          service: insighthub
        annotations:
          summary: "Slow database queries detected"
          description: "P95 DB query duration is {{ $value }}s (threshold: 2s)"

      # Alert on high request rate (optional)
      - alert: HighRequestRate
        expr: |
          rate(sg_report_api_fulfillment_duration_seconds_count[5m]) > 100
        for: 5m
        labels:
          severity: info
          service: insighthub
        annotations:
          summary: "High request rate"
          description: "Request rate is {{ $value }} req/s"
```

## 🔐 Security Considerations

### Network Security
- Ensure Prometheus can reach the InsightHub server
- Consider firewall rules if metrics endpoint should be internal-only
- Use VPN or private network for production scraping

### Authentication (Optional)
If you need to secure the `/metrics` endpoint:
1. Add authentication middleware to the metrics route
2. Configure Prometheus with basic auth or bearer token
3. Update scrape config with credentials

Example Prometheus config with basic auth:
```yaml
scrape_configs:
  - job_name: 'insighthub'
    basic_auth:
      username: 'prometheus'
      password: '<secure-password>'
    static_configs:
      - targets: ['insighthub.example.com:3001']
```

## 🧪 Testing Checklist

### Pre-Deployment Testing

- [ ] Verify `/metrics` endpoint is accessible
- [ ] Confirm metrics format is valid Prometheus format
- [ ] Test Prometheus can scrape the endpoint
- [ ] Verify metrics appear in Prometheus UI
- [ ] Check labels are correctly populated
- [ ] Test with actual API requests to generate metrics
- [ ] Verify user context labels are populated correctly

### Post-Deployment Testing

- [ ] Metrics are being scraped successfully
- [ ] Grafana dashboards display data correctly
- [ ] Alerts are configured and tested
- [ ] Historical data is being retained
- [ ] Performance impact is acceptable

## 📞 Information Needed from DevOps

Please provide the following information:

1. **Prometheus Server Details**
   - Prometheus server URL/hostname
   - Scrape interval preference
   - Any authentication requirements

2. **Grafana Access**
   - Grafana URL
   - Organization ID (if applicable)
   - Dashboard ID (if you want to embed a specific dashboard)
   - Authentication method (if any)

3. **Network Configuration**
   - Server hostname/IP for Prometheus scraping
   - Port number (default: 3001)
   - Network access requirements

4. **Environment Variables**
   - Production server URL
   - Any proxy/load balancer configuration

## 🔄 Deployment Steps

### Step 1: Verify Metrics Endpoint
```bash
# Test locally
curl http://localhost:3001/metrics

# Test on production server
curl http://<production-host>:3001/metrics
```

### Step 2: Configure Prometheus
1. Add scrape configuration to `prometheus.yml`
2. Reload Prometheus configuration
3. Verify target is UP in Prometheus UI

### Step 3: Verify Metrics Collection
1. Make some API requests to generate metrics
2. Check Prometheus UI for metric values
3. Verify labels are populated correctly

### Step 4: Configure Grafana
1. Add Prometheus as data source (if not already)
2. Create or import dashboard
3. Configure alerts (optional)

### Step 5: Update Frontend Configuration
Set environment variables in `.env`:
```env
VITE_GRAFANA_URL=https://grafana.yourcompany.com
VITE_GRAFANA_DASHBOARD_ID=your-dashboard-id  # Optional
VITE_GRAFANA_ORG_ID=1  # Optional
```

## 📈 Monitoring Best Practices

1. **Retention Policy**: Configure appropriate retention for metrics data
2. **Sampling**: Adjust scrape interval based on traffic (15s recommended)
3. **Labeling**: Use consistent label naming across services
4. **Cardinality**: Monitor label cardinality to avoid performance issues
5. **Dashboards**: Create separate dashboards for different environments

## 🐛 Troubleshooting

### Metrics Not Appearing
- Check Prometheus can reach the server
- Verify `/metrics` endpoint returns data
- Check Prometheus logs for scrape errors
- Verify target is UP in Prometheus targets page

### High Cardinality Warnings
- User email/username labels can create high cardinality
- Consider aggregating or filtering in queries
- Use recording rules for common aggregations

### Missing User Context
- Verify user is authenticated
- Check session is properly set
- Review controller code for user context extraction

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client Documentation](https://github.com/siimon/prom-client)

## 📧 Contact

For questions or issues:
- Check application logs for metric-related errors
- Review Prometheus target status
- Verify network connectivity
- Contact development team for code-related issues

---

**Last Updated**: 2025-11-26
**Version**: 1.0.0

