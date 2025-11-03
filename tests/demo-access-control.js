#!/usr/bin/env node
/**
 * Demo Script: Test Access Control with Mock Users
 * 
 * This script demonstrates the mock user testing infrastructure
 * by simulating different user scenarios and showing their access levels.
 */

import {
  getMockUser,
  getMockUserRights,
  generateMockSession
} from './fixtures/mockUsers.js';

import {
  MockCasbinEnforcer
} from './fixtures/mockGoogleAPI.js';

import { DASHBOARD_ACCESS_CONFIG } from '../client/src/config/dashboardAccess.js';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function fail(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function section(title) {
  console.log(`\n${colors.bold}${colors.cyan}═══ ${title} ═══${colors.reset}\n`);
}

function subsection(title) {
  console.log(`\n${colors.bold}${colors.blue}▸ ${title}${colors.reset}`);
}

/**
 * Check dashboard section access for a user
 */
function checkDashboardAccess(userType, groups) {
  const hasAccess = (section) => {
    const allowedGroups = DASHBOARD_ACCESS_CONFIG[section];
    if (!allowedGroups) return false;
    if (allowedGroups.includes('*')) return true;
    return groups.some(g => allowedGroups.includes(g));
  };

  return {
    userDetails: hasAccess('userDetails'),
    employeeInfo: hasAccess('employeeInfo'),
    contactInfo: hasAccess('contactInfo'),
    groups: hasAccess('groups'),
    userRights: hasAccess('userRights'),
    technicalInfo: hasAccess('technicalInfo'),
    apiDocumentation: hasAccess('apiDocumentation')
  };
}

/**
 * Test a specific user scenario
 */
async function testUserScenario(userType, testCases) {
  subsection(`Testing ${userType.toUpperCase()} User`);
  
  const user = getMockUser(userType);
  const rights = getMockUserRights(userType);
  const enforcer = new MockCasbinEnforcer();
  
  console.log(`Email: ${colors.yellow}${user.email}${colors.reset}`);
  console.log(`Groups: ${colors.yellow}${rights.groups.join(', ')}${colors.reset}`);
  
  // Test dashboard access
  console.log(`\n${colors.bold}Dashboard Access:${colors.reset}`);
  const access = checkDashboardAccess(userType, rights.groups);
  
  Object.entries(access).forEach(([section, hasAccess]) => {
    const icon = hasAccess ? '✓' : '✗';
    const color = hasAccess ? 'green' : 'red';
    const sectionName = section.replace(/([A-Z])/g, ' $1').trim();
    console.log(`  ${colors[color]}${icon}${colors.reset} ${sectionName}`);
  });
  
  // Test authorization
  console.log(`\n${colors.bold}Authorization Tests:${colors.reset}`);
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const { resource, action, expected, description } = testCase;
    const allowed = await enforcer.enforce(rights.userEmail, resource, action);
    
    if (allowed === expected) {
      success(description);
      passed++;
    } else {
      fail(description);
      failed++;
    }
  }
  
  console.log(`\n${colors.bold}Results:${colors.reset} ${passed} passed, ${failed} failed`);
}

/**
 * Main test execution
 */
