#!/usr/bin/env node
/**
 * Test script for report access logging
 * Tests database table and logging functionality
 */

import mysql from 'mysql2/promise';
import { createConnection } from '../server/src/services/database.js';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'insighthub',
};

async function testReportLogging() {
  console.log('📊 Testing Report Access Logging\n');
  console.log('='.repeat(60));

  let connection;

  try {
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database');

    // Check if table exists
    console.log('\n📋 Checking report_access_logs table...');
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'report_access_logs'"
    );

    if (tables.length === 0) {
      console.log('❌ Table report_access_logs does not exist!');
      console.log('   Please run the schema file: database/report_access_logs_schema.sql');
      return;
    }
    console.log('✅ Table exists');

    // Check table structure
    console.log('\n📐 Checking table structure...');
    const [columns] = await connection.query(
      "DESCRIBE report_access_logs"
    );

    const requiredFields = [
      'id', 'report_id', 'report_name', 'requester_email',
      'access_type', 'access_time', 'request_duration_ms',
      'query_parameters', 'metadata'
    ];

    const existingFields = columns.map(col => col.Field);
    const missingFields = requiredFields.filter(field => !existingFields.includes(field));

    if (missingFields.length > 0) {
      console.log('⚠️  Missing fields:', missingFields.join(', '));
    } else {
      console.log('✅ All required fields present');
    }

    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const [indexes] = await connection.query(
      "SHOW INDEXES FROM report_access_logs"
    );

    const indexNames = [...new Set(indexes.map(idx => idx.Key_name))];
    console.log(`  Found ${indexNames.length} indexes:`, indexNames.join(', '));

    // Check for existing logs
    console.log('\n📝 Checking existing logs...');
    const [logs] = await connection.query(
      "SELECT COUNT(*) as count FROM report_access_logs"
    );
    console.log(`  Total log entries: ${logs[0].count}`);

    if (logs[0].count > 0) {
      // Get recent logs
      const [recent] = await connection.query(
        `SELECT report_id, report_name, requester_email, access_type, 
         request_duration_ms, access_time 
         FROM report_access_logs 
         ORDER BY access_time DESC 
         LIMIT 5`
      );

      console.log('\n📋 Recent log entries:');
      recent.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.report_name} by ${log.requester_email}`);
        console.log(`     Type: ${log.access_type}, Duration: ${log.request_duration_ms}ms`);
        console.log(`     Time: ${log.access_time}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Report logging test completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testReportLogging();

