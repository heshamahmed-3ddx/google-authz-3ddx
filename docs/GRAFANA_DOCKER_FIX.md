# Fix Grafana X-Frame-Options Error (Docker)

## Problem
Grafana is blocking iframe embedding with X-Frame-Options header, preventing embedding in InsightHub.

## Solution

### Option 1: Using Docker Compose (Recommended)

1. **Create or update your `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: insighthub-grafana
    ports:
      - "3030:3000"
    environment:
      # CRITICAL: Enable iframe embedding
      - GF_SECURITY_ALLOW_EMBEDDING=true
      - GF_SERVER_DOMAIN=localhost
      - GF_SERVER_ROOT_URL=http://localhost:3030
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
    restart: unless-stopped

volumes:
  grafana-data:
```

2. **Restart Grafana container:**

```bash
# If using docker-compose
docker-compose down
docker-compose up -d

# Or restart just Grafana
docker-compose restart grafana
```

### Option 2: Using Docker Run Command

If you're running Grafana with `docker run`, add the environment variable:

```bash
docker run -d \
  -p 3030:3000 \
  -e GF_SECURITY_ALLOW_EMBEDDING=true \
  -e GF_SERVER_DOMAIN=localhost \
  -e GF_SERVER_ROOT_URL=http://localhost:3030 \
  --name insighthub-grafana \
  grafana/grafana:latest
```

### Option 3: Update Existing Container

If Grafana is already running:

1. **Stop the container:**
```bash
docker stop insighthub-grafana
```

2. **Remove the container (data is preserved in volumes):**
```bash
docker rm insighthub-grafana
```

3. **Start with new configuration:**
```bash
docker run -d \
  -p 3030:3000 \
  -e GF_SECURITY_ALLOW_EMBEDDING=true \
  -e GF_SERVER_DOMAIN=localhost \
  -e GF_SERVER_ROOT_URL=http://localhost:3030 \
  -v grafana-data:/var/lib/grafana \
  --name insighthub-grafana \
  grafana/grafana:latest
```

## Verify Configuration

1. **Check environment variables:**
```bash
docker exec insighthub-grafana env | grep GF_SECURITY
```

Should show: `GF_SECURITY_ALLOW_EMBEDDING=true`

2. **Check Grafana logs:**
```bash
docker logs insighthub-grafana | grep -i "allow_embedding\|security"
```

3. **Test in browser:**
- Open Grafana directly: http://localhost:3030
- Open browser DevTools (F12) → Network tab
- Check response headers for `X-Frame-Options`
- Should be `ALLOWALL` or not present (not `DENY`)

4. **Test in InsightHub:**
- Navigate to Grafana view in InsightHub
- Iframe should load without X-Frame-Options error

## Troubleshooting

### Still seeing X-Frame-Options error?

1. **Verify environment variable is set:**
```bash
docker exec insighthub-grafana env | grep GF_SECURITY_ALLOW_EMBEDDING
```

2. **Restart container after setting environment variable:**
```bash
docker restart insighthub-grafana
```

3. **Check if Grafana config file overrides environment:**
```bash
docker exec insighthub-grafana cat /etc/grafana/grafana.ini | grep allow_embedding
```

4. **Clear browser cache** - Old headers might be cached

5. **Check Grafana version:**
```bash
docker exec insighthub-grafana grafana-server -v
```
Some older versions might have different behavior.

### Alternative: Use Grafana API

If environment variable doesn't work, you can configure via Grafana API:

```bash
# Get API key from Grafana UI (Configuration → API Keys)
curl -X PUT http://admin:admin@localhost:3030/api/org/preferences \
  -H "Content-Type: application/json" \
  -d '{"allowEmbedding": true}'
```

## Security Note

Enabling `GF_SECURITY_ALLOW_EMBEDDING=true` allows Grafana to be embedded in any website. For production:

1. Use authentication/authorization
2. Consider using Grafana's proxy mode
3. Restrict access via firewall rules
4. Use HTTPS in production
5. Consider using Grafana's signed URLs for secure embedding

