import { jest } from '@jest/globals';
import { errorHandler } from '../../server/src/middleware/errorHandler.js';

describe('errorHandler.js', () => {
  let req, res, next;

  let mockLogger;
  beforeEach(() => {
    req = { method: 'GET', url: '/test', requestId: 'abc', userEmail: 'u', logger: { error: jest.fn() } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false
    };
    next = jest.fn();
    mockLogger = req.logger;
    jest.clearAllMocks();
  });

  it('handles known error types', () => {
    const err = new Error('fail');
    err.name = 'ValidationError';
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: 'VALIDATION_ERROR' }) }));
  expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in middleware', expect.objectContaining({ error: err.message, stack: err.stack, requestId: req.requestId, userEmail: req.userEmail, route: req.url, method: req.method, ip: req.ip }));
  });

  it('handles unknown error types', () => {
    const err = new Error('fail');
    err.name = 'UnknownError';
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: 'INTERNAL_ERROR' }) }));
  expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in middleware', expect.objectContaining({ error: err.message, stack: err.stack, requestId: req.requestId, userEmail: req.userEmail, route: req.url, method: req.method, ip: req.ip }));
  });

  it('handles error with custom status', () => {
    const err = new Error('fail');
    err.status = 404;
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: 'NOT_FOUND' }) }));
  });

  it('avoids double response if headersSent', () => {
    const err = new Error('fail');
    res.headersSent = true;
    errorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('includes stack in development', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('fail');
    errorHandler(err, req, res, next);
    const response = res.json.mock.calls[0][0];
    expect(response.error.stack).toBeDefined();
  });

  it('omits stack in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('fail');
    errorHandler(err, req, res, next);
    const response = res.json.mock.calls[0][0];
    expect(response.error.stack).toBeUndefined();
  });
});
