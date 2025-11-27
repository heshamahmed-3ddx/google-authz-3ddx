# Deployment Checklist for Prometheus & Grafana Integration

Use this checklist to ensure proper deployment of InsightHub with Prometheus and Grafana monitoring.

## 📋 Pre-Deployment

### Backend Configuration

- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `PROMETHEUS_ENABLED=true`
- [ ] Set `PROMETHEUS_ENVIRONMENT=production`
- [ ] Set `PROMETHEUS_INSTANCE_NAME=insighthub-backend-prod`
- [ ] Set `PROMETHEUS_JOB_NAME=insighthub-sg-report`
- [ ] Configure database connection variables
- [ ] Set strong `SESSION_SECRET`
- [ ] Configure `CORS_ORIGIN` with production domain
- [ ] Set `LOG_LEVEL=warn` for production

### Frontend Configuration

- [ ] Copy `client/.env.example` to `client/.env`
- [ ] Set `VITE_API_URL` to production API URL
- [ ] Set `VITE_GRAFANA_URL` to production Grafana URL
- [ ] Set `VITE_GRAFANA_DASHBOARD_ID` (if using specific dashboard)
- [ ] Set `VITE_GRAFANA_ORG_ID`
- [ ] Set `VITE_GRAFANA_DASHBOARD_NAME`
- [ ] Set `VITE_NODE_ENV=production`

### Prometheus Configuration

- [ ] Copy `prometheus.yml.example` to `prometheus.yml`
- [ ] Update scrape target with production backend URL
- [ ] Set `environment: production` label
- [ ] Configure scrape interval (default: 15s)
- [ ] Configure authentication (if required)
- [ ] Test Prometheus can reach backend metrics endpoint

### Grafana Configuration

- [ ] Grafana server accessible
- [ ] Prometheus data source configured
- [ ] Data source URL points to Prometheus server
- [ ] Dashboard JSON imported
- [ ] Dashboard displays correctly
- [ ] Alerts configured (if applicable)

## 🔒 Security

- [ ] `.env` files not committed to version control
- [ ] Environment variables stored in secrets management
- [ ] Metrics endpoint secured (authentication/TLS)
- [ ] Prometheus access restricted
- [ ] Grafana access restricted to authorized users
- [ ] TLS/HTTPS enabled for all services
- [ ] Firewall rules configured

## 🧪 Testing

### Backend Tests

- [ ] Metrics endpoint accessible: `curl https://api.your-domain.com/metrics`
- [ ] Metrics return valid Prometheus format
- [ ] Custom metrics present (`sg_report_*`)
- [ ] Default Node.js metrics present
- [ ] Metrics include correct labels

### Prometheus Tests

- [ ] Prometheus can scrape backend
- [ ] Target shows as UP in Prometheus UI
- [ ] Metrics visible in Prometheus query interface
- [ ] Scrape interval working correctly
- [ ] No scrape errors in logs

### Grafana Tests

- [ ] Data source connection successful
- [ ] Dashboard loads without errors
- [ ] All panels display data
- [ ] Time range selector works
- [ ] Refresh working correctly
- [ ] No "No data" errors

## 📊 Monitoring Verification

- [ ] CPU usage metrics visible
- [ ] Memory usage metrics visible
- [ ] Event loop lag metrics visible
- [ ] API latency metrics visible
- [ ] Database query duration metrics visible
- [ ] Request rate metrics visible
- [ ] User activity metrics visible
- [ ] Garbage collection metrics visible

## 🚀 Deployment Steps

1. [ ] Deploy backend with production `.env`
2. [ ] Verify backend health endpoint
3. [ ] Verify metrics endpoint accessible
4. [ ] Deploy frontend with production `.env`
5. [ ] Build frontend: `npm run build`
6. [ ] Deploy frontend static files
7. [ ] Configure Prometheus scrape target
8. [ ] Start Prometheus
9. [ ] Verify Prometheus scraping
10. [ ] Configure Grafana data source
11. [ ] Import dashboard
12. [ ] Verify dashboard displays data

## 🔄 Post-Deployment

- [ ] Monitor metrics for 24 hours
- [ ] Verify no errors in logs
- [ ] Check alert thresholds
- [ ] Document any custom configurations
- [ ] Update runbooks with Grafana links
- [ ] Train team on using Grafana dashboards

## 📝 Documentation

- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Grafana dashboard usage guide created
- [ ] Alert runbooks created
- [ ] Troubleshooting guide updated

## 🆘 Rollback Plan

- [ ] Rollback procedure documented
- [ ] Previous configuration backed up
- [ ] Database migration rollback tested
- [ ] Frontend rollback procedure tested

---

**Last Updated**: 2025-01-26
**Version**: 1.0.0

