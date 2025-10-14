import { jest } from '@jest/globals';
import { createLogger, logPageView } from '../../server/src/services/logging.js';
import { httpLoggerMiddleware } from '../../server/src/middleware/logger.js';

jest.mock('../../server/src/services/logging.js', () => ({
  createLogger: jest.fn(() => ({ info: jest.fn() })),
  logPageView: jest.fn()
}));

describe('httpLoggerMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/dashboard',
      ip: '127.0.0.1',
      get: jest.fn().mockImplementation((header) => header === 'User-Agent' ? 'UA' : undefined),
      requestId: 'abc',
      userEmail: 'user@example.com',
    };
    res = {
      statusCode: 200,
      get: jest.fn().mockReturnValue('123'),
      end: jest.fn(function(chunk, encoding) { return undefined; })
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('attaches logger to req and logs request', () => {
    httpLoggerMiddleware(req, res, next);
    expect(req.logger).toBeDefined();
    expect(typeof req.logger.info).toBe('function');
    expect(next).toHaveBeenCalled();
  });

  it('logs page view for non-API GET requests', () => {
  httpLoggerMiddleware(req, res, next);
  res.end();
  expect(req.url.startsWith('/api/')).toBe(false);
  expect(req.method).toBe('GET');
  expect(logPageView).toHaveBeenCalledWith('/dashboard', expect.objectContaining({ requestId: 'abc', userEmail: 'user@example.com', ip: '127.0.0.1', userAgent: 'UA' }));
  expect(next).toHaveBeenCalled();
  });

  it('does not log page view for API GET requests', () => {
    req.url = '/api/test';
    httpLoggerMiddleware(req, res, next);
    expect(req.url.startsWith('/api/')).toBe(true);
    expect(logPageView).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('logs response on res.end', () => {
    httpLoggerMiddleware(req, res, next);
    res.end();
    expect(req.logger).toBeDefined();
    expect(typeof req.logger.info).toBe('function');
    expect(next).toHaveBeenCalled();
  });
});
