# Troubleshooting 404 Error on /announcements Route

## Problem
Accessing `https://insighthub.3ddx.link/announcements` returns a 404 error after deployment.

## Root Cause
This is a **client-side routing issue**. Your Vue.js app uses HTML5 history mode, which means routes like `/announcements` are handled by the client-side router, not by actual files on the server.

When nginx receives a request for `/announcements`, it looks for a physical file but doesn't find one, returning 404 instead of serving `index.html` (which would then load the Vue app and handle the route).

## Solution Steps

### Step 1: Check Nginx Configuration on Remote Server
SSH into your server and verify the nginx configuration:

```bash
ssh hesham@insighthub.3ddx.link
sudo cat /etc/nginx/sites-available/insighthub
```

Make sure it has this crucial section:
```nginx
# Serve Vue app for all other routes
location / {
    try_files $uri $uri/ /index.html;
}
```

### Step 2: Update Nginx Config if Needed
If the `try_files` line is missing or incorrect, update it:

```bash
sudo nano /etc/nginx/sites-available/insighthub
```

Replace the `location /` block with:
```nginx
    # Serve Vue app for all other routes (MUST be last)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }
```

**Important**: Make sure this `location /` block comes AFTER all proxy locations (`/api/`, `/auth/`, `/admin/`, `/docs`)

### Step 3: Test Nginx Configuration
```bash
sudo nginx -t
```

If successful, you should see:
```
nginx: configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload Nginx
```bash
sudo systemctl reload nginx
```

### Step 5: Verify Client Build is Deployed
Check if the dist folder exists and has content:

```bash
ls -la /home/hesham/InsightHub/client/dist/
cat /home/hesham/InsightHub/client/dist/index.html | head -20
```

If the dist folder is empty or missing, rebuild the client:

```bash
cd /home/hesham/InsightHub/client
npm run build
```

### Step 6: Check Nginx Root Path
Verify nginx is pointing to the correct dist folder:

```bash
sudo grep -n "root" /etc/nginx/sites-available/insighthub
```

Should show:
```
root /home/hesham/InsightHub/client/dist;
```

### Step 7: Check File Permissions
Ensure nginx can read the files:

```bash
sudo chown -R www-data:www-data /home/hesham/InsightHub/client/dist
sudo chmod -R 755 /home/hesham/InsightHub/client/dist
```

### Step 8: Clear Browser Cache
After making changes, clear your browser cache or test in an incognito window.

## Quick Fix Script
Run this on your remote server:

```bash
#!/bin/bash
# Quick fix for 404 routing issues

echo "Checking nginx configuration..."
sudo nginx -t

echo "Rebuilding client application..."
cd /home/hesham/InsightHub/client
npm run build

echo "Setting permissions..."
sudo chown -R www-data:www-data /home/hesham/InsightHub/client/dist
sudo chmod -R 755 /home/hesham/InsightHub/client/dist

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Done! Test https://insighthub.3ddx.link/announcements"
```

## Verify the Fix
Test these URLs after applying the fix:
- https://insighthub.3ddx.link/ (should work)
- https://insighthub.3ddx.link/home (should work)
- https://insighthub.3ddx.link/announcements (should work now)
- https://insighthub.3ddx.link/dashboard (should work)

## Common Mistakes to Avoid
1. ❌ Putting `location /` before proxy locations (it will catch all requests)
2. ❌ Using `try_files $uri =404;` instead of `try_files $uri $uri/ /index.html;`
3. ❌ Not rebuilding the client after route changes
4. ❌ Wrong nginx root path pointing to wrong folder
5. ❌ File permission issues preventing nginx from reading files

## If Still Not Working
Check nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

Check nginx access logs:
```bash
sudo tail -f /var/log/nginx/access.log
```

Check if the symbolic link is enabled:
```bash
ls -la /etc/nginx/sites-enabled/ | grep insighthub
```

If not linked:
```bash
sudo ln -s /etc/nginx/sites-available/insighthub /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```
