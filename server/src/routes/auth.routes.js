import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'

const router = Router()

/**
 * GET /auth/test-session
 *
 * Lightweight endpoint used during development to verify session
 * persistence across requests. It writes a timestamp into the session and
 * returns the current session id and test value. This endpoint intentionally
 * depends on express-session being configured and will show whether the
 * session cookie is being preserved by the browser.
 *
 * Response: { sessionId, testValue, message }
 */
// Test session endpoint
router.get('/test-session', (req, res) => {
  req.logger?.debug('Session test endpoint accessed', {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    hasUserAgent: !!req.headers['user-agent']
  })
  
  // Set a test value in session
  req.session.test = new Date().toISOString()
  
  res.json({
    sessionId: req.sessionID,
    testValue: req.session.test,
    message: 'Session test completed'
  })
/**
 * @file auth.routes.js
 * @description Authentication and session-related routes
 */
})

/**
 * GET /auth/google
 *
 * Generates a Google OAuth 2.0 authorization URL and returns it as JSON.
 * The frontend should redirect the user to the returned `authUrl` to begin
 * consent. Environment variables GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and
 * GOOGLE_REDIRECT_URI are used to build the client.
 *
 * Response: { authUrl }
 */
// Generate Google OAuth URL
router.get('/google', (req, res) => {
  try {
    // Create client inside the route to ensure env vars are loaded
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    
    const scopes = [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/admin.directory.user.readonly',
      'https://www.googleapis.com/auth/admin.directory.group.readonly'
    ]

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })

    res.json({ authUrl })
  } catch (error) {
    req.logger?.error('OAuth error during auth URL generation', { error: error.message });
    res.status(500).json({ error: 'Failed to generate auth URL' })
  }
})

/**
 * GET /auth/google/callback
 *
 * OAuth callback endpoint for Google. Expects query parameter `code`.
 * Exchanges the authorization code for tokens, verifies the ID token, and
 * initializes the server-side session with `req.session.user` and
 * `req.session.tokens`. On success the user is redirected to the frontend
 * dashboard. On failure the user is redirected to the frontend root with
 * an error query parameter.
 *
 * Query params:
 * - code: authorization code from Google
 * - error: optional error returned by Google
 *
 * Side effects:
 * - Creates/updates express session with user info and tokens
 * - Calls `req.session.save()` before redirecting
 */
// Handle Google OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query

    req.logger?.info('OAuth callback received', {
      hasCode: !!code,
      hasError: !!error
    });

    if (error) {
      req.logger?.error('OAuth error from Google', { error });
      return res.redirect(`${process.env.CLIENT_URL}/?error=oauth_rejected`)
    }

    if (!code) {
      req.logger?.error('No authorization code provided');
      return res.redirect(`${process.env.CLIENT_URL}/?error=no_code`)
    }

    req.logger?.debug('Creating OAuth client', {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });

    // Create OAuth2 client
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Exchange code for tokens
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // Get basic user info from ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

    // Use Directory API to get groups and profile
    const directory = google.admin({ version: 'directory_v1', auth: client })
    // Get user profile (orgUnit, department, etc.)
    const userProfileRes = await directory.users.get({ userKey: payload.email })
    const userProfile = userProfileRes.data

    // Get user groups
    const groupsRes = await directory.groups.list({ userKey: payload.email })
    const groups = (groupsRes.data.groups || []).map(g => g.name)

    // Build user info from Google data
    const userInfo = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      orgUnit: userProfile.orgUnitPath || null,
      department: userProfile.department || null,
      groups,
      roles: userProfile.relations ? userProfile.relations.filter(r => r.type === 'manager').map(r => r.value) : [],
      googleRaw: { profile: userProfile, groups: groupsRes.data.groups }
    }

    req.session.user = userInfo
    req.session.tokens = tokens

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        req.logger?.error('Session save error', { error: err.message });
        return res.redirect(`${process.env.CLIENT_URL}/?error=session_failed`)
      }
      res.redirect(`${process.env.CLIENT_URL}/dashboard`)
    })
  } catch (error) {
    req.logger?.error('OAuth callback error', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    })
    // Redirect to frontend with error instead of returning JSON
    res.redirect(`${process.env.CLIENT_URL}/?error=oauth_failed`)
  }
})

/**
 * POST /auth/logout
 *
 * Destroys the server-side session. Returns JSON success message on
 * completion. Clients should also clear any local state after receiving a
 * successful response.
 *
 * Response: { success: true, message }
 */
// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' })
    }
    res.json({ success: true, message: 'Logged out successfully' })
  })
})

/**
 * GET /auth/me
 *
 * Returns the current authenticated user stored in the session. If no
 * user is present in the session this endpoint returns HTTP 401.
 *
 * Response (authenticated): { user, authenticated: true }
 * Response (not authenticated): 401 { error: 'Not authenticated' }
 */
// Get current user
router.get('/me', (req, res) => {
  req.logger?.debug('/me endpoint accessed', {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    hasCookies: !!req.headers.cookie,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  })
  
  if (!req.session.user) {
    req.logger?.debug('No user in session');
    return res.status(401).json({ error: 'Not authenticated' })
  }

  req.logger?.debug('User authenticated', { userEmail: req.session.user.email });
  res.json({
    user: req.session.user,
    authenticated: true
  })
})

export default router