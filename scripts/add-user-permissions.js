#!/usr/bin/env node

/**
 * Script to add user permissions for testing the Rights & Permissions feature
 * Run this script to add your current user email to the Casbin system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addUserPermissions(userEmail) {
  if (!userEmail) {
    console.error('Please provide your email address:');
    console.log('node scripts/add-user-permissions.js your-email@domain.com');
    process.exit(1);
  }

  const policyPath = path.join(__dirname, 'server/src/config/casbin/policy.csv');
  const usersPath = path.join(__dirname, 'server/src/config/casbin/users.json');

  try {
    // Read current policy file
    let policyContent = fs.readFileSync(policyPath, 'utf8');
    
    // Add user to multiple roles for testing
    const newAssignments = [
      `g, ${userEmail}, admin`,
      `g, ${userEmail}, engineering`, 
      `g, ${userEmail}, finance`,
      `g, ${userEmail}, developer`,
      `g, ${userEmail}, platform-engineer`
    ];

    // Check if user already exists
    if (!policyContent.includes(userEmail)) {
      policyContent += '\n# Added for testing permissions\n';
      policyContent += newAssignments.join('\n') + '\n';
      
      fs.writeFileSync(policyPath, policyContent);
      console.log(`✅ Added ${userEmail} to policy.csv with multiple roles`);
    } else {
      console.log(`ℹ️  User ${userEmail} already exists in policy.csv`);
    }

    // Read and update users.json
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    // Check if user exists in users.json
    const existingUser = usersData.users.find(u => u.email === userEmail);
    
    if (!existingUser) {
      const newUser = {
        email: userEmail,
        fullName: "Test User (Added by Script)",
        groups: ["admin", "engineering", "finance"],
        orgUnit: "IT/Testing",
        roles: ["admin", "developer", "platform-engineer"],
        twoStepEnabled: false,
        department: "Testing"
      };
      
      usersData.users.push(newUser);
      fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
      console.log(`✅ Added ${userEmail} to users.json`);
    } else {
      // Update existing user with more permissions
      existingUser.groups = [...new Set([...existingUser.groups, "admin", "engineering", "finance"])];
      existingUser.roles = [...new Set([...existingUser.roles, "admin", "developer", "platform-engineer"])];
      
      fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
      console.log(`✅ Updated ${userEmail} permissions in users.json`);
    }

    console.log('\n🎉 User permissions added successfully!');
    console.log('\n📋 Your user now has access to these resources:');
    console.log('• Invoices (read, create, approve, delete)');
    console.log('• Projects (read, create, update, delete)');
    console.log('• Reports (read, create)');
    console.log('• Budgets (read, update)');
    console.log('• Customers (read, create, update, delete)');
    console.log('• Users (read, manage)');
    console.log('• Systems (read, update)');
    console.log('• Monitoring (read)');
    console.log('• Logs (read)');
    console.log('• Dashboard (read)');
    console.log('• Profile (read, update)');
    
    console.log('\n🔄 Please restart your server to apply changes:');
    console.log('cd server && npm run dev');
    
  } catch (error) {
    console.error('❌ Error updating permissions:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const userEmail = process.argv[2];
addUserPermissions(userEmail);