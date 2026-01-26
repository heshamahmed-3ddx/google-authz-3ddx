import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
const envPath = path.resolve(__dirname, '.env.development');
dotenv.config({ path: envPath });

import databaseService from './src/services/database.js';

async function checkTables() {
  try {
    await databaseService.init();
    console.log('✓ Database connected');
    
    const tables = await databaseService.query("SHOW TABLES LIKE 'report_schedule%'");
    console.log('\n📊 Tables found:', tables.length);
    tables.forEach(t => console.log('  -', Object.values(t)[0]));
    
    if (tables.length > 0) {
      const schedules = await databaseService.query('SELECT COUNT(*) as count FROM report_schedules');
      console.log('\n📝 Schedules count:', schedules[0].count);
      
      const logs = await databaseService.query('SELECT COUNT(*) as count FROM report_schedule_logs');
      console.log('📋 Logs count:', logs[0].count);
    }
    
    await databaseService.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
