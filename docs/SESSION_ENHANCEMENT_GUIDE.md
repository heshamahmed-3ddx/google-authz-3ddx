# Session Persistence Enhancement Guide

**Quick implementation guide for improving session persistence in InsightHub**

---

## Quick Wins (15 minutes)

### 1. Extend Session Duration to 7 Days

**File:** [server/src/middleware/security.js](../server/src/middleware/security.js#L332)

```diff
  cookie: {
    secure: false,
    httpOnly: true,
-   maxAge: 24 * 60 * 60 * 1000, // 24 hours
+   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
    path: '/'
  }
```

**Impact:**
- Users stay logged in for 7 days instead of 24 hours
- Rolling session means active users never get logged out
- Better UX for daily users

---

### 2. Change OAuth Prompt to Reduce Re-consent

**File:** [server/src/routes/auth.routes.js](../server/src/routes/auth.routes.js#L70)

```diff
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
-   prompt: 'consent',
+   prompt: 'select_account', // Only show account picker, not full consent
    redirect_uri: process.env.GOOGLE_REDIRECT_URI
  })
```

**Impact:**
- Users see account selector, not full permission screen
- Faster login flow
- Consent screen only shown on first login or permission changes

---

## Production Ready (1-2 hours)

### 3. Add Redis Session Store

**Install dependencies:**

```bash
cd server
npm install redis connect-redis
```

**Create session store configuration:**

**File:** `server/src/config/session.js`

```javascript
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('config/session', 'SessionConfig');

// Redis client configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting');
});

// Connect to Redis
await redisClient.connect();

// Create session store
export const sessionStore = new RedisStore({
  client: redisClient,
  prefix: 'insighthub:sess:',
  ttl: 7 * 24 * 60 * 60 // 7 days in seconds
});

export { redisClient };
```

**Update session configuration:**

**File:** [server/src/middleware/security.js](../server/src/middleware/security.js#L322)

```diff
+ import { sessionStore } from '../config/session.js';

  export const sessionSecurity = {
    name: '3ddiagnostix.sid',
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
+   store: sessionStore, // Use Redis instead of in-memory
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      path: '/'
    }
  }
```

**Add to .env:**

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
```

**Docker Compose (optional):**

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

**Start Redis:**

```bash
# If using Docker
docker-compose up -d redis

# Or install locally on macOS
brew install redis
brew services start redis
```

**Impact:**
- Sessions persist across server restarts
- Horizontal scaling support (multiple backend servers)
- Better performance for session operations
- Production-ready architecture

---

### 4. Enable Secure Cookies in Production

**File:** [server/src/middleware/security.js](../server/src/middleware/security.js#L330)

```diff
  cookie: {
-   secure: false, // Set to false since SSL is terminated before nginx
+   secure: process.env.NODE_ENV === 'production', // Enable in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  }
```

**Nginx configuration to set headers:**

```nginx
# nginx.conf
location /api {
    proxy_pass http://localhost:3001;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
}
```

**Impact:**
- Cookies only sent over HTTPS in production
- Protection against cookie hijacking
- Meets security compliance requirements

---

## Advanced Features (3-4 hours)

### 5. Automatic Token Refresh Middleware

**File:** `server/src/middleware/tokenRefresh.js`

```javascript
import { OAuth2Client } from 'google-auth-library';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('middleware/tokenRefresh', 'TokenRefresh');

/**
 * Middleware to automatically refresh Google access tokens
 * Checks token expiry and refreshes if needed
 */
export async function refreshTokenIfNeeded(req, res, next) {
  // Skip if no session or tokens
  if (!req.session?.tokens || !req.session?.user) {
    return next();
  }

  const tokens = req.session.tokens;
  const now = Date.now();

  // Check if token expires in next 5 minutes
  const expiresIn = tokens.expiry_date - now;
  const shouldRefresh = expiresIn < 5 * 60 * 1000; // 5 minutes

  if (!shouldRefresh) {
    return next(); // Token is still valid
  }

  logger.info('Token expiring soon, attempting refresh', {
    userEmail: req.session.user.email,
    expiresIn: Math.floor(expiresIn / 1000) + 's'
  });

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    client.setCredentials(tokens);

    // Refresh access token
    const { credentials } = await client.refreshAccessToken();

    // Update session with new tokens
    req.session.tokens = {
      ...req.session.tokens,
      ...credentials
    };

    // Save session
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    logger.info('Token refreshed successfully', {
      userEmail: req.session.user.email,
      newExpiryDate: new Date(credentials.expiry_date).toISOString()
    });

  } catch (error) {
    logger.error('Token refresh failed', {
      userEmail: req.session.user.email,
      error: error.message,
      errorCode: error.code
    });

    // If refresh token is invalid, clear session and force re-login
    if (error.code === 'invalid_grant') {
      logger.warn('Refresh token invalid, clearing session', {
        userEmail: req.session.user.email
      });

      return req.session.destroy((err) => {
        if (err) {
          logger.error('Session destroy failed', { error: err.message });
        }
        res.status(401).json({
          error: 'session_expired',
          message: 'Your session has expired. Please login again.'
        });
      });
    }

    // For other errors, log but don't block request
    // Session is still valid even if token refresh fails
  }

  next();
}

/**
 * Attach to specific routes that need fresh Google tokens
 * Example: Routes that call Google APIs on behalf of user
 */
export function requireFreshToken(req, res, next) {
  refreshTokenIfNeeded(req, res, next);
}
```

**Update server to use middleware:**

**File:** [server/src/index.js](../server/src/index.js)

```diff
+ import { refreshTokenIfNeeded } from './middleware/tokenRefresh.js';

  // Session with enhanced security
  app.use(session(sessionSecurity))

  // Enhanced request logging middleware
  app.use(requestLogger)

+ // Auto-refresh tokens for authenticated requests
+ app.use(refreshTokenIfNeeded)

  // API security headers
  app.use(apiSecurityHeaders)
```

**Impact:**
- Users stay logged in even after access token expires
- No manual token refresh needed
- Seamless experience for long sessions
- Graceful handling of expired refresh tokens

---

### 6. Session Monitoring & Metrics

**File:** `server/src/services/sessionMonitor.js`

```javascript
import { createContextLogger } from './logger.js';

const logger = createContextLogger('services/sessionMonitor', 'SessionMonitor');

export class SessionMonitor {
  constructor(sessionStore) {
    this.store = sessionStore;
    this.metrics = {
      activeSessions: 0,
      totalLogins: 0,
      totalLogouts: 0,
      averageSessionDuration: 0
    };
  }

  /**
   * Track login event
   */
  trackLogin(sessionId, userEmail) {
    this.metrics.totalLogins++;
    
    logger.info('User logged in', {
      sessionId,
      userEmail,
      totalLogins: this.metrics.totalLogins
    });
  }

  /**
   * Track logout event
   */
  trackLogout(sessionId, userEmail, duration) {
    this.metrics.totalLogouts++;
    
    logger.info('User logged out', {
      sessionId,
      userEmail,
      sessionDuration: duration,
      totalLogouts: this.metrics.totalLogouts
    });
  }

  /**
   * Get active session count from Redis
   */
  async getActiveSessionCount() {
    try {
      if (!this.store.client) {
        return 0;
      }

      const keys = await this.store.client.keys('insighthub:sess:*');
      this.metrics.activeSessions = keys.length;
      
      return this.metrics.activeSessions;
    } catch (error) {
      logger.error('Failed to get active session count', {
        error: error.message
      });
      return 0;
    }
  }

  /**
   * Get all metrics
   */
  async getMetrics() {
    await this.getActiveSessionCount();
    
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cleanup expired sessions (if needed)
   */
  async cleanupExpiredSessions() {
    // Redis handles this automatically with TTL
    // This method is for additional cleanup logic if needed
    logger.info('Session cleanup check completed');
  }
}

// Export singleton instance
export const sessionMonitor = new SessionMonitor(null);
```

**Add metrics endpoint:**

**File:** [server/src/routes/api.routes.js](../server/src/routes/api.routes.js)

```javascript
// Add to existing routes
router.get('/session/stats', requireAuth, async (req, res) => {
  try {
    const metrics = await sessionMonitor.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session metrics' });
  }
});
```

---

## Testing Your Changes

### 1. Test Extended Session Duration

```bash
# Login via browser
open http://localhost:3000

# Check session cookie expiration in browser DevTools
# Application > Cookies > 3ddiagnostix.sid
# Should show "Expires: 7 days from now"
```

### 2. Test Redis Session Persistence

```bash
# Login via browser
# Note your email address

# Restart backend server
npm run dev

# Refresh browser - should stay logged in
# Without Redis: User gets logged out
# With Redis: User stays logged in ✅
```

### 3. Test Token Refresh

```javascript
// In browser console after login
fetch('/api/user/rights')
  .then(r => r.json())
  .then(console.log);

// Wait 2 hours (or mock token expiry)
// Make another request - should work without re-login
```

### 4. Test Session Metrics

```bash
curl http://localhost:3001/api/session/stats \
  -H "Cookie: 3ddiagnostix.sid=..."

# Expected output:
{
  "activeSessions": 3,
  "totalLogins": 42,
  "totalLogouts": 38,
  "timestamp": "2026-01-11T10:30:00.000Z"
}
```

---

## Deployment Checklist

- [ ] Redis installed and running
- [ ] `REDIS_URL` added to production `.env`
- [ ] `SESSION_SECRET` is strong and unique in production
- [ ] `NODE_ENV=production` set in production
- [ ] Nginx configured to set `X-Forwarded-Proto: https`
- [ ] Session duration tested (7 days)
- [ ] Server restart tested (sessions persist with Redis)
- [ ] Token refresh tested (automatic renewal works)
- [ ] Monitoring/logging configured for session events

---

## Rollback Plan

If issues occur after deployment:

1. **Revert session duration:**
   ```javascript
   maxAge: 24 * 60 * 60 * 1000 // Back to 24 hours
   ```

2. **Disable Redis (emergency):**
   ```javascript
   // Comment out store line
   // store: sessionStore,
   ```

3. **Revert OAuth prompt:**
   ```javascript
   prompt: 'consent' // Back to original
   ```

4. **Check logs:**
   ```bash
   # Session-related errors
   grep "Session" logs/app.log | tail -100
   
   # Redis errors
   grep "Redis" logs/app.log | tail -100
   ```

---

## Performance Impact

### Expected Improvements

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Session Duration | 24 hours | 7 days | +583% |
| Sessions Surviving Restart | 0% | 100% | ∞ |
| Token Refresh API Calls | Manual | Automatic | N/A |
| Login Frequency | Daily | Weekly | -86% |

### Resource Usage

- **Redis Memory:** ~1KB per session × active sessions
- **Network:** Minimal (local Redis connection)
- **CPU:** Negligible overhead

**Example:**
- 100 active users × 1KB = 100KB memory
- 1,000 active users = 1MB memory

---

## Next Steps

1. **Immediate (Do Now):**
   - ✅ Extend session to 7 days
   - ✅ Change OAuth prompt

2. **This Week:**
   - 🔴 Setup Redis for session storage
   - ⚠️ Enable secure cookies in production

3. **This Month:**
   - 📊 Implement token refresh middleware
   - 📈 Add session monitoring

4. **Future:**
   - 🔐 Add "Remember Me" option
   - 📱 Device management UI
   - 🔄 Token rotation strategy

---

## Support & Troubleshooting

### Common Issues

**"Session not found after server restart"**
- Solution: Install and configure Redis session store

**"Token expired" errors in Google API calls**
- Solution: Implement automatic token refresh middleware

**"Cookie not sent from frontend"**
- Solution: Ensure `credentials: 'include'` in frontend fetch calls
- Verify CORS configuration allows credentials

### Useful Commands

```bash
# Check Redis sessions
redis-cli keys "insighthub:sess:*" | wc -l

# View session data
redis-cli get "insighthub:sess:SESSION_ID_HERE"

# Clear all sessions (emergency)
redis-cli flushdb

# Monitor Redis in real-time
redis-cli monitor
```

---

## Documentation Updates

After implementing, update:
- [x] [OAUTH_SESSION_ANALYSIS.md](./OAUTH_SESSION_ANALYSIS.md)
- [ ] [deployment-guide.md](./deployment-guide.md) - Add Redis setup
- [ ] [ENVIRONMENT_SETUP_SUMMARY.md](./ENVIRONMENT_SETUP_SUMMARY.md) - Add Redis to dependencies
- [ ] [README.md](../README.md) - Update features list

---

## Related Documentation

- [OAUTH_SESSION_ANALYSIS.md](./OAUTH_SESSION_ANALYSIS.md) - Detailed analysis
- [casbin-login-flow.md](./casbin-login-flow.md) - Authentication flow
- [CASBIN_MIGRATION_STEPS.md](./CASBIN_MIGRATION_STEPS.md) - Authorization setup
