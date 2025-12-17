/**
 * Mock User Data for Testing Authorization
 * 
 * This file contains predefined user profiles for testing different access levels
 * and authorization scenarios without requiring real Google accounts.
 * 
 * Usage:
 * - E2E tests (Playwright)
 * - Integration tests (Supertest)
 * - Unit tests (Jest)
 */

/**
 * Admin User - Full access to all dashboard sections
 */
export const mockAdminUser = {
  id: "mock-admin-001",
  email: "test.admin@3ddx.com",
  primaryEmail: "test.admin@3ddx.com",
  fullName: "Test Admin User",
  givenName: "Test",
  familyName: "Admin",
  
  // Organization details
  orgUnit: "/Admin",
  department: "IT Administration",
  
  // Security & Status
  isEnrolledIn2Sv: true,
  suspended: false,
  isAdmin: true,
  lastLoginTime: new Date().toISOString(),
  
  // Employee Information
  employeeId: "EMP-ADMIN-001",
  jobTitle: "System Administrator",
  type: "Full-time",
  managerEmail: "ceo@3ddx.com",
  costCenter: "IT-001",
  buildingId: "HQ-BLDG-01",
  floorName: "5th Floor",
  floorSection: "IT Department",
  
  // Contact Information
  phones: [
    { type: "work", value: "+1-555-0101", primary: true },
    { type: "mobile", value: "+1-555-0102", primary: false }
  ],
  secondaryEmails: [
    { type: "work", address: "admin.backup@3ddx.com" }
  ],
  addresses: [
    {
      type: "work",
      primary: true,
      formatted: "123 Tech Street, San Francisco, CA 94105, USA",
      streetAddress: "123 Tech Street",
      locality: "San Francisco",
      region: "CA",
      postalCode: "94105",
      country: "USA"
    }
  ],
  
  // Groups - Full access
  groups: ["admin", "SWD", "developers"],
  groupRoles: [
    {
      groupName: "Administrators",
      groupEmail: "admin@3ddx.com",
      userRole: "OWNER"
    },
    {
      groupName: "Software Development",
      groupEmail: "swd@3ddx.com",
      userRole: "MANAGER"
    },
    {
      groupName: "Developers",
      groupEmail: "developers@3ddx.com",
      userRole: "MEMBER"
    }
  ],
  
  // Custom schemas
  customSchemas: {
    employeeInfo: {
      division: "Technology",
      location: "San Francisco HQ"
    }
  }
};

/**
 * SWD Member - Access to restricted dashboard sections
 */
export const mockSwdUser = {
  id: "mock-swd-001",
  email: "test.developer@3ddx.com",
  primaryEmail: "test.developer@3ddx.com",
  fullName: "Test Developer User",
  givenName: "Test",
  familyName: "Developer",
  
  orgUnit: "/Engineering",
  department: "Software Development",
  
  isEnrolledIn2Sv: true,
  suspended: false,
  isAdmin: false,
  lastLoginTime: new Date().toISOString(),
  
  employeeId: "EMP-DEV-001",
  jobTitle: "Senior Software Engineer",
  type: "Full-time",
  managerEmail: "engineering.lead@3ddx.com",
  costCenter: "ENG-002",
  buildingId: "HQ-BLDG-01",
  floorName: "3rd Floor",
  floorSection: "Engineering",
  
  phones: [
    { type: "work", value: "+1-555-0201", primary: true }
  ],
  secondaryEmails: [],
  addresses: [
    {
      type: "work",
      primary: true,
      formatted: "123 Tech Street, San Francisco, CA 94105, USA"
    }
  ],
  
  // Groups - SWD access
  groups: ["SWD", "developers"],
  groupRoles: [
    {
      groupName: "Software Development",
      groupEmail: "swd@3ddx.com",
      userRole: "MEMBER"
    },
    {
      groupName: "Developers",
      groupEmail: "developers@3ddx.com",
      userRole: "MEMBER"
    }
  ],
  
  customSchemas: {
    employeeInfo: {
      division: "Engineering",
      location: "San Francisco HQ"
    }
  }
};

/**
 * Regular User - Limited access (basic info only)
 */
export const mockRegularUser = {
  id: "mock-user-001",
  email: "test.user@3ddx.com",
  primaryEmail: "test.user@3ddx.com",
  fullName: "Test Regular User",
  givenName: "Test",
  familyName: "User",
  
  orgUnit: "/Sales",
  department: "Sales & Marketing",
  
  isEnrolledIn2Sv: false,
  suspended: false,
  isAdmin: false,
  lastLoginTime: new Date().toISOString(),
  
  employeeId: "EMP-SALES-001",
  jobTitle: "Sales Representative",
  type: "Full-time",
  managerEmail: "sales.manager@3ddx.com",
  costCenter: "SALES-001",
  buildingId: "HQ-BLDG-01",
  floorName: "2nd Floor",
  floorSection: "Sales",
  
  phones: [
    { type: "work", value: "+1-555-0301", primary: true }
  ],
  secondaryEmails: [],
  addresses: [],
  
  // Groups - No special access
  groups: ["users", "sales"],
  groupRoles: [
    {
      groupName: "All Users",
      groupEmail: "users@3ddx.com",
      userRole: "MEMBER"
    },
    {
      groupName: "Sales Team",
      groupEmail: "sales@3ddx.com",
      userRole: "MEMBER"
    }
  ],
  
  customSchemas: {
    employeeInfo: {
      division: "Sales",
      location: "San Francisco HQ"
    }
  }
};

/**
 * Suspended User - Testing suspended account handling
 */
export const mockSuspendedUser = {
  id: "mock-suspended-001",
  email: "test.suspended@3ddx.com",
  primaryEmail: "test.suspended@3ddx.com",
  fullName: "Test Suspended User",
  givenName: "Test",
  familyName: "Suspended",
  
  orgUnit: "/",
  department: "N/A",
  
  isEnrolledIn2Sv: false,
  suspended: true, // Account is suspended
  isAdmin: false,
  lastLoginTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
  
  employeeId: "EMP-SUSP-001",
  jobTitle: "Former Employee",
  type: "Full-time",
  managerEmail: "",
  
  phones: [],
  secondaryEmails: [],
  addresses: [],
  
  groups: [],
  groupRoles: [],
  
  customSchemas: {}
};

/**
 * Finance Team Member - Testing specific department access
 */
export const mockFinanceUser = {
  id: "mock-finance-001",
  email: "test.finance@3ddx.com",
  primaryEmail: "test.finance@3ddx.com",
  fullName: "Test Finance User",
  givenName: "Test",
  familyName: "Finance",
  
  orgUnit: "/Finance",
  department: "Finance & Accounting",
  
  isEnrolledIn2Sv: true,
  suspended: false,
  isAdmin: false,
  lastLoginTime: new Date().toISOString(),
  
  employeeId: "EMP-FIN-001",
  jobTitle: "Financial Analyst",
  type: "Full-time",
  managerEmail: "cfo@3ddx.com",
  costCenter: "FIN-001",
  buildingId: "HQ-BLDG-01",
  floorName: "4th Floor",
  floorSection: "Finance",
  
  phones: [
    { type: "work", value: "+1-555-0401", primary: true }
  ],
  secondaryEmails: [],
  addresses: [],
  
  groups: ["finance", "users"],
  groupRoles: [
    {
      groupName: "Finance Team",
      groupEmail: "finance@3ddx.com",
      userRole: "MEMBER"
    }
  ],
  
  customSchemas: {
    employeeInfo: {
      division: "Finance",
      location: "San Francisco HQ"
    }
  }
};

/**
 * Contractor - Testing non-employee access
 */
