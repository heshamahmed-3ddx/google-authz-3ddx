#!/usr/bin/env node

/**
 * Cleanup Casbin Duplicate Policies
 * Removes duplicate entries from casbin_rule table, keeping only the oldest entry
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const dbConfig = {
  host: process.env.DB_HOST || '10.114.0.22',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'powerbidbuser',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'PowerBi_db'
};

async function cleanupDuplicates() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Get all rules
    console.log('\n📊 Analyzing casbin_rule table...');
    const [rules] = await connection.query('SELECT * FROM casbin_rule ORDER BY id');
    console.log(`Found ${rules.length} total rules`);
    
    // Find duplicates (same ptype, v0, v1, v2, v3, v4, v5)
    const uniqueRules = new Map();
    const duplicates = [];
    
    for (const rule of rules) {
      const key = `${rule.ptype}|${rule.v0}|${rule.v1}|${rule.v2}|${rule.v3}|${rule.v4}|${rule.v5}`;
      
      if (uniqueRules.has(key)) {
        // This is a duplicate
        duplicates.push(rule.id);
      } else {
        // First occurrence, keep it
        uniqueRules.set(key, rule);
      }
    }
    
    console.log(`\n📈 Statistics:`);
    console.log(`  Unique rules: ${uniqueRules.size}`);
    console.log(`  Duplicate rules: ${duplicates.length}`);
    console.log(`  Total rules: ${rules.length}`);
    
    if (duplicates.length === 0) {
      console.log('\n✨ No duplicates found! Database is clean.');
      return;
    }
    
    // Show some examples
    console.log(`\n🔍 Example duplicates (first 5):`);
    for (let i = 0; i < Math.min(5, duplicates.length); i++) {
      const dupRule = rules.find(r => r.id === duplicates[i]);
      console.log(`  ID ${dupRule.id}: ${dupRule.ptype} ${dupRule.v0} ${dupRule.v1} ${dupRule.v2}`);
    }
    
    // Ask for confirmation
    console.log(`\n⚠️  About to delete ${duplicates.length} duplicate entries`);
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Delete duplicates in batches
    console.log('\n🗑️  Deleting duplicates...');
    const batchSize = 100;
    let deleted = 0;
    
    for (let i = 0; i < duplicates.length; i += batchSize) {
      const batch = duplicates.slice(i, i + batchSize);
      const placeholders = batch.map(() => '?').join(',');
      const [result] = await connection.query(
        `DELETE FROM casbin_rule WHERE id IN (${placeholders})`,
        batch
      );
      deleted += result.affectedRows;
      console.log(`  Deleted ${deleted}/${duplicates.length}...`);
    }
    
    console.log(`\n✅ Successfully deleted ${deleted} duplicate entries`);
    
    // Verify final count
    const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM casbin_rule');
    console.log(`\n📊 Final statistics:`);
    console.log(`  Total rules remaining: ${finalCount[0].count}`);
    console.log(`  Expected: ${uniqueRules.size}`);
    
    if (finalCount[0].count === uniqueRules.size) {
      console.log('\n🎉 Database cleanup completed successfully!');
    } else {
      console.log('\n⚠️  Warning: Final count does not match expected. Please verify manually.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the cleanup
console.log('🧹 Casbin Duplicate Cleanup Script\n');
cleanupDuplicates()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
