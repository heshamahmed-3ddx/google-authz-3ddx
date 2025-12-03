# Docker Grafana & Prometheus Setup

This guide explains how to set up Grafana and Prometheus using Docker containers for InsightHub.

## Quick Start

### Docker Compose Example

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: insighthub-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: insighthub-grafana
    ports:
      - "3030:3000"
    environment:
      - GF_SECURITY_ALLOW_EMBEDDING=true
      - GF_SERVER_DOMAIN=localhost
      - GF_SERVER_ROOT_URL=http://localhost:3030
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    restart: unless-stopped
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:
```

### Prometheus Configuration

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'insighthub-backend'
    static_configs:
      - targets: ['host.docker.internal:3001']  # Adjust if backend is on different host/port
    metrics_path: /metrics
```

### Start Services

```bash
docker-compose up -d
```

## Environment Variables for InsightHub

Configure your `.env` file in the `client/` directory:

```env
VITE_GRAFANA_URL=http://localhost:3030
VITE_PROMETHEUS_URL=http://localhost:9090
# Dashboard UID (just the UUID, not the full path)
# Example: 237d7ea8-519f-4e37-bedb-9e830778fbb8
# You can find this in Grafana: Dashboard Settings → General → UID
VITE_GRAFANA_DASHBOARD_ID=237d7ea8-519f-4e37-bedb-9e830778fbb8
VITE_GRAFANA_ORG_ID=1
```

## Key Configuration

### Grafana Iframe Embedding

The Docker setup automatically enables iframe embedding via:
```yaml
environment:
  - GF_SECURITY_ALLOW_EMBEDDING=true
```

This allows Grafana dashboards to be embedded in InsightHub's GrafanaView component.

### Port Mapping

- **Grafana**: `3030:3000` (host:container)
- **Prometheus**: `9090:9090` (host:container)

Adjust these in `docker-compose.yml` if needed, and update the environment variables accordingly.

## Accessing Services

- **Grafana**: http://localhost:3030 (default: admin/admin)
- **Prometheus**: http://localhost:9090
- **InsightHub Backend Metrics**: http://localhost:3001/metrics

## Troubleshooting

### Grafana not accessible?
- Check container is running: `docker ps`
- Check logs: `docker logs insighthub-grafana`
- Verify port mapping: `docker port insighthub-grafana`

### X-Frame-Options error?
- Verify `GF_SECURITY_ALLOW_EMBEDDING=true` is set
- Restart Grafana container: `docker-compose restart grafana`
- Check Grafana logs for configuration errors

### Prometheus not scraping metrics?
- Verify backend is accessible from container (use `host.docker.internal` for Mac/Windows)
- Check Prometheus targets: http://localhost:9090/targets
- Review Prometheus logs: `docker logs insighthub-prometheus`

## Production Considerations

1. **Security**: Change default Grafana admin password
2. **Authentication**: Configure Grafana authentication (OAuth, LDAP, etc.)
3. **HTTPS**: Use reverse proxy (nginx/traefik) with SSL certificates
4. **Data Persistence**: Volumes are already configured for data persistence
5. **Resource Limits**: Add resource limits in docker-compose.yml for production

## Stopping Services

```bash
docker-compose down
```

To remove volumes (deletes all data):
```bash
docker-compose down -v
```

