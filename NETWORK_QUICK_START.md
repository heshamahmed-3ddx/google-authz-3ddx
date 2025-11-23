# 🚀 Network Testing - Quick Start

## Your Network Info
- **IP Address:** `192.168.100.3`
- **Frontend:** `http://192.168.100.3:3000`
- **Backend:** `http://192.168.100.3:3001`

---

## ⚡ Quick Setup (3 Steps)

### 1️⃣ Update Google Cloud Console

Go to: https://console.cloud.google.com → APIs & Services → Credentials

**Add these redirect URIs:**
```
http://localhost:3001/auth/google/callback
http://192.168.100.3:3001/auth/google/callback
```

**Add these JavaScript origins:**
```
http://localhost:3000
http://192.168.100.3:3000
```

Click **Save**

### 2️⃣ Start the Server

```bash
cd /Users/heshamahmed/InsightHub
npm run dev
```

### 3️⃣ Access from Another Device

```
http://192.168.100.3:3000
```

---

## ✅ It Just Works!

Both the **frontend** and **backend** now **automatically detect** the network configuration:

**Frontend:**
- Detects `window.location.hostname` and builds API URL dynamically
- `localhost:3000` → connects to `localhost:3001`
- `192.168.100.3:3000` → connects to `192.168.100.3:3001`

**Backend:**
- Detects the incoming request host
- `localhost` → Uses `localhost:3001/auth/google/callback`
- `192.168.100.3` → Uses `192.168.100.3:3001/auth/google/callback`

No environment variables needed! 🎉

---

## 🔍 Quick Test

From another device:

```bash
# Test connectivity
curl http://192.168.100.3:3001/health

# Or open in browser
http://192.168.100.3:3000
```

---

## 🐛 Troubleshooting

**Can't connect?**
```bash
# Check your IP (might have changed)
ipconfig getifaddr en0

# Verify servers are running
lsof -i :3000
lsof -i :3001
```

**OAuth error?**
- Double-check Google Cloud Console redirect URIs
- Make sure you saved the changes
- Check server logs for the actual redirect URI being used

---

**📖 Full Guide:** `docs/NETWORK_TESTING_GUIDE.md`

