# DevOps Integration Checklist

Quick reference checklist for integrating InsightHub with Prometheus and Grafana.

## ✅ Pre-Integration Checklist

- [ ] Prometheus server is accessible and configured
- [ ] Grafana is accessible and configured
- [ ] Network access between Prometheus and InsightHub server is verified
- [ ] InsightHub server hostname and port are known

## 📋 Information to Provide to DevOps Team

### Required Information
1. **Server Details**
   - Hostname/IP: `_________________`
   - Port: `3001` (default)
   - Metrics Endpoint: `http://<hostname>:3001/metrics`

2. **Grafana Details** (for frontend integration)
   - Grafana URL: `_________________`
   - Organization ID: `_________________` (optional)
   - Dashboard ID: `_________________` (optional)

### Optional Information
- Authentication requirements (if metrics endpoint needs to be secured)
- Network/VPN requirements
- Environment labels (production, staging, development)

## 🔧 DevOps Tasks

### Task 1: Configure Prometheus Scraping
- [ ] Add scrape configuration (see `docs/prometheus-scrape-config.yml`)
- [ ] Update target hostname/port
- [ ] Reload Prometheus configuration
- [ ] Verify target shows as UP in Prometheus UI

### Task 2: Verify Metrics Collection
- [ ] Check `/metrics` endpoint is accessible
- [ ] Verify metrics appear in Prometheus
- [ ] Test with sample API requests
- [ ] Confirm labels are populated correctly

### Task 3: Configure Grafana
- [ ] Add Prometheus as data source (if not already)
- [ ] Create dashboard (see `docs/grafana-dashboard-json.json` or use provided queries)
- [ ] Configure alerts (see `docs/prometheus-alerts.yml`)
- [ ] Test dashboard displays data correctly

### Task 4: Frontend Integration
- [ ] Provide Grafana URL to development team
- [ ] Update environment variables in deployment
- [ ] Test Grafana view in application

## 📊 Quick Test Commands

```bash
# Test metrics endpoint
curl http://<hostname>:3001/metrics

# Check Prometheus target status
# Visit: http://<prometheus-url>/targets

# Verify metrics in Prometheus
# Query: sg_report_api_fulfillment_duration_seconds_count
```

## 📞 Support

For questions or issues:
- Review `docs/DEVOPS_COORDINATION.md` for detailed instructions
- Check application logs for errors
- Verify network connectivity
- Contact development team if needed

---

**Status**: Ready for Integration
**Last Updated**: 2025-11-26

