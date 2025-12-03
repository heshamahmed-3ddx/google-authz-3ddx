# Grafana Iframe Embedding Setup

## Problem
Grafana by default blocks iframe embedding with X-Frame-Options header for security reasons. This prevents embedding Grafana dashboards in InsightHub.

## Solution
Enable iframe embedding by configuring Grafana with `allow_embedding = true`.

## Setup Instructions

### Docker Setup (Recommended)

If you're using Grafana in Docker, configure it via environment variables or docker-compose:

**docker-compose.yml example:**
```yaml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3030:3000"
    environment:
      - GF_SECURITY_ALLOW_EMBEDDING=true
      - GF_SERVER_HTTP_PORT=3000
      - GF_SERVER_DOMAIN=localhost
    volumes:
      - grafana-storage:/var/lib/grafana
```

**Or via environment variables:**
```bash
docker run -d \
  -p 3030:3000 \
  -e GF_SECURITY_ALLOW_EMBEDDING=true \
  -e GF_SERVER_DOMAIN=localhost \
  grafana/grafana:latest
```

### Local Installation Setup

If using a local Grafana installation, create a custom config file:

Create `grafana-*/conf/custom.ini` with:
```ini
[security]
allow_embedding = true

[server]
http_port = 3030
domain = localhost
root_url = %(protocol)s://%(domain)s:%(http_port)s/
```

Then start Grafana with both configs:
```bash
./bin/grafana-server -config=conf/defaults.ini -config=conf/custom.ini
```

### 3. Environment Variables (Optional)

You can configure Grafana and Prometheus URLs via environment variables in your `.env` file:

```env
VITE_GRAFANA_URL=http://localhost:3030
VITE_PROMETHEUS_URL=http://localhost:9090
VITE_GRAFANA_DASHBOARD_ID=your-dashboard-id
VITE_GRAFANA_ORG_ID=1
```

### 4. Verify Setup

1. Start Grafana (Docker: `docker-compose up grafana` or your Docker command)
2. Access Grafana directly: http://localhost:3030 (or your configured port)
3. Navigate to InsightHub Grafana view
4. The dashboard should now load in the iframe without X-Frame-Options errors

## Security Note

Enabling iframe embedding (`allow_embedding = true`) allows Grafana to be embedded in any website. For production:

1. Use authentication/authorization
2. Consider using Grafana's proxy mode
3. Restrict access via firewall rules
4. Use HTTPS in production

## Troubleshooting

### Still seeing X-Frame-Options error?
- **Docker**: Verify `GF_SECURITY_ALLOW_EMBEDDING=true` environment variable is set
- **Local**: Verify `custom.ini` exists and has `allow_embedding = true`
- Restart Grafana after changing config
- Check browser console for exact error message
- Verify Grafana is running on the correct port (check your Docker port mapping)
- For Docker, check logs: `docker logs <grafana-container-name>`

### Dashboard not loading?
- Check Grafana is accessible directly: http://localhost:3030
- Verify dashboard ID is correct
- Check browser console for network errors
- Ensure Grafana authentication is configured if required