export const mockContractorUser = {
  id: "mock-contractor-001",
  email: "test.contractor@3ddx.com",
  primaryEmail: "test.contractor@3ddx.com",
  fullName: "Test Contractor User",
  givenName: "Test",
  familyName: "Contractor",
  
  orgUnit: "/Contractors",
  department: "External",
  
  isEnrolledIn2Sv: false,
  suspended: false,
  isAdmin: false,
  lastLoginTime: new Date().toISOString(),
  
  employeeId: "CTR-001",
  jobTitle: "Contract Developer",
  type: "Contractor",
  managerEmail: "project.manager@3ddx.com",
  
  phones: [
    { type: "mobile", value: "+1-555-0501", primary: true }
  ],
  secondaryEmails: [
    { type: "personal", address: "contractor.personal@email.com" }
  ],
  addresses: [],
  
  groups: ["contractors", "users"],
  groupRoles: [
    {
      groupName: "Contractors",
      groupEmail: "contractors@3ddx.com",
      userRole: "MEMBER"
    }
  ],
  
  customSchemas: {
    contractorInfo: {
      contractEndDate: "2025-12-31",
      vendor: "TechStaff Inc."
    }
  }
};

/**
 * User Rights/Permissions Mock Data
 */
export const mockUserRights = {
  admin: {
    userEmail: "test.admin@3ddx.com",
    groups: ["admin", "SWD", "developers"],
    roles: ["system-admin", "user-manager"],
    rights: [
      {
        resource: "users",
        actions: ["read", "create", "update", "delete", "manage"]
      },
      {
        resource: "groups",
        actions: ["read", "create", "update", "delete", "manage"]
      },
      {
        resource: "reports",
        actions: ["read", "create", "export", "delete"]
      },
      {
        resource: "settings",
        actions: ["read", "update", "manage"]
      }
    ]
  },
  
  swd: {
    userEmail: "test.developer@3ddx.com",
    groups: ["SWD", "developers"],
    roles: ["developer"],
    rights: [
      {
        resource: "code-repositories",
        actions: ["read", "create", "update"]
      },
      {
        resource: "api-documentation",
        actions: ["read"]
      },
      {
        resource: "deployment",
        actions: ["read", "create"]
      }
    ]
  },
  
  regular: {
    userEmail: "test.user@3ddx.com",
    groups: ["users", "sales"],
    roles: ["user"],
    rights: [
      {
        resource: "profile",
        actions: ["read", "update"]
      },
      {
        resource: "sales-leads",
        actions: ["read", "create", "update"]
      }
    ]
  },
  
  finance: {
    userEmail: "test.finance@3ddx.com",
    groups: ["finance", "users"],
    roles: ["finance-user"],
    rights: [
      {
        resource: "financial-reports",
        actions: ["read", "create", "export"]
      },
      {
        resource: "budgets",
        actions: ["read", "update"]
      },
      {
        resource: "invoices",
        actions: ["read", "create", "approve"]
      }
    ]
  },
  
  contractor: {
    userEmail: "test.contractor@3ddx.com",
    groups: ["contractors", "users"],
    roles: ["contractor"],
    rights: [
      {
        resource: "project-tasks",
        actions: ["read", "update"]
      },
      {
        resource: "timesheets",
        actions: ["read", "create", "update"]
      }
    ]
  }
};

/**
 * Get mock user object by user type for testing
 * 
 * Returns predefined mock user objects with realistic Google Workspace user data
 * for different user roles and scenarios. Used in tests to simulate various
 * user permissions and access levels.
 * 
 * @param {('admin'|'swd'|'regular'|'suspended'|'finance'|'contractor')} userType - User role type
 * @returns {Object} Complete mock user object with Google Workspace user properties
 * @returns {string} returns.id - User ID
 * @returns {string} returns.email - Primary email
 * @returns {string} returns.fullName - Full display name
 * @returns {string[]} returns.groups - User's group memberships
 * @returns {boolean} returns.isAdmin - Admin status
 * @returns {boolean} returns.suspended - Account suspension status
 * 
 * @example
 * // Get admin user for testing
 * const admin = getMockUser('admin');
 * // Returns: { id: 'mock-admin-001', groups: ['admin', 'SWD', 'developers'], ... }
 * 
 * @example
 * // Get regular user with limited permissions
 * const user = getMockUser('regular');
 * // Returns: { id: 'mock-user-001', groups: ['users', 'sales'], ... }
 * 
 * @example
 * // Invalid type defaults to regular user
 * const user = getMockUser('invalid');
 * // Returns: mockRegularUser
 */
