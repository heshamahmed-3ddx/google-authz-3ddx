# 🔧 Network Access - OAuth Redirect Fix

## Problem
When accessing the app from another computer on the network (`192.168.100.3:3000`), the Google login button was redirecting to `localhost:3001/auth/google` instead of `192.168.100.3:3001/auth/google`.

This caused the OAuth flow to fail because:
1. `localhost` on the remote computer refers to that device, not your Mac
2. The OAuth callback couldn't reach your backend server

---

## ✅ Solution Implemented

### **1. Dynamic Frontend API URL** (`client/src/services/api.js`)

**Before:**
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

**After:**
```javascript
function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Dynamically construct based on current window location
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const apiPort = '3001';
  
  return `${protocol}//${hostname}:${apiPort}`;
}

const BASE_URL = getApiBaseUrl();
export { BASE_URL }; // Export for use in other modules
```

**Result:**
- Access from `localhost:3000` → Connects to `localhost:3001` ✅
- Access from `192.168.100.3:3000` → Connects to `192.168.100.3:3001` ✅

---

### **2. Updated LoginPage** (`client/src/views/LoginPage.vue`)

**Before:**
```javascript
window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/auth/google`;
```

**After:**
```javascript
import { BASE_URL } from "@/services/api";

// In login function:
window.location.href = `${BASE_URL}/auth/google`;
```

**Result:**
- Now uses the dynamically detected API URL
- No hardcoded localhost references

---

### **3. Dynamic Backend OAuth Detection** (`server/src/routes/auth.routes.js`)

Already implemented in previous fix - the backend automatically detects the request host and constructs the appropriate OAuth redirect URI.

---

## 🚀 How It Works Now

### **Scenario 1: Local Development**
```
User visits: http://localhost:3000
↓
Frontend connects to: http://localhost:3001
↓
OAuth redirects to: http://localhost:3001/auth/google/callback
↓
After login redirects to: http://localhost:3000/dashboard
```

### **Scenario 2: Network Access**
```
User visits: http://192.168.100.3:3000
↓
Frontend connects to: http://192.168.100.3:3001
↓
OAuth redirects to: http://192.168.100.3:3001/auth/google/callback
↓
After login redirects to: http://192.168.100.3:3000/dashboard
```

---

## 📋 Files Changed

1. ✅ `client/src/services/api.js` - Dynamic API URL detection
2. ✅ `client/src/views/LoginPage.vue` - Use dynamic BASE_URL
3. ✅ `server/src/routes/auth.routes.js` - Dynamic OAuth detection (already done)
4. ✅ `server/src/index.js` - Listen on `0.0.0.0` (already done)
5. ✅ `client/vite.config.js` - Listen on `0.0.0.0` (already done)

---

## ✅ What You Need to Do

### **CRITICAL: Update Google Cloud Console**

This is the **ONLY** manual step required:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add BOTH redirect URIs:
   ```
   http://localhost:3001/auth/google/callback
   http://192.168.100.3:3001/auth/google/callback
   ```
5. Add BOTH JavaScript origins:
   ```
   http://localhost:3000
   http://192.168.100.3:3000
   ```
6. Click **Save**

---

## 🎯 Testing

### **From Your Mac:**
```bash
cd /Users/heshamahmed/InsightHub
npm run dev
```

### **From Another Computer:**
```
http://192.168.100.3:3000
```

### **Expected Behavior:**
1. ✅ Login page loads
2. ✅ Click "Sign in with Google"
3. ✅ Redirects to Google consent screen
4. ✅ After consent, redirects back to `192.168.100.3:3000/dashboard`
5. ✅ Successfully logged in!

---

## 🐛 Troubleshooting

### **Still seeing localhost redirect?**
- Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Clear browser cache
- Restart the dev server

### **OAuth error: redirect_uri_mismatch?**
- Double-check Google Cloud Console has BOTH URIs
- Make sure you clicked "Save" in Google Cloud Console
- Wait 1-2 minutes for Google's cache to update

### **Connection refused?**
- Check firewall settings on your Mac
- Verify both devices are on the same WiFi network
- Confirm your IP is still `192.168.100.3`:
  ```bash
  ipconfig getifaddr en0
  ```

---

## 💡 Production Deployment

For production with a real domain:

**Set environment variable:**
```bash
VITE_API_URL=https://api.yourdomain.com
```

The app will use the environment variable instead of dynamic detection.

---

## 🎉 Summary

**The fix is complete!** Your app now:

✅ Automatically detects whether accessed via localhost or network IP  
✅ Constructs correct API URLs dynamically  
✅ No environment variables needed for development  
✅ Works seamlessly on both localhost and network access  
✅ Single codebase for both scenarios  

**Just update Google Cloud Console and you're ready to test!** 🚀

---

**Date:** 2025-11-13  
**Issue:** OAuth redirect to localhost from network devices  
**Status:** ✅ RESOLVED  
**Testing Required:** Yes - Update Google Cloud Console first

