# Deployment Notes - January 25, 2026

## Latest Deployment

### Client-Side Routing Fix
- Updated nginx configuration to properly handle SPA routing
- Added cache control headers to prevent stale content
- Ensures routes like `/announcements`, `/dashboard` work correctly
- The `location /` block must come AFTER all proxy locations

### Configuration Changes
- nginx config now includes explicit comments for routing behavior
- Added `no-cache` header for the main index.html

### Deployment via CI/CD
This deployment uses GitHub Actions with self-hosted runner.
The workflow automatically:
1. Runs tests
2. Builds the client application
3. Deploys to the server
4. Restarts PM2 processes
5. Reloads nginx

### Post-Deployment Verification
After deployment, verify:
- [ ] https://insighthub.3ddx.link/ (root)
- [ ] https://insighthub.3ddx.link/announcements
- [ ] https://insighthub.3ddx.link/dashboard
- [ ] https://insighthub.3ddx.link/api/health (backend)
