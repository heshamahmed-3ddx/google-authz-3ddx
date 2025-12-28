# Update Google OAuth App Name

## Problem
The Google Sign-In screen shows "Choose an account to continue to **Authz-3ddx**" but should show "**InsightHub**".

## Solution
This message comes from your Google Cloud Console OAuth configuration, not your code. You need to update the OAuth consent screen settings.

## Steps to Fix

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials/consent

### 2. Select Your Project
Make sure you're in the correct Google Cloud project.

### 3. Edit OAuth Consent Screen
1. Click "**Edit App**" button
2. In the "**App name**" field, change from "**Authz-3ddx**" to "**InsightHub**"
3. Verify the following fields:
   - **App name**: InsightHub
   - **User support email**: Your support email
   - **App logo**: Upload InsightHub logo (optional but recommended)
   - **Application home page**: Your app URL
   - **Application privacy policy link**: Your privacy policy URL
   - **Application terms of service link**: Your terms URL (optional)

### 4. Save Changes
1. Click "**Save and Continue**"
2. Go through the remaining steps (Scopes, Test users, Summary)
3. Click "**Back to Dashboard**"

### 5. Verify Changes
1. Clear your browser cache or use incognito mode
2. Try signing in to your app
3. The Google Sign-In screen should now show "Choose an account to continue to **InsightHub**"

## Configuration Details

Your OAuth configuration is located in:
- Environment file: `server/.env.development`
- Google Cloud Project: Check your `GOOGLE_CLIENT_ID`

Current OAuth Client ID: Check your `.env` file for `GOOGLE_CLIENT_ID`

## Additional Branding Updates

While updating the OAuth consent screen, consider also updating:

### 1. App Logo
Upload the InsightHub logo (512x512 px recommended)

### 2. App Domain
Add your authorized domains:
- `localhost` (for development)
- Your production domain

### 3. Authorized Redirect URIs
Ensure these are set correctly:
```
http://localhost:3001/auth/google/callback
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/google/callback
```

### 4. Scopes
Verify you're requesting the correct scopes:
- `openid`
- `profile`
- `email`
- Any additional Google API scopes you need

## Testing

After making changes:

```bash
# 1. Clear browser data
# Chrome: Settings > Privacy and Security > Clear browsing data
# Firefox: Settings > Privacy & Security > Clear Data

# 2. Test in incognito/private mode

# 3. Start your dev server
cd server && npm run dev

# 4. Visit the app and try signing in
open http://localhost:3000

# 5. Check that Google Sign-In shows "InsightHub"
```

## Troubleshooting

### Changes Not Showing Up

1. **Clear browser cache**: The OAuth screen is cached by browsers
2. **Wait a few minutes**: Google sometimes takes time to propagate changes
3. **Use incognito mode**: Avoids cached versions
4. **Check correct project**: Ensure you're editing the right Google Cloud project

### Can't Find OAuth Consent Screen

1. Go to: https://console.cloud.google.com
2. Select your project from the dropdown
3. Navigate to: APIs & Services > OAuth consent screen
4. Or search for "OAuth consent screen" in the search bar

### Multiple Projects

If you have multiple Google Cloud projects:
1. Check which project your `GOOGLE_CLIENT_ID` belongs to
2. Select that specific project in Google Cloud Console
3. Update the OAuth consent screen for that project

## Related Files in Your Codebase

While the app name in Google Sign-In comes from Google Cloud Console, you may also want to check these files for any remaining "Authz-3ddx" references:

```bash
# Search for any remaining references
cd /Users/heshamahmed/InsightHub
grep -r "Authz-3ddx" --exclude-dir=node_modules --exclude-dir=.git

# Common locations to check:
# - server/.env.development
# - server/.env.production
# - client/index.html (page title)
# - package.json files
```

## Summary

✅ **Action Required**: Update OAuth consent screen in Google Cloud Console  
⏱️ **Time Required**: 2-3 minutes  
🔗 **URL**: https://console.cloud.google.com/apis/credentials/consent  
📝 **Change**: App name from "Authz-3ddx" to "InsightHub"

---

**Last Updated**: December 28, 2025  
**Reference**: Google OAuth 2.0 Documentation
