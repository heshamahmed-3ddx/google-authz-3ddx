import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'

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
  console.log('🧪 Session test:', {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    cookies: req.headers.cookie,
    userAgent: req.headers['user-agent']
  })
  
  // Set a test value in session
  req.session.test = new Date().toISOString()
  
  res.json({
    sessionId: req.sessionID,
    testValue: req.session.test,
    message: 'Session test completed'
  })
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
      'email',
      'profile'
    ]

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })

    res.json({ authUrl })
  } catch (error) {
    console.error('OAuth error:', error)
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

    console.log('🔍 OAuth callback received:', {
      hasCode: !!code,
      error: error,
      query: req.query
    })

    if (error) {
      console.error('❌ OAuth error from Google:', error)
      return res.redirect(`${process.env.CLIENT_URL}/?error=oauth_rejected`)
    }

    if (!code) {
      console.error('❌ No authorization code provided')
      return res.redirect(`${process.env.CLIENT_URL}/?error=no_code`)
    }

    console.log('✅ Creating OAuth client with:', {
      clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    })

    // Create client inside the route to ensure env vars are loaded
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    console.log('🔄 Exchanging code for tokens...')
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    console.log('✅ Tokens received, verifying ID token...')
    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const userInfo = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    }

    console.log('✅ User info extracted:', {
      email: userInfo.email,
      name: userInfo.name,
      id: userInfo.id
    })

    // Store user session
    req.session.user = userInfo
    req.session.tokens = tokens
    
    console.log('✅ Session created:', {
      sessionId: req.sessionID,
      userId: userInfo.id,
      email: userInfo.email,
      hasTokens: !!tokens,
      sessionData: req.session
    })
    
    // Force session save before redirect
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err)
        return res.redirect(`${process.env.CLIENT_URL}/?error=session_failed`)
      }
      
      console.log('✅ Session saved successfully, redirecting to:', `${process.env.CLIENT_URL}/dashboard`)
      // Redirect to frontend dashboard instead of returning JSON
      res.redirect(`${process.env.CLIENT_URL}/dashboard`)
    })
  } catch (error) {
    console.error('❌ OAuth callback error:', {
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
  console.log('🔍 /me endpoint called:', {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    cookies: req.headers.cookie ? 'present' : 'missing',
    cookieDetails: req.headers.cookie,
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  })
  
  if (!req.session.user) {
    console.log('❌ No user in session - Session contents:', req.session)
    return res.status(401).json({ error: 'Not authenticated' })
  }

  console.log('✅ User authenticated:', req.session.user.email)
  res.json({
    user: req.session.user,
    authenticated: true
  })
})

export default router