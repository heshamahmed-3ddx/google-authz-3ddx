# Security Configuration Guide

## Overview

This document outlines the comprehensive security measures implemented in the InsightHub Authorization System for production deployment.

## Security Features

### 1. HTTP Security Headers (Helmet.js)

#### Content Security Policy (CSP)
- **Default Source**: `'self'` only
- **Style Sources**: Self, Google Fonts, CDNs with inline styles for Vuetify
- **Script Sources**: Self, Google OAuth domains
- **Font Sources**: Self, Google Fonts CDN
- **Image Sources**: Self, data URIs, Google profile images
- **Connect Sources**: Self, Google APIs for OAuth

#### Security Headers Applied
- **HSTS**: 1-year max-age with includeSubDomains and preload
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: Enabled
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts camera, microphone, geolocation access

### 2. Rate Limiting

#### General API Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: Standard `RateLimit-*` headers
- **Logging**: Rate limit violations logged with IP and path

#### Authentication Rate Limiting
- **Window**: 15 minutes  
- **Limit**: 10 authentication attempts per IP
- **Skip Successful**: Successful requests don't count toward limit
- **Enhanced Logging**: Authentication-specific violation tracking

#### Progressive Speed Limiting
- **Window**: 15 minutes
- **Delay After**: 50 requests
- **Delay Increment**: 500ms per request
- **Maximum Delay**: 20 seconds

### 3. Cross-Site Request Forgery (CSRF) Protection

#### Configuration
- **Cookie-based tokens**: HTTP-only, secure, SameSite=strict
- **Token Sources**: Body, query, headers (X-CSRF-Token, X-XSRF-Token)
- **Safe Methods**: GET, HEAD, OPTIONS exempted
- **Error Handling**: Custom 403 responses with logging

### 4. Cross-Origin Resource Sharing (CORS)

#### Allowed Origins
- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: `https://app.3ddiagnostix.com`, `https://api.3ddiagnostix.com`

#### Configuration
- **Credentials**: Enabled for session cookies
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Standard + CSRF token headers
- **Origin Validation**: Strict allowlist with logging of violations

### 5. Session Security

#### Configuration
- **Name**: Custom session identifier (`3ddiagnostix.sid`)
- **Secret**: Environment-based, secure random in production
- **Storage**: Server-side with secure cookies
- **Rolling**: Session expiration resets on activity
- **Cookie Security**:
  - Secure: HTTPS-only in production
  - HttpOnly: Prevents XSS access
  - SameSite: Strict CSRF protection
  - MaxAge: 24 hours

### 6. Input Validation & Sanitization

#### Request Validation
- **Suspicious Pattern Detection**: Path traversal, XSS, SQL injection
- **Request Size Limits**: 10MB for body and URL-encoded data
- **Logging**: Security violations logged with request details

#### Input Sanitization
- **HTML Entity Encoding**: Automatic for string inputs
- **Recursive Sanitization**: Objects and arrays processed deeply
- **Query & Body**: Both request components sanitized

### 7. Error Handling & Information Disclosure

#### Security Error Handler
- **CSRF Violations**: Custom 403 responses
- **Rate Limit Errors**: Standardized 429 responses  
- **Generic Errors**: No stack traces in production
- **Logging**: All security errors logged with context

#### Response Headers
- **API Version**: Custom header for API versioning
- **Response Time**: Performance monitoring
- **Request ID**: Correlation for debugging
- **Cache Control**: No-store for sensitive API responses

## Environment Configuration

### Required Environment Variables

```bash
# Session Security
SESSION_SECRET=your-secure-random-secret-minimum-32-characters

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application URLs
CLIENT_URL=https://app.3ddiagnostix.com
SERVER_URL=https://api.3ddiagnostix.com

# Environment
NODE_ENV=production
PORT=443
```

### Production Environment

```bash
# Enable all security features
NODE_ENV=production

# Secure session configuration
SESSION_SECRET=$(openssl rand -base64 32)

# SSL/TLS enforcement
FORCE_HTTPS=true

# Logging level
LOG_LEVEL=info
```

## Deployment Checklist

### Pre-Deployment Security

- [ ] **Environment Variables**: All secrets configured securely
- [ ] **SSL/TLS Certificate**: Valid HTTPS certificate installed
- [ ] **Session Secret**: Cryptographically secure random value
- [ ] **CORS Origins**: Production domains configured
- [ ] **Rate Limits**: Appropriate for expected traffic
- [ ] **CSP Policy**: Tested with frontend application
- [ ] **Database Access**: Restricted to application only
- [ ] **Firewall Rules**: Only necessary ports open

### Post-Deployment Verification

- [ ] **Security Headers**: Verify with online tools (securityheaders.com)
- [ ] **SSL Labs Test**: A+ rating on SSL Labs
- [ ] **Rate Limiting**: Test with automated requests
- [ ] **CSRF Protection**: Verify token validation
- [ ] **Error Handling**: No sensitive information exposed
- [ ] **Logs**: Security events properly logged
- [ ] **Health Check**: `/health` endpoint returns security status

## Security Monitoring

### Log Monitoring

Monitor for these security events:

```json
{
  "level": "warn",
  "msg": "Rate limit exceeded",
  "ip": "192.168.1.100",
  "path": "/api/user/details"
}

{
  "level": "warn", 
  "msg": "CSRF protection triggered",
  "ip": "192.168.1.100",
  "error": "CSRF token mismatch"
}

{
  "level": "warn",
  "msg": "Suspicious request pattern detected",
  "ip": "192.168.1.100",
  "pattern": "/\\.\\./"
}
```

### Health Check Monitoring

Regular monitoring of `/health` endpoint:

```json
{
  "status": "healthy",
  "security": {
    "headers": "enabled",
    "rateLimiting": "enabled", 
    "cors": "configured",
    "csrf": "available"
  }
}
```

## Security Updates

### Regular Maintenance

1. **Dependency Updates**: Monthly security patch updates
2. **Session Secret Rotation**: Quarterly rotation
3. **Rate Limit Tuning**: Based on traffic patterns
4. **Log Review**: Weekly security log analysis
5. **Penetration Testing**: Annual security assessment

### Incident Response

1. **Rate Limit Violations**: Investigate traffic patterns
2. **CSRF Attacks**: Review referrer patterns and user reports
3. **Suspicious Patterns**: Block IPs and investigate requests
4. **Authentication Anomalies**: Review login patterns and locations

## Additional Recommendations

### Infrastructure Security

- **Reverse Proxy**: Nginx/Apache with security headers
- **Load Balancer**: SSL termination and rate limiting
- **CDN**: Cloudflare or similar with DDoS protection
- **Database**: Encrypted connections and restricted access
- **Container Security**: Regular image updates and scanning

### Application Security

- **Dependency Scanning**: Regular vulnerability scans
- **Code Analysis**: Static analysis tools (ESLint, SonarQube)
- **Security Testing**: Regular penetration testing
- **Backup Security**: Encrypted backups with access controls

### Compliance Considerations

- **GDPR**: User data protection and right to erasure
- **HIPAA**: If handling medical data, additional protections required
- **SOC 2**: Security controls documentation
- **ISO 27001**: Information security management

---

*Security Configuration Version: 1.0.0*
*Last Updated: October 8, 2025*
*Review Schedule: Quarterly*