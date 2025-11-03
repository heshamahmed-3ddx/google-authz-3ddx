/**
 * Mock Google API Service for Testing
 * 
 * This module provides mock implementations of Google API calls
 * for testing authorization and user data without hitting real APIs.
 */

import {
  mockAdminUser,
  mockSwdUser,
  mockRegularUser,
  mockSuspendedUser,
  mockFinanceUser,
  mockContractorUser,
  mockUserRights
} from './mockUsers.js';

/**
 * Mock Google OAuth2 Service
 */
export class MockGoogleOAuth2 {
  constructor() {
    this.users = new Map([
      ['test.admin@3ddx.com', mockAdminUser],
      ['test.developer@3ddx.com', mockSwdUser],
      ['test.user@3ddx.com', mockRegularUser],
      ['test.suspended@3ddx.com', mockSuspendedUser],
      ['test.finance@3ddx.com', mockFinanceUser],
      ['test.contractor@3ddx.com', mockContractorUser]
    ]);
    
    this.tokens = new Map();
  }

  /**
   * Mock OAuth2 token generation
   * @param {string} code - Authorization code
   * @returns {object} Mock token response
   */
  async getToken(code) {
    // Extract user type from code
    const userType = code.split('-')[1] || 'regular';
    const email = `test.${userType}@3ddx.com`;
    
    const token = {
      access_token: `mock-access-token-${userType}-${Date.now()}`,
      refresh_token: `mock-refresh-token-${userType}-${Date.now()}`,
      scope: 'https://www.googleapis.com/auth/admin.directory.user.readonly',
      token_type: 'Bearer',
      expiry_date: Date.now() + 3600000
    };
    
    this.tokens.set(token.access_token, email);
    
    return { tokens: token };
  }

  /**
   * Mock token verification
   * @param {string} accessToken - Access token to verify
   * @returns {object} User email info
   */
  async verifyIdToken(accessToken) {
    const email = this.tokens.get(accessToken);
    
    if (!email) {
      throw new Error('Invalid token');
    }
    
    return {
      getPayload: () => ({
        email,
        email_verified: true,
        sub: `google-id-${email}`
      })
    };
  }

  /**
   * Set OAuth2 credentials
   * @param {object} credentials - OAuth2 credentials
   */
  setCredentials(credentials) {
    if (credentials.access_token) {
      // Store for later verification
      this.currentToken = credentials.access_token;
    }
  }
}

/**
 * Mock Google Admin SDK Service
 */
export class MockGoogleAdminSDK {
  constructor() {
    this.users = new Map([
      ['test.admin@3ddx.com', mockAdminUser],
      ['test.developer@3ddx.com', mockSwdUser],
      ['test.user@3ddx.com', mockRegularUser],
      ['test.suspended@3ddx.com', mockSuspendedUser],
      ['test.finance@3ddx.com', mockFinanceUser],
      ['test.contractor@3ddx.com', mockContractorUser]
    ]);
  }

  /**
   * Mock get user by email
   * @param {string} userEmail - User email address
   * @returns {object} User data
   */
  async getUser(userEmail) {
    const user = this.users.get(userEmail);
    
    if (!user) {
      const error = new Error('User not found');
      error.code = 404;
      throw error;
    }
    
    if (user.suspended) {
      const error = new Error('User is suspended');
      error.code = 403;
      throw error;
    }
    
    return { data: user };
  }

  /**
   * Mock list user groups
   * @param {string} userEmail - User email address
   * @returns {object} Groups data
   */
  async listUserGroups(userEmail) {
    const user = this.users.get(userEmail);
    
    if (!user) {
      return { data: { groups: [] } };
    }
    
    const groups = user.groupRoles?.map(gr => ({
      email: gr.groupEmail,
      name: gr.groupName,
      role: gr.userRole
    })) || [];
    
    return { data: { groups } };
  }

  /**
   * Mock list all users (admin function)
   * @param {object} options - Query options
   * @returns {object} List of users
   */
  async listUsers(options = {}) {
    const allUsers = Array.from(this.users.values());
    
    let filteredUsers = allUsers;
    
    // Filter by suspended status
    if (options.suspended !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.suspended === options.suspended);
    }
    
    // Filter by orgUnit
    if (options.orgUnit) {
      filteredUsers = filteredUsers.filter(u => u.orgUnit?.startsWith(options.orgUnit));
    }
    
    return {
      data: {
        users: filteredUsers,
        nextPageToken: null
      }
    };
  }

  /**
   * Mock update user
   * @param {string} userEmail - User email
   * @param {object} updates - User updates
   * @returns {object} Updated user
   */
  async updateUser(userEmail, updates) {
    const user = this.users.get(userEmail);
    
    if (!user) {
      const error = new Error('User not found');
      error.code = 404;
      throw error;
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(userEmail, updatedUser);
    
    return { data: updatedUser };
  }
}

/**
 * Mock Casbin Enforcer for Authorization
 */
export class MockCasbinEnforcer {
  constructor() {
    this.policies = this._initializePolicies();
  }

  /**
   * Initialize mock policies based on user rights
   */
  _initializePolicies() {
    const policies = [];
    
    // Add policies for each user type
    Object.entries(mockUserRights).forEach(([userType, rights]) => {
      rights.rights.forEach(right => {
        right.actions.forEach(action => {
          policies.push([rights.userEmail, right.resource, action]);
        });
      });
    });
    
    return policies;
  }

  /**
   * Mock enforce authorization check
   * @param {string} subject - User email
   * @param {string} object - Resource
   * @param {string} action - Action
   * @returns {boolean} Whether action is allowed
   */
  async enforce(subject, object, action) {
    const allowed = this.policies.some(policy => 
      policy[0] === subject &&
      policy[1] === object &&
      policy[2] === action
    );
    
    return allowed;
  }

  /**
   * Mock get filtered policy
   * @param {number} pType - Policy type
   * @param {string} subject - User email
   * @returns {Array} Matching policies
   */
  async getFilteredPolicy(pType, subject) {
    return this.policies.filter(policy => policy[0] === subject);
  }

  /**
   * Mock add policy
   * @param {Array} policy - Policy to add
   * @returns {boolean} Success
   */
  async addPolicy(...policy) {
    this.policies.push(policy);
    return true;
  }

  /**
   * Mock remove policy
   * @param {Array} policy - Policy to remove
   * @returns {boolean} Success
   */
  async removePolicy(...policy) {
    const index = this.policies.findIndex(p => 
      JSON.stringify(p) === JSON.stringify(policy)
    );
    
    if (index > -1) {
      this.policies.splice(index, 1);
      return true;
    }
    
    return false;
  }
}

/**
 * Create mock Google services
 * @returns {object} Mock services
 */
export function createMockGoogleServices() {
  return {
    oauth2: new MockGoogleOAuth2(),
    adminSDK: new MockGoogleAdminSDK(),
    casbin: new MockCasbinEnforcer()
  };
}

/**
 * Mock Express session for testing
 * @param {string} userType - Type of user (admin, swd, regular, etc.)
 * @returns {object} Mock session object
 */
export function createMockSession(userType = 'regular') {
  const users = {
    admin: mockAdminUser,
    swd: mockSwdUser,
    regular: mockRegularUser,
    suspended: mockSuspendedUser,
    finance: mockFinanceUser,
    contractor: mockContractorUser
  };
  
  const user = users[userType] || mockRegularUser;
  
  return {
    user: {
      email: user.email,
      id: user.id,
      name: user.fullName
    },
    oauth2Tokens: {
      access_token: `mock-token-${userType}`,
      refresh_token: `mock-refresh-${userType}`,
      expiry_date: Date.now() + 3600000
    },
    save: function(callback) {
      if (callback) callback();
      return Promise.resolve();
    },
    destroy: function(callback) {
      if (callback) callback();
      return Promise.resolve();
    }
  };
}

/**
 * Mock Express request object
 * @param {string} userType - Type of user
 * @param {object} overrides - Custom request properties
 * @returns {object} Mock request object
 */
export function createMockRequest(userType = 'regular', overrides = {}) {
  return {
    session: createMockSession(userType),
    headers: {
      'user-agent': 'Mozilla/5.0 (Test)',
      ...overrides.headers
    },
    query: overrides.query || {},
    body: overrides.body || {},
    params: overrides.params || {},
    method: overrides.method || 'GET',
    url: overrides.url || '/api/test',
    ...overrides
  };
}

/**
 * Mock Express response object
 * @returns {object} Mock response object
 */
export function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    
    json: function(data) {
      this.body = data;
      return this;
    },
    
    send: function(data) {
      this.body = data;
      return this;
    },
    
    setHeader: function(key, value) {
      this.headers[key] = value;
      return this;
    },
    
    redirect: function(url) {
      this.statusCode = 302;
      this.headers.Location = url;
      return this;
    }
  };
  
  return res;
}

export default {
  MockGoogleOAuth2,
  MockGoogleAdminSDK,
  MockCasbinEnforcer,
  createMockGoogleServices,
  createMockSession,
  createMockRequest,
  createMockResponse
};
