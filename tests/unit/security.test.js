import { jest } from '@jest/globals';
import { securityHeaders, generalRateLimit, authRateLimit, speedLimiter, csrfProtection, requestValidation, sessionSecurity, corsOptions, sanitizeInput, apiSecurityHeaders, securityErrorHandler } from '../../server/src/middleware/security.js';

// Mocks for express objects
const mockReq = (props = {}) => ({
  ...props,
  get: jest.fn((header) => {
    if (header === 'User-Agent') return 'UA';
    if (header === 'Referer') return 'ref';
    if (header === 'Origin') return 'origin';
    return undefined;
  }),
  ip: '127.0.0.1',
  path: '/test',
  method: 'GET',
  query: {},
  body: {},
  requestId: 'reqid',
  startTime: Date.now(),
  session: { user: { email: 'user@example.com' } }
});
const mockRes = () => {
  const res = {};
  res.setHeader = jest.fn();
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};
const mockNext = jest.fn();

// Test securityErrorHandler

describe('securityErrorHandler', () => {
  it('handles CSRF token mismatch', () => {
    const req = mockReq();
    const res = mockRes();
    const err = { code: 'EBADCSRFTOKEN' };
    securityErrorHandler(err, req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: 'CSRF_TOKEN_MISMATCH' }) }));
  });

  it('handles rate limit errors', () => {
    const req = mockReq();
    const res = mockRes();
    const err = { status: 429 };
    securityErrorHandler(err, req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: 'RATE_LIMIT_EXCEEDED' }) }));
  });

  it('calls next for other errors', () => {
    const req = mockReq();
    const res = mockRes();
    const err = { message: 'other', stack: 'stack' };
    securityErrorHandler(err, req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(err);
  });
});

// Test sanitizeInput

describe('sanitizeInput', () => {
  it('sanitizes req.body and req.query', () => {
    const req = mockReq({ path: '/not-callback' });
    req.body = { x: '<script>alert(1)</script>' };
    req.query = { y: 'hello&world' };
    const res = mockRes();
    const next = jest.fn();
  sanitizeInput(req, res, next);
  // Debug output
  // eslint-disable-next-line no-console
  console.log('body after sanitize:', req.body);
  // eslint-disable-next-line no-console
  console.log('query after sanitize:', req.query);
  expect(req.body).toBeDefined();
  expect(req.body.x).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  expect(req.query).toBeDefined();
  expect(req.query.y).toBe('hello&amp;world');
  expect(next).toHaveBeenCalled();
  });

  it('skips sanitization for /auth/google/callback', () => {
  const req = mockReq({ path: '/auth/google/callback' });
  req.body = { code: 'abc/def' };
    const res = mockRes();
    const next = jest.fn();
  sanitizeInput(req, res, next);
  // eslint-disable-next-line no-console
  console.log('body after sanitize (callback):', req.body);
  expect(req.body).toBeDefined();
  expect(req.body.code).toBe('abc/def');
  expect(next).toHaveBeenCalled();
  });
});

// Test requestValidation

describe('requestValidation', () => {
  it('calls next for valid requests', () => {
    const req = mockReq({ path: '/safe', query: {}, body: {} });
    const res = mockRes();
    const next = jest.fn();
    requestValidation(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks suspicious requests', () => {
  const req = mockReq({ path: '/evil' });
  req.body = { x: '<script>' };
    const res = mockRes();
    const next = jest.fn();
  requestValidation(req, res, next);
  // eslint-disable-next-line no-console
  console.log('res.status calls:', res.status.mock.calls);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: 'INVALID_REQUEST' }) }));
  });
});

// Test apiSecurityHeaders

describe('apiSecurityHeaders', () => {
  it('sets API security headers', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    apiSecurityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-API-Version', '1.0.0');
    expect(res.setHeader).toHaveBeenCalledWith('X-Response-Time', expect.any(Number));
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.requestId);
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Expires', '0');
    expect(next).toHaveBeenCalled();
  });
});
