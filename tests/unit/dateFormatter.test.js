/**
 * @file dateFormatter.test.js
 * @description Unit tests for date formatting utilities
 */

import { formatDate, formatTime, formatDateTime, parseDate } from '../../server/src/utils/dateFormatter.js';

describe('Date Formatter Utilities', () => {
  describe('formatDate', () => {
    test('formats date correctly to 31/Dec/2025 format', () => {
      const date = new Date('2025-12-31T10:02:00');
      expect(formatDate(date)).toBe('31/Dec/2025');
    });

    test('formats date from string', () => {
      expect(formatDate('2025-12-31')).toBe('31/Dec/2025');
    });

    test('handles single digit day correctly with leading zero', () => {
      const date = new Date('2025-01-05T10:02:00');
      expect(formatDate(date)).toBe('05/Jan/2025');
    });

    test('handles different months correctly', () => {
      expect(formatDate(new Date('2025-03-15'))).toBe('15/Mar/2025');
      expect(formatDate(new Date('2025-07-20'))).toBe('20/Jul/2025');
      expect(formatDate(new Date('2025-11-01'))).toBe('01/Nov/2025');
    });

    test('returns empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    test('returns empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate(new Date('invalid'))).toBe('');
    });
  });

  describe('formatTime', () => {
    test('formats evening time correctly (24-hour format)', () => {
      const date = new Date('2025-12-31T22:02:00');
      expect(formatTime(date)).toBe('22:02:00');
    });

    test('formats morning time correctly (24-hour format)', () => {
      const morning = new Date('2025-12-31T10:02:00');
      expect(formatTime(morning)).toBe('10:02:00');
    });

    test('formats midnight correctly (00:00:00)', () => {
      const midnight = new Date('2025-12-31T00:00:00');
      expect(formatTime(midnight)).toBe('00:00:00');
    });

    test('formats noon correctly (12:00:00)', () => {
      const noon = new Date('2025-12-31T12:00:00');
      expect(formatTime(noon)).toBe('12:00:00');
    });

    test('formats single digit hours with leading zero', () => {
      const early = new Date('2025-12-31T09:05:00');
      expect(formatTime(early)).toBe('09:05:00');
    });

    test('formats afternoon time correctly', () => {
      const date = new Date('2025-12-31T14:05:00');
      expect(formatTime(date)).toBe('14:05:00');
    });

    test('returns empty string for invalid date', () => {
      expect(formatTime(null)).toBe('');
      expect(formatTime('invalid')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    test('formats date and time together correctly', () => {
      const date = new Date('2025-12-31T22:02:00');
      expect(formatDateTime(date)).toBe('31/Dec/2025:22:02:00');
    });

    test('formats morning datetime correctly', () => {
      const date = new Date('2025-12-31T10:02:00');
      expect(formatDateTime(date)).toBe('31/Dec/2025:10:02:00');
    });

    test('returns empty string or separator for invalid date', () => {
      expect(formatDateTime(null)).toBe('');
      const invalid = formatDateTime('invalid');
      // Invalid dates return just the separator ':'
      expect(invalid).toBe(':');
    });
  });

  describe('parseDate', () => {
    test('parses valid date string', () => {
      const date = parseDate('2025-12-31');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(11); // December is month 11
      expect(date.getDate()).toBe(31);
    });

    test('returns null for invalid date', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate('')).toBeNull();
    });
  });

  describe('Edge cases', () => {
    test('handles leap year dates', () => {
      const leapDay = new Date('2024-02-29');
      expect(formatDate(leapDay)).toBe('29/Feb/2024');
    });

    test('handles year boundaries', () => {
      const newYear = new Date('2025-01-01T00:00:00');
      expect(formatDateTime(newYear)).toBe('01/Jan/2025:00:00:00');
    });

    test('handles different timezones correctly', () => {
      // Date objects in JavaScript are timezone-aware
      // The year might differ by 1 day depending on timezone (2025 vs 2026)
      const date = new Date('2025-12-31T23:59:59Z');
      const formatted = formatDateTime(date);
      // Format is now DD/MMM/YYYY:HH:mm:ss with leading zeros
      expect(formatted).toMatch(/\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}/);
    });
  });
});

