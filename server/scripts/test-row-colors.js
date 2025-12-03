/**
 * Test script to find records matching row color criteria
 * Run with: node server/scripts/test-row-colors.js
 */

import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

async function testRowColors() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🔍 Finding records matching row color criteria...\n');

  try {
    // 1. Rush Orders (Blue - #81BEF7)
    console.log('1️⃣  RUSH ORDERS (Blue Background):');
    const [rushOrders] = await connection.execute(`
      SELECT 
        sg.ID,
        sg.isRush,
        o.dcmPatientName,
        sg.Cost
      FROM Orders o
      INNER JOIN OrderSG sg ON o.SGID = sg.ID
      WHERE sg.isRush = 1 
        AND sg.Cost > 0
        AND o.SurgeryDate >= '2014-01-01' 
        AND o.SurgeryDate <= '2020-12-31'
      LIMIT 5
    `);
    console.log(`   Found: ${rushOrders.length} records`);
    rushOrders.forEach(row => {
      console.log(`   - ID: ${row.ID}, Patient: ${row.dcmPatientName}, isRush: ${row.isRush}, Cost: $${row.Cost}`);
    });
    console.log('');

    // 2. On Hold (Light Red - #F5A9A9)
    console.log('2️⃣  ON HOLD (Light Red Background):');
    const [onHoldOrders] = await connection.execute(`
      SELECT 
        sg.ID,
        sg.Q11_Val_4,
        o.dcmPatientName,
        sg.Cost
      FROM Orders o
      INNER JOIN OrderSG sg ON o.SGID = sg.ID
      WHERE sg.Q11_Val_4 != 0 
        AND sg.isRush != 1
        AND sg.Cost > 0
        AND o.SurgeryDate >= '2014-01-01' 
        AND o.SurgeryDate <= '2020-12-31'
      LIMIT 5
    `);
    console.log(`   Found: ${onHoldOrders.length} records`);
    onHoldOrders.forEach(row => {
      console.log(`   - ID: ${row.ID}, Patient: ${row.dcmPatientName}, Q11_Val_4: ${row.Q11_Val_4}, Cost: $${row.Cost}`);
    });
    console.log('');

    // 3. Confirmed by OEM (Grey - #BDBDBD)
    console.log('3️⃣  CONFIRMED BY OEM (Grey Background):');
    const [confirmedOrders] = await connection.execute(`
      SELECT 
        sg.ID,
        sg.Q11_Val_2,
        o.dcmPatientName,
        sg.Cost
      FROM Orders o
      INNER JOIN OrderSG sg ON o.SGID = sg.ID
      WHERE sg.Q11_Val_2 != 0 
        AND sg.isRush != 1
        AND sg.Q11_Val_4 = 0
        AND sg.Cost > 0
        AND o.SurgeryDate >= '2014-01-01' 
        AND o.SurgeryDate <= '2020-12-31'
      LIMIT 5
    `);
    console.log(`   Found: ${confirmedOrders.length} records`);
    confirmedOrders.forEach(row => {
      console.log(`   - ID: ${row.ID}, Patient: ${row.dcmPatientName}, Q11_Val_2: ${row.Q11_Val_2}, Cost: $${row.Cost}`);
    });
    console.log('');

    // 4. Active (Green - #A9F5A9)
    console.log('4️⃣  ACTIVE (Green Background):');
    const [activeOrders] = await connection.execute(`
      SELECT 
        sg.ID,
        sg.Q11_Val_1,
        o.dcmPatientName,
        sg.Cost
      FROM Orders o
      INNER JOIN OrderSG sg ON o.SGID = sg.ID
      WHERE sg.Q11_Val_1 != 0 
        AND sg.isRush != 1
        AND sg.Q11_Val_4 = 0
        AND sg.Q11_Val_2 = 0
        AND sg.Cost > 0
        AND o.SurgeryDate >= '2014-01-01' 
        AND o.SurgeryDate <= '2020-12-31'
      LIMIT 5
    `);
    console.log(`   Found: ${activeOrders.length} records`);
    activeOrders.forEach(row => {
      console.log(`   - ID: ${row.ID}, Patient: ${row.dcmPatientName}, Q11_Val_1: ${row.Q11_Val_1}, Cost: $${row.Cost}`);
    });
    console.log('');

    // 5. Default (no special status)
    console.log('5️⃣  DEFAULT (Alternating White/Light Grey):');
    const [defaultOrders] = await connection.execute(`
      SELECT 
        sg.ID,
        sg.isRush,
        sg.Q11_Val_1,
        sg.Q11_Val_2,
        sg.Q11_Val_4,
        o.dcmPatientName,
        sg.Cost
      FROM Orders o
      INNER JOIN OrderSG sg ON o.SGID = sg.ID
      WHERE (sg.isRush IS NULL OR sg.isRush = 0)
        AND (sg.Q11_Val_1 IS NULL OR sg.Q11_Val_1 = 0)
        AND (sg.Q11_Val_2 IS NULL OR sg.Q11_Val_2 = 0)
        AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0)
        AND sg.Cost > 0
        AND o.SurgeryDate >= '2014-01-01' 
        AND o.SurgeryDate <= '2020-12-31'
      LIMIT 5
    `);
    console.log(`   Found: ${defaultOrders.length} records`);
    defaultOrders.forEach(row => {
      console.log(`   - ID: ${row.ID}, Patient: ${row.dcmPatientName}, Cost: $${row.Cost}`);
    });
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Rush Orders: ${rushOrders.length > 0 ? '✅ Found' : '❌ None found'}`);
    console.log(`   On Hold: ${onHoldOrders.length > 0 ? '✅ Found' : '❌ None found'}`);
    console.log(`   Confirmed by OEM: ${confirmedOrders.length > 0 ? '✅ Found' : '❌ None found'}`);
    console.log(`   Active: ${activeOrders.length > 0 ? '✅ Found' : '❌ None found'}`);
    console.log(`   Default: ${defaultOrders.length > 0 ? '✅ Found' : '❌ None found'}`);
    console.log('');

    // Get specific IDs for testing
    console.log('🎯 TEST CASE IDs (use these to verify colors in the UI):');
    if (rushOrders.length > 0) {
      console.log(`   Rush Order ID: ${rushOrders[0].ID} (should be BLUE)`);
    }
    if (onHoldOrders.length > 0) {
      console.log(`   On Hold ID: ${onHoldOrders[0].ID} (should be LIGHT RED)`);
    }
    if (confirmedOrders.length > 0) {
      console.log(`   Confirmed ID: ${confirmedOrders[0].ID} (should be GREY)`);
    }
    if (activeOrders.length > 0) {
      console.log(`   Active ID: ${activeOrders[0].ID} (should be GREEN)`);
    }
    if (defaultOrders.length > 0) {
      console.log(`   Default ID: ${defaultOrders[0].ID} (should be WHITE/GREY alternating)`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testRowColors();
