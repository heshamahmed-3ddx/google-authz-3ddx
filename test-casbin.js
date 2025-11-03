#!/usr/bin/env node

/**
 * Quick test script to verify Casbin configuration
 * Run this to test if the permissions are working
 */

const fs = require('fs');
const path = require('path');

async function testCasbinConfig() {
  console.log('🔍 Testing Casbin Configuration...\n');
  
  const userEmail = 'hesham.ahmed@3ddx.com';
  
  // Test 1: Check policy.csv
  const policyPath = path.join(__dirname, 'server/src/config/casbin/policy.csv');
  const policyContent = fs.readFileSync(policyPath, 'utf8');
  
  console.log('📋 Policy.csv Analysis:');
  const userAssignments = policyContent.split('\n')
    .filter(line => line.includes(userEmail) && line.startsWith('g,'))
    .map(line => line.trim());
  
  console.log(`   User: ${userEmail}`);
  console.log(`   Group Assignments: ${userAssignments.length}`);
  userAssignments.forEach(assignment => {
    console.log(`   - ${assignment}`);
  });
  
  // Test 2: Check users.json
  const usersPath = path.join(__dirname, 'server/src/config/casbin/users.json');
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  
  console.log('\n👥 Users.json Analysis:');
  const user = usersData.users.find(u => u.email === userEmail);
  
  if (user) {
    console.log(`   User Found: ✅`);
    console.log(`   Groups: ${user.groups.join(', ')}`);
    console.log(`   Roles: ${user.roles.join(', ')}`);
  } else {
    console.log(`   User Found: ❌`);
  }
  
  // Test 3: Check available permissions
  console.log('\n🔐 Available Permissions:');
  const permissions = policyContent.split('\n')
    .filter(line => line.startsWith('p,'))
    .map(line => {
      const parts = line.split(',').map(p => p.trim());
      return { subject: parts[1], resource: parts[2], action: parts[3] };
    });
  
  // Get user's groups
  const userGroups = userAssignments.map(assignment => {
    const parts = assignment.split(',').map(p => p.trim());
    return parts[2]; // third part is the group
  });
  
  console.log(`   User's Groups: ${userGroups.join(', ')}`);
  
  // Find permissions for user's groups
  const userPermissions = permissions.filter(perm => 
    userGroups.includes(perm.subject)
  );
  
  console.log(`   Total Permissions: ${userPermissions.length}`);
  userPermissions.forEach(perm => {
    console.log(`   - ${perm.subject} can ${perm.action} ${perm.resource}`);
  });
  
  // Test 4: Resources summary
  const resources = [...new Set(userPermissions.map(p => p.resource))];
  console.log(`\n📊 Accessible Resources: ${resources.length}`);
  resources.forEach(resource => {
    const actions = userPermissions
      .filter(p => p.resource === resource)
      .map(p => p.action);
    console.log(`   - ${resource}: ${actions.join(', ')}`);
  });
  
  if (resources.length === 0) {
    console.log('\n❌ PROBLEM: No resources found!');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if the server is running');
    console.log('2. Restart the server: cd server && npm run dev');
    console.log('3. Clear browser cache and login again');
    console.log('4. Check server logs for Casbin errors');
  } else {
    console.log('\n✅ SUCCESS: Permissions are configured correctly!');
    console.log('\n🔄 Next Steps:');
    console.log('1. Restart your server: cd server && npm run dev');
    console.log('2. Logout and login again in the browser');
    console.log('3. Check the User Rights & Permissions section');
  }
}

testCasbinConfig().catch(console.error);