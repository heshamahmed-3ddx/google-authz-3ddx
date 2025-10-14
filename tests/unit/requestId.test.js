import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { requestIdMiddleware } from '../../server/src/middleware/requestId.js';

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-uuid') }));

describe('requestIdMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: { user: { email: 'user@example.com' } } };
    res = { setHeader: jest.fn() };
    next = jest.fn();
  });

  it('generates and attaches a requestId', () => {
  requestIdMiddleware(req, res, next);
  expect(typeof req.requestId).toBe('string');
  expect(req.requestId).toMatch(/[0-9a-fA-F-]{36}/);
  expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.requestId);
  expect(next).toHaveBeenCalled();
  });

  it('copies user email to req.userEmail if available', () => {
    requestIdMiddleware(req, res, next);
    expect(req.userEmail).toBe('user@example.com');
  });

  it('sets req.userEmail to null if not available', () => {
    req.session = {};
    requestIdMiddleware(req, res, next);
    expect(req.userEmail).toBeNull();
  });
});
