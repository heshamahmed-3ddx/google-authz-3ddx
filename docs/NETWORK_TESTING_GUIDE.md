# Network Testing Guide

## 🌐 Testing InsightHub from Other Devices on Your Network

This guide explains how to test your InsightHub application from other computers or mobile devices on the same local network.

---

## ✅ What's Been Configured

Your application is now configured to accept connections from other devices:

1. **Frontend (Vite)** - Listening on `0.0.0.0:3000`
2. **Backend (Express)** - Listening on `0.0.0.0:3001`
3. **Dynamic API URLs** - Frontend automatically detects and uses correct backend URL
4. **Dynamic OAuth** - Backend auto-detects network access and adjusts redirect URIs

---

## 🔧 Google OAuth Setup (REQUIRED)

### Current Network IP
```
192.168.100.3
```

### Step 1: Add Network IP to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add BOTH:
   ```
   http://localhost:3001/auth/google/callback
   http://192.168.100.3:3001/auth/google/callback
   ```
5. Under **Authorized JavaScript origins**, add BOTH:
   ```
   http://localhost:3000
   http://192.168.100.3:3000
   ```
6. Click **Save**

> ⚠️ **Important**: Google OAuth will NOT work until you complete this step!

---

## 🚀 How to Start the Server

### Option 1: Auto-detect Mode (Recommended)

Simply start your dev server as usual:

```bash
cd /Users/heshamahmed/InsightHub
npm run dev
```

The server will automatically detect whether you're accessing via:
- `localhost:3000` → Uses localhost redirect URI
- `192.168.100.3:3000` → Uses network IP redirect URI

### Option 2: Explicit Configuration

Set environment variables before starting:

```bash
# For network access
export GOOGLE_REDIRECT_URI="http://192.168.100.3:3001/auth/google/callback"
export CLIENT_URL="http://192.168.100.3:3000"
npm run dev
```

---

## 📱 Accessing from Other Devices

### From Another Computer:
```
http://192.168.100.3:3000
```

### From Mobile Device:
1. Connect your phone/tablet to the same WiFi network
2. Open browser and visit:
   ```
   http://192.168.100.3:3000
   ```

### Test Backend Health:
```
http://192.168.100.3:3001/health
```

---

## 🔍 How Dynamic Detection Works

### Frontend (Client-Side)

The frontend automatically constructs the API URL:

```javascript
// In api.js
function getApiBaseUrl() {
  // Check if environment variable is set (production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Dynamically construct based on current window location
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // localhost or 192.168.100.3
  const apiPort = '3001'; // Backend port
  
  return `${protocol}//${hostname}:${apiPort}`;
}
```

**Result:**
- Access via `localhost:3000` → API calls go to `localhost:3001`
- Access via `192.168.100.3:3000` → API calls go to `192.168.100.3:3001`

### Backend (Server-Side)

The server automatically:

1. **Detects the incoming request host**
   - If request comes from `localhost:3000` → uses localhost callback
   - If request comes from `192.168.100.3:3000` → uses network IP callback

2. **Determines frontend URL for post-login redirect**
   - Reads `referer` header from the request
   - Falls back to constructing URL from request host
   - Uses `CLIENT_URL` env var if explicitly set

3. **No manual configuration needed** (after Google Cloud Console setup)

---

## 🔒 Security Considerations

### Firewall Configuration (macOS)

If you can't connect from another device:

**Check firewall status:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

**Allow Node.js:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

**Temporarily disable firewall (testing only):**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### VPN Considerations
- Disable VPN if it blocks local network access
- Ensure both devices are on the same network segment
- Corporate networks may have additional restrictions

---

## 🐛 Troubleshooting

### Problem: Can't Access from Another Device

**Check IP address** (it may have changed):
```bash
ipconfig getifaddr en0
```

**Verify servers are running:**
```bash
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
```

**Check network connectivity:**
```bash
# From the other device
ping 192.168.100.3
```

### Problem: OAuth Fails with "redirect_uri_mismatch"

**Causes:**
1. You haven't added the network IP to Google Cloud Console
2. The redirect URI in Google Cloud Console has a typo
3. Protocol mismatch (http vs https)

**Solution:**
1. Double-check Google Cloud Console authorized redirect URIs
2. Ensure both `localhost` and network IP URIs are added
3. Check server logs for the actual redirect URI being used:
   ```bash
   # The server logs will show:
   OAuth URL generation { redirectUri: 'http://...', ... }
   ```

### Problem: Login Works but Redirects to Wrong Page

**Check the referer header:**
- The server uses the `referer` header to determine where to redirect
- Ensure you're accessing via `http://192.168.100.3:3000` not `localhost:3000`

**Manual override:**
```bash
export CLIENT_URL="http://192.168.100.3:3000"
npm run dev
```

### Problem: Session Lost After Login

**Cause:** Cookie domain mismatch

**Check:** 
- Access the app consistently via the same URL (don't switch between localhost and IP)
- Browser security settings may block cookies from non-HTTPS local networks

---

## 📊 Testing Checklist

From the **other device**, verify:

- [ ] Can access login page: `http://192.168.100.3:3000`
- [ ] Can check backend health: `http://192.168.100.3:3001/health`
- [ ] OAuth redirect URIs added to Google Cloud Console
- [ ] Login button initiates Google OAuth flow
- [ ] Google consent screen appears
- [ ] After consent, redirected back to app
- [ ] Successfully logged in and see dashboard
- [ ] Navigation works correctly
- [ ] API calls work (check DevTools Network tab)
- [ ] Can navigate between pages
- [ ] Can logout successfully

---

## 🔄 Reverting to Localhost-Only

If you want to restrict access back to localhost only:

### Vite Config (`client/vite.config.js`)
```javascript
server: {
  host: 'localhost', // or remove the line
  port: 3000,
  // ...
}
```

### Express Server (`server/src/index.js`)
```javascript
const server = app.listen(PORT, 'localhost', async () => {
  // or just: app.listen(PORT, async () => {
```

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (optional) | `http://192.168.100.3:3001/auth/google/callback` |
| `CLIENT_URL` | Frontend URL (optional) | `http://192.168.100.3:3000` |
| `PORT` | Backend port | `3001` |

**Note:** If not set, these are auto-detected from the request.

---

## 🎯 Production Deployment

For production deployment with a real domain:

```bash
# .env.production
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
CLIENT_URL=https://yourdomain.com
```

And update Google Cloud Console with:
```
https://yourdomain.com/auth/google/callback
```

---

## 💡 Tips

1. **Use your network IP consistently** - Don't switch between localhost and IP during testing
2. **Restart the server** after changing environment variables
3. **Clear browser cache** if experiencing weird behavior
4. **Check server logs** - They show which redirect URI is being used
5. **Use Chrome DevTools** → Network tab to debug OAuth flow

---

## 🆘 Need Help?

If you encounter issues:

1. Check server logs in terminal
2. Check browser DevTools console
3. Verify Google Cloud Console settings
4. Ensure both devices are on the same network
5. Try accessing `/health` endpoint to verify connectivity

---

**Last Updated:** 2025-11-13  
**Your Network IP:** `192.168.100.3`  
**Frontend Port:** `3000`  
**Backend Port:** `3001`

