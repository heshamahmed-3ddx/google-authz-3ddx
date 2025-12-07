#!/usr/bin/env node
/**
 * Manual test script for date formatters
 * Tests server-side date formatting utilities
 */

import { formatDate, formatTime, formatDateTime } from '../server/src/utils/dateFormatter.js';

console.log('🧪 Testing Date Formatters\n');
console.log('='.repeat(60));

// Test formatDate
console.log('\n📅 Testing formatDate:');
console.log('-'.repeat(60));
const testDates = [
  new Date('2025-12-31T10:02:00'),
  new Date('2025-01-05T10:02:00'),
  new Date('2025-03-15T10:02:00'),
  new Date('2025-07-20T10:02:00'),
  new Date('2025-11-01T10:02:00'),
  new Date('2024-02-29T10:02:00'), // Leap year
];

testDates.forEach(date => {
  const formatted = formatDate(date);
  console.log(`  ${date.toISOString().split('T')[0]} → ${formatted}`);
});

// Test formatTime
console.log('\n⏰ Testing formatTime:');
console.log('-'.repeat(60));
const testTimes = [
  new Date('2025-12-31T22:02:00'), // 10:02p
  new Date('2025-12-31T10:02:00'), // 10:02a
  new Date('2025-12-31T00:00:00'), // 12:00a (midnight)
  new Date('2025-12-31T12:00:00'), // 12:00p (noon)
  new Date('2025-12-31T09:05:00'), // 9:05a
  new Date('2025-12-31T14:05:00'), // 2:05p
];

testTimes.forEach(date => {
  const formatted = formatTime(date);
  const expected = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  console.log(`  ${date.toLocaleTimeString()} → ${formatted}`);
});

// Test formatDateTime
console.log('\n📆 Testing formatDateTime:');
console.log('-'.repeat(60));
const testDateTimes = [
  new Date('2025-12-31T22:02:00'),
  new Date('2025-12-31T10:02:00'),
  new Date('2025-01-01T00:00:00'), // New Year
];

testDateTimes.forEach(date => {
  const formatted = formatDateTime(date);
  console.log(`  ${date.toISOString()} → ${formatted}`);
});

// Test edge cases
console.log('\n⚠️  Testing Edge Cases:');
console.log('-'.repeat(60));
console.log(`  null → "${formatDate(null)}" (should be empty)`);
console.log(`  undefined → "${formatDate(undefined)}" (should be empty)`);
console.log(`  "" → "${formatDate('')}" (should be empty)`);
console.log(`  invalid → "${formatDate('invalid-date')}" (should be empty)`);

console.log('\n' + '='.repeat(60));
console.log('✅ Date formatter tests completed!\n');

