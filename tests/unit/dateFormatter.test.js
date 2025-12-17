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

    test('handles single digit day correctly', () => {
      const date = new Date('2025-01-05T10:02:00');
      expect(formatDate(date)).toBe('5/Jan/2025');
    });

    test('handles different months correctly', () => {
      expect(formatDate(new Date('2025-03-15'))).toBe('15/Mar/2025');
      expect(formatDate(new Date('2025-07-20'))).toBe('20/Jul/2025');
      expect(formatDate(new Date('2025-11-01'))).toBe('1/Nov/2025');
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
    test('formats evening time correctly (10:02p)', () => {
      const date = new Date('2025-12-31T22:02:00');
      expect(formatTime(date)).toBe('10:02p');
    });

    test('formats morning time correctly (10:02a)', () => {
      const morning = new Date('2025-12-31T10:02:00');
      expect(formatTime(morning)).toBe('10:02a');
    });

    test('formats midnight correctly (12:00a)', () => {
      const midnight = new Date('2025-12-31T00:00:00');
      expect(formatTime(midnight)).toBe('12:00a');
    });

    test('formats noon correctly (12:00p)', () => {
      const noon = new Date('2025-12-31T12:00:00');
      expect(formatTime(noon)).toBe('12:00p');
    });

    test('formats single digit hours correctly', () => {
      const early = new Date('2025-12-31T09:05:00');
      expect(formatTime(early)).toBe('9:05a');
    });

    test('pads minutes correctly', () => {
      const date = new Date('2025-12-31T14:05:00');
      expect(formatTime(date)).toBe('2:05p');
    });

    test('returns empty string for invalid date', () => {
      expect(formatTime(null)).toBe('');
      expect(formatTime('invalid')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    test('formats date and time together correctly', () => {
      const date = new Date('2025-12-31T22:02:00');
      expect(formatDateTime(date)).toBe('31/Dec/2025 10:02p');
    });

    test('formats morning datetime correctly', () => {
      const date = new Date('2025-12-31T10:02:00');
      expect(formatDateTime(date)).toBe('31/Dec/2025 10:02a');
    });

    test('returns empty string for invalid date', () => {
      expect(formatDateTime(null)).toBe('');
      const invalid = formatDateTime('invalid');
      // Should return empty string or space for invalid dates
      expect(invalid.trim()).toBe('');
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
      expect(formatDateTime(newYear)).toBe('1/Jan/2025 12:00a');
    });

    test('handles different timezones correctly', () => {
      // Date objects in JavaScript are timezone-aware
      // The year might differ by 1 day depending on timezone (2025 vs 2026)
      const date = new Date('2025-12-31T23:59:59Z');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/\d{1,2}\/\w{3}\/(2025|2026) \d{1,2}:\d{2}[ap]/);
    });
  });
});

