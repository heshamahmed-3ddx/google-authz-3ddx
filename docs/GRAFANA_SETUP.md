# Grafana Connection Setup Guide

This guide will help you connect InsightHub to your Grafana server.

## 📋 Prerequisites

You need the following information from your DevOps team:
1. **Grafana URL** - The base URL of your Grafana server
   - Example: `https://grafana.yourcompany.com`
   - Or: `http://grafana.internal:3000`

2. **Dashboard ID** (Optional) - If you want to display a specific dashboard
   - Found in the Grafana URL: `https://grafana.com/d/{dashboard-id}/...`

3. **Organization ID** (Optional) - Usually 1, but may vary
   - Default: `1`

## 🔧 Configuration Steps

### Step 1: Open your `.env` file

Navigate to the `client` directory and open the `.env` file:
```bash
cd client
# Edit .env file
```

### Step 2: Add Grafana Configuration

Add the following variables to your `.env` file:

```env
# Grafana Server URL (REQUIRED)
VITE_GRAFANA_URL=https://grafana.yourcompany.com

# Optional: Specific Dashboard ID
# VITE_GRAFANA_DASHBOARD_ID=your-dashboard-id

# Optional: Organization ID (default: 1)
# VITE_GRAFANA_ORG_ID=1
```

### Step 3: Restart Development Server

After updating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test the Connection

1. Navigate to **Reports & Analytics → Grafana Monitoring** in the app
2. The Grafana dashboard should load in the embedded view
3. If you see an error, check the browser console for details

## 🔍 Finding Your Grafana Information

### Finding the Grafana URL
- Ask your DevOps team for the Grafana server URL
- It's usually in the format: `https://grafana.yourcompany.com` or `http://grafana.internal:3000`

### Finding a Dashboard ID
1. Open Grafana in your browser
2. Navigate to the dashboard you want to display
3. Look at the URL - it will be something like:
   ```
   https://grafana.com/d/abc123/surgical-guide-metrics
   ```
4. The dashboard ID is `abc123` in this example

### Finding Organization ID
1. In Grafana, check the URL when logged in
2. Look for `?orgId=1` in the URL
3. The number after `orgId=` is your organization ID (usually 1)

## 🎯 Configuration Examples

### Example 1: Basic Setup (Grafana Home)
```env
VITE_GRAFANA_URL=https://grafana.yourcompany.com
```
This will show the Grafana Explore page.

### Example 2: Specific Dashboard
```env
VITE_GRAFANA_URL=https://grafana.yourcompany.com
VITE_GRAFANA_DASHBOARD_ID=abc123
```
This will embed a specific dashboard.

### Example 3: Custom Organization
```env
VITE_GRAFANA_URL=https://grafana.yourcompany.com
VITE_GRAFANA_DASHBOARD_ID=abc123
VITE_GRAFANA_ORG_ID=2
```
This uses organization ID 2.

## 🚨 Troubleshooting

### Dashboard Not Loading

**Issue**: Blank page or error message
- **Solution**: Check that the Grafana URL is correct and accessible
- Verify you can access Grafana in a separate browser tab
- Check browser console for CORS or authentication errors

### Authentication Required

**Issue**: Grafana requires login
- **Solution**: Grafana dashboards may require authentication
- You may need to:
  1. Use Grafana's anonymous access feature
  2. Configure Grafana to allow embedding
  3. Use the "Open in New Tab" button to access with authentication

### CORS Errors

**Issue**: Browser console shows CORS errors
- **Solution**: Grafana server needs to allow embedding from your domain
- Contact DevOps to configure Grafana CORS settings:
  ```ini
  [security]
  allow_embedding = true
  ```

### Dashboard ID Not Found

**Issue**: Error about dashboard not found
- **Solution**: Verify the dashboard ID is correct
- Make sure the dashboard exists and you have access to it
- Try removing `VITE_GRAFANA_DASHBOARD_ID` to use the default Explore page

## 🔐 Security Considerations

### Public vs Private Grafana
- **Public Grafana**: Can be embedded directly
- **Private Grafana**: May require authentication or special configuration

### Anonymous Access
If your Grafana requires authentication, you may need to:
1. Enable anonymous access in Grafana
2. Configure anonymous user permissions
3. Or use the "Open in New Tab" button for authenticated access

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify the Grafana URL is accessible
3. Contact your DevOps team for:
   - Correct Grafana URL
   - Dashboard IDs
   - Authentication requirements
   - CORS configuration

## ✅ Quick Checklist

- [ ] Grafana URL obtained from DevOps
- [ ] `.env` file updated with `VITE_GRAFANA_URL`
- [ ] Optional: Dashboard ID added (if using specific dashboard)
- [ ] Development server restarted
- [ ] Grafana Monitoring page tested
- [ ] Dashboard loads successfully (or error message is clear)

---

**Next Steps**: Once connected, you can create custom dashboards in Grafana and reference them using the Dashboard ID.

