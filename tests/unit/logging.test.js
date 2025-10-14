import { createLogger, logAuth, logAuthz, logUserAccess, logPageView, logError } from '../../server/src/services/logging.js';

describe('logging.js', () => {
  describe('createLogger', () => {
    it('creates a child logger with context', () => {
      const logger = createLogger({ requestId: 'abc', userEmail: 'test@example.com' });
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });
    it('throws if context is not an object', () => {
      expect(() => createLogger('not-an-object')).toThrow('createLogger: context must be an object');
    });
  });

  describe('logAuth', () => {
    it('logs attempt event', () => {
      expect(() => logAuth('attempt', { requestId: '1', userEmail: 'u', provider: 'google', ip: '127.0.0.1' })).not.toThrow();
    });
    it('logs success event', () => {
      expect(() => logAuth('success', { requestId: '2', userEmail: 'u', provider: 'google', ip: '127.0.0.1', sessionId: 'sess' })).not.toThrow();
    });
    it('logs failure event', () => {
      expect(() => logAuth('failure', { requestId: '3', userEmail: 'u', provider: 'google', ip: '127.0.0.1', reason: 'bad password' })).not.toThrow();
    });
    it('logs unknown event', () => {
      expect(() => logAuth('unknown', { requestId: '4', userEmail: 'u' })).not.toThrow();
    });
    it('handles missing data fields gracefully', () => {
      expect(() => logAuth('attempt')).not.toThrow();
      expect(() => logAuth('success')).not.toThrow();
      expect(() => logAuth('failure')).not.toThrow();
    });
    it('handles unknown event with missing data', () => {
      expect(() => logAuth('unknown')).not.toThrow();
    });
  });

  describe('logAuthz', () => {
    it('logs authorization decision', () => {
      expect(() => logAuthz({ requestId: 'r', userEmail: 'u', resource: 'res', action: 'read', allowed: true, userGroups: ['g'], matchingPolicies: [1,2], evaluationTime: 5 })).not.toThrow();
    });
    it('handles missing optional fields', () => {
      expect(() => logAuthz({ requestId: 'r', userEmail: 'u', resource: 'res', action: 'read', allowed: false })).not.toThrow();
    });
  });

  describe('logUserAccess', () => {
    it('logs user access to endpoint', () => {
      expect(() => logUserAccess('/api/test', { requestId: 'r', userEmail: 'u', ip: '127.0.0.1', userAgent: 'UA' })).not.toThrow();
    });
    it('handles missing data fields', () => {
      expect(() => logUserAccess('/api/test')).not.toThrow();
    });
  });

  describe('logPageView', () => {
    it('logs page view', () => {
      expect(() => logPageView('/dashboard', { requestId: 'r', userEmail: 'u', ip: '127.0.0.1', userAgent: 'UA' })).not.toThrow();
    });
    it('handles missing data fields', () => {
      expect(() => logPageView('/dashboard')).not.toThrow();
    });
  });

  describe('logError', () => {
    it('logs error with context', () => {
      const err = new Error('fail');
      expect(() => logError(err, { requestId: 'r', userEmail: 'u', route: '/fail', method: 'GET', ip: '127.0.0.1' })).not.toThrow();
    });
    it('throws if first argument is not Error', () => {
      expect(() => logError('not-an-error')).toThrow('logError: first argument must be an Error');
    });
    it('handles missing context fields', () => {
      const err = new Error('fail');
      expect(() => logError(err)).not.toThrow();
    });
    it('handles error with partial context', () => {
      const err = new Error('fail');
      expect(() => logError(err, { userEmail: 'u' })).not.toThrow();
    });
  });
});