async function main() {
  log(`
╔═══════════════════════════════════════════════════════════════╗
║         Mock User Access Control Testing Demo                 ║
║                                                                ║
║  Testing authorization and dashboard access with mock users   ║
╚═══════════════════════════════════════════════════════════════╝
`, 'cyan');

  // Admin User Tests
  section('Admin User Tests');
  await testUserScenario('admin', [
    {
      resource: 'users',
      action: 'manage',
      expected: true,
      description: 'Admin can manage users'
    },
    {
      resource: 'groups',
      action: 'delete',
      expected: true,
      description: 'Admin can delete groups'
    },
    {
      resource: 'settings',
      action: 'update',
      expected: true,
      description: 'Admin can update settings'
    },
    {
      resource: 'reports',
      action: 'export',
      expected: true,
      description: 'Admin can export reports'
    }
  ]);

  // SWD User Tests
  section('SWD (Developer) User Tests');
  await testUserScenario('swd', [
    {
      resource: 'code-repositories',
      action: 'read',
      expected: true,
      description: 'SWD can read code repositories'
    },
    {
      resource: 'api-documentation',
      action: 'read',
      expected: true,
      description: 'SWD can read API documentation'
    },
    {
      resource: 'deployment',
      action: 'create',
      expected: true,
      description: 'SWD can create deployments'
    },
    {
      resource: 'users',
      action: 'manage',
      expected: false,
      description: 'SWD CANNOT manage users (admin only)'
    }
  ]);

  // Regular User Tests
  section('Regular User Tests');
  await testUserScenario('regular', [
    {
      resource: 'profile',
      action: 'read',
      expected: true,
      description: 'Regular user can read own profile'
    },
    {
      resource: 'profile',
      action: 'update',
      expected: true,
      description: 'Regular user can update own profile'
    },
    {
      resource: 'sales-leads',
      action: 'create',
      expected: true,
      description: 'Regular user can create sales leads'
    },
    {
      resource: 'users',
      action: 'manage',
      expected: false,
      description: 'Regular user CANNOT manage users'
    },
    {
      resource: 'api-documentation',
      action: 'read',
      expected: false,
      description: 'Regular user CANNOT read API docs'
    }
  ]);

  // Finance User Tests
  section('Finance User Tests');
  await testUserScenario('finance', [
    {
      resource: 'financial-reports',
      action: 'read',
      expected: true,
      description: 'Finance can read financial reports'
    },
    {
      resource: 'invoices',
      action: 'approve',
      expected: true,
      description: 'Finance can approve invoices'
    },
    {
      resource: 'budgets',
      action: 'update',
      expected: true,
      description: 'Finance can update budgets'
    },
    {
      resource: 'code-repositories',
      action: 'read',
      expected: false,
      description: 'Finance CANNOT access code repositories'
    }
  ]);

  // Contractor User Tests
  section('Contractor User Tests');
  await testUserScenario('contractor', [
    {
      resource: 'project-tasks',
      action: 'read',
      expected: true,
      description: 'Contractor can read project tasks'
    },
    {
      resource: 'timesheets',
      action: 'create',
      expected: true,
      description: 'Contractor can create timesheets'
    },
    {
      resource: 'users',
      action: 'read',
      expected: false,
      description: 'Contractor CANNOT read user list'
    },
    {
      resource: 'financial-reports',
      action: 'read',
      expected: false,
      description: 'Contractor CANNOT access financial reports'
    }
  ]);

  // Suspended User Tests
  section('Suspended User Tests');
  subsection('Testing SUSPENDED User');
  
  const suspendedUser = getMockUser('suspended');
  console.log(`Email: ${colors.yellow}${suspendedUser.email}${colors.reset}`);
  console.log(`Status: ${colors.red}SUSPENDED${colors.reset}`);
  console.log(`Groups: ${colors.yellow}(none)${colors.reset}`);
  
  const enforcer = new MockCasbinEnforcer();
  const canAccess = await enforcer.enforce(suspendedUser.email, 'profile', 'read');
  
  if (!canAccess) {
    success('Suspended user correctly denied access');
  } else {
    fail('Suspended user should not have access');
  }

  // Summary
  section('Test Summary');
  
  console.log(`${colors.bold}Dashboard Access Configuration:${colors.reset}`);
  console.log(`  • Public Sections: User Details, Employee Info, Contact Info, Groups`);
  console.log(`  • Restricted Sections: User Rights, Technical Info, API Docs`);
  console.log(`  • Required Groups for Restricted Access: ${colors.yellow}${Object.keys(DASHBOARD_ACCESS_CONFIG.userRights || {}).join(', ') || 'SWD, admin, developers'}${colors.reset}`);
  
  console.log(`\n${colors.bold}Mock Users Available:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Admin (test.admin@3ddx.com) - Full Access`);
  console.log(`  ${colors.green}✓${colors.reset} SWD (test.developer@3ddx.com) - Developer Access`);
  console.log(`  ${colors.yellow}○${colors.reset} Regular (test.user@3ddx.com) - Basic Access`);
  console.log(`  ${colors.yellow}○${colors.reset} Finance (test.finance@3ddx.com) - Finance Access`);
  console.log(`  ${colors.yellow}○${colors.reset} Contractor (test.contractor@3ddx.com) - Limited Access`);
  console.log(`  ${colors.red}✗${colors.reset} Suspended (test.suspended@3ddx.com) - No Access`);

  log(`
╔═══════════════════════════════════════════════════════════════╗
║                  All Tests Completed! ✓                        ║
╚═══════════════════════════════════════════════════════════════╝
`, 'green');
}

// Run the tests
main().catch(console.error);