export function getMockUser(userType) {
  const users = {
    admin: mockAdminUser,
    swd: mockSwdUser,
    regular: mockRegularUser,
    suspended: mockSuspendedUser,
    finance: mockFinanceUser,
    contractor: mockContractorUser
  };
  
  return users[userType] || mockRegularUser;
}

/**
 * Get mock user rights/permissions by user type for testing
 * 
 * Returns predefined permission sets for different user roles, including
 * groups, roles, and resource-level action permissions. Used to test
 * authorization logic and access control.
 * 
 * @param {('admin'|'swd'|'regular'|'finance'|'contractor')} userType - User role type
 * @returns {Object} Mock user rights object
 * @returns {string} returns.userEmail - User's email address
 * @returns {string[]} returns.groups - User's group memberships
 * @returns {string[]} returns.roles - User's role assignments
 * @returns {Array<Object>} returns.rights - Resource-level permissions
 * 
 * @example
 * // Get admin rights
 * const rights = getMockUserRights('admin');
 * // Returns: {
 * //   userEmail: 'test.admin@3ddx.com',
 * //   groups: ['admin', 'SWD', 'developers'],
 * //   roles: ['system-admin', 'user-manager'],
 * //   rights: [{ resource: 'users', actions: ['read', 'create', ...] }]
 * // }
 * 
 * @example
 * // Invalid type defaults to regular user rights
 * const rights = getMockUserRights('invalid');
 * // Returns: mockUserRights.regular
 */
export function getMockUserRights(userType) {
  return mockUserRights[userType] || mockUserRights.regular;
}

/**
 * Generate complete mock session with user data and authentication tokens
 * 
 * Creates a full mock session object combining user details, rights/permissions,
 * and authentication tokens. Perfect for simulating authenticated requests in tests
 * without actually going through OAuth flow.
 * 
 * @param {('admin'|'swd'|'regular'|'suspended'|'finance'|'contractor')} [userType='regular'] - User role type
 * @returns {Object} Complete mock session object
 * @returns {Object} returns.user - User details from getMockUser()
 * @returns {Object} returns.rights - User permissions from getMockUserRights()
 * @returns {string} returns.accessToken - Mock OAuth access token
 * @returns {string} returns.refreshToken - Mock OAuth refresh token
 * @returns {number} returns.expiresAt - Token expiration timestamp (1 hour from now)
 * @returns {string} returns.sessionId - Unique session identifier
 * 
 * @example
 * // Generate admin session for testing protected routes
 * const session = generateMockSession('admin');
 * req.session = session;
 * // Session includes: user object, rights, tokens, expiration
 * 
 * @example
 * // Default to regular user
 * const session = generateMockSession();
 * // Returns session for regular user with limited permissions
 * 
 * @example
 * // Use in Express test
 * const session = generateMockSession('finance');
 * const req = { session, user: session.user };
 * const canAccess = checkPermission(req, 'financial-reports', 'read');
 */
export function generateMockSession(userType = 'regular') {
  const user = getMockUser(userType);
  const rights = getMockUserRights(userType);
  
  return {
    user,
    rights,
    accessToken: `mock-token-${userType}-${Date.now()}`,
    refreshToken: `mock-refresh-${userType}-${Date.now()}`,
    expiresAt: Date.now() + 3600000, // 1 hour from now
    sessionId: `mock-session-${userType}-${Date.now()}`
  };
}

// Export all mock users
export default {
  mockAdminUser,
  mockSwdUser,
  mockRegularUser,
  mockSuspendedUser,
  mockFinanceUser,
  mockContractorUser,
  mockUserRights,
  getMockUser,
  getMockUserRights,
  generateMockSession
};
