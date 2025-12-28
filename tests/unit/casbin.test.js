/**
 * @file casbin.test.js
 * @description Unit tests for Casbin authorization service
 * @author 3D Diagnostix Development Team
 */

import { jest } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Mock the logging service
jest.mock('../../server/src/services/logger.js', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  })),
  logAuthz: jest.fn()
}))



// Mock Casbin (ESM compatible)
const mockEnforcer = {
  enforce: jest.fn(),
  getPolicy: jest.fn(),
  addPolicy: jest.fn(),
  removePolicy: jest.fn(),
  loadPolicy: jest.fn(),
  getGroupingPolicy: jest.fn(),
  addGroupingPolicy: jest.fn(),
  removeGroupingPolicy: jest.fn(),
  getRolesForUser: jest.fn(),
  getUsersForRole: jest.fn(),
  getFilteredPolicy: jest.fn(),
  getAllSubjects: jest.fn(),
  getAllObjects: jest.fn(),
  getAllActions: jest.fn(),
  getAllRoles: jest.fn(),
  getPermissionsForUser: jest.fn()
};

jest.mock('casbin', () => ({
  newEnforcer: jest.fn(() => Promise.resolve(mockEnforcer))
}));

let casbinService;
beforeAll(async () => {
  const mod = await import('../../server/src/services/casbin.js');
  casbinService = mod.default;
});

describe('CasbinService', () => {
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Reset service state
    casbinService.enforcer = null
    casbinService.usersData = null
  })

  describe('initialize', () => {
    beforeEach(() => {
      // Mock file system
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
        users: [
          {
            email: 'john.doe@3ddiagnostix.com',
            fullName: 'John Doe',
            groups: ['Engineering'],
            roles: ['engineer'],
            orgUnit: 'Software Development',
            department: 'Engineering',
            twoStepEnabled: true
          },
          {
            email: 'jane.smith@3ddiagnostix.com',
            fullName: 'Jane Smith',
            groups: ['Finance'],
            roles: ['manager'],
            orgUnit: 'Financial Operations',
            department: 'Finance',
            twoStepEnabled: false
          }
        ]
      }))
      
      mockEnforcer.getPolicy.mockResolvedValue([
        ['john.doe@3ddiagnostix.com', 'patient_data', 'read'],
        ['john.doe@3ddiagnostix.com', 'patient_data', 'write'],
        ['john.doe@3ddiagnostix.com', 'imaging_systems', 'read'],
        ['p', 'Engineering', 'patient_data', 'read'],
        ['p', 'Engineering', 'patient_data', 'write'],
        ['p', 'Engineering', 'imaging_systems', 'read'],
        ['p', 'Finance', 'financial_reports', 'read']
      ])
      mockEnforcer.getGroupingPolicy.mockResolvedValue([
        ['g', 'Engineering', 'role:engineer'],
        ['g', 'Finance', 'role:manager']
      ])
    })

    afterEach(() => {
      fs.existsSync.mockRestore()
      fs.readFileSync.mockRestore()
    })

    test('should initialize successfully with valid files', async () => {
      const result = await casbinService.initialize()
      
      expect(result).toBe(true)
      expect(casbinService.enforcer).toBe(mockEnforcer)
      expect(casbinService.usersData).toBeDefined()
      expect(casbinService.usersData.users).toHaveLength(2)
    })

    test('should throw error when model file does not exist', async () => {
      fs.existsSync.mockImplementation((filePath) => {
        return !filePath.includes('model.conf')
      })

      await expect(casbinService.initialize()).rejects.toThrow('Casbin model file not found')
    })

    test('should throw error when policy file does not exist', async () => {
      fs.existsSync.mockImplementation((filePath) => {
        return !filePath.includes('policy.csv')
      })

      await expect(casbinService.initialize()).rejects.toThrow('Casbin policy file not found')
    })

    test('should throw error when users file does not exist', async () => {
      fs.existsSync.mockImplementation((filePath) => {
        return !filePath.includes('users.json')
      })

      await expect(casbinService.initialize()).rejects.toThrow('Users data file not found')
    })

    test('should throw error when users.json is invalid JSON', async () => {
      fs.readFileSync.mockReturnValue('invalid json')

      await expect(casbinService.initialize()).rejects.toThrow()
    })
  })

  describe('getUserInfo', () => {
    beforeEach(async () => {
      // Set up test data
      casbinService.usersData = {
        users: [
          {
            email: 'john.doe@3ddiagnostix.com',
            fullName: 'John Doe',
            groups: ['Engineering'],
            roles: ['engineer'],
            orgUnit: 'Software Development',
            department: 'Engineering',
            twoStepEnabled: true
          },
          {
            email: 'jane.smith@3ddiagnostix.com',
            fullName: 'Jane Smith',
            groups: ['Finance'],
            roles: ['manager'],
            orgUnit: 'Financial Operations',
            department: 'Finance',
            twoStepEnabled: false
          }
        ]
      }
    })

    test('should return user info for existing user', () => {
      const userInfo = casbinService.getUserInfo('john.doe@3ddiagnostix.com')
      
      expect(userInfo).toBeDefined()
      expect(userInfo.email).toBe('john.doe@3ddiagnostix.com')
      expect(userInfo.fullName).toBe('John Doe')
      expect(userInfo.groups).toEqual(['Engineering'])
      expect(userInfo.roles).toEqual(['engineer'])
      expect(userInfo.twoStepEnabled).toBe(true)
    })

    test('should return null for non-existing user', () => {
      const userInfo = casbinService.getUserInfo('nonexistent@example.com')
      
      expect(userInfo).toBeNull()
    })

    test('should return null when usersData is null', () => {
      casbinService.usersData = null
      
      const userInfo = casbinService.getUserInfo('john.doe@3ddiagnostix.com')
      
      expect(userInfo).toBeNull()
    })

    test('should return null when usersData.users is undefined', () => {
      casbinService.usersData = {}
      
      const userInfo = casbinService.getUserInfo('john.doe@3ddiagnostix.com')
      
      expect(userInfo).toBeNull()
    })
  })

  describe('authorize', () => {
    beforeEach(async () => {
      casbinService.enforcer = mockEnforcer
      casbinService.usersData = {
        users: [
          {
            email: 'john.doe@3ddiagnostix.com',
            fullName: 'John Doe',
            groups: ['Engineering'],
            roles: ['engineer']
          }
        ]
      }
    })

    test('should return successful authorization result', async () => {
      mockEnforcer.enforce.mockResolvedValue(true)
      mockEnforcer.getPolicy.mockResolvedValue([
        ['p', 'Engineering', 'patient_data', 'read']
      ])

      const result = await casbinService.authorize(
        'john.doe@3ddiagnostix.com',
        'patient_data',
        'read'
      )

      expect(result.allowed).toBe(true)
      expect(result.userEmail).toBe('john.doe@3ddiagnostix.com')
      expect(result.resource).toBe('patient_data')
      expect(result.action).toBe('read')
      expect(result.userGroups).toEqual(['Engineering'])
      expect(result.timestamp).toBeDefined()
      expect(typeof result.evaluationTime).toBe('number')
    })

    test('should return failed authorization result', async () => {
      mockEnforcer.enforce.mockResolvedValue(false)
      mockEnforcer.getPolicy.mockResolvedValue([])

      const result = await casbinService.authorize(
        'john.doe@3ddiagnostix.com',
        'financial_reports',
        'write'
      )

      expect(result.allowed).toBe(false)
      expect(result.userEmail).toBe('john.doe@3ddiagnostix.com')
      expect(result.resource).toBe('financial_reports')
      expect(result.action).toBe('write')
    })

    test('should handle user not found in system', async () => {
      mockEnforcer.enforce.mockResolvedValue(false)
      mockEnforcer.getPolicy.mockResolvedValue([])

      const result = await casbinService.authorize(
        'unknown@example.com',
        'patient_data',
        'read'
      )

      expect(result.allowed).toBe(false)
      expect(result.userGroups).toEqual([])
    })

    test('should throw error when enforcer not initialized', async () => {
      casbinService.enforcer = null

      await expect(casbinService.authorize(
        'john.doe@3ddiagnostix.com',
        'patient_data',
        'read'
      )).rejects.toThrow('Casbin enforcer not initialized')
    })

    test('should handle enforcer errors', async () => {
      mockEnforcer.enforce.mockRejectedValue(new Error('Casbin error'))

      await expect(casbinService.authorize(
        'john.doe@3ddiagnostix.com',
        'patient_data',
        'read'
      )).rejects.toThrow('Casbin error')
    })
  })

  describe('getUserRights', () => {
    beforeEach(() => {
      casbinService.enforcer = mockEnforcer
      casbinService.usersData = {
        users: [
          {
            email: 'john.doe@3ddiagnostix.com',
            fullName: 'John Doe',
            groups: ['Engineering'],
            roles: ['engineer'],
            orgUnit: 'Software Development',
            department: 'Engineering',
            twoStepEnabled: true
          }
        ]
      }
    })

    test('should return user rights for existing user', async () => {
      mockEnforcer.getPermissionsForUser.mockResolvedValue([
        ['john.doe@3ddiagnostix.com', 'patient_data', 'read'],
        ['john.doe@3ddiagnostix.com', 'patient_data', 'write'],
        ['Engineering', 'imaging_systems', 'read']
      ])
      mockEnforcer.getRolesForUser.mockResolvedValue(['Engineering', 'engineer'])

      const result = await casbinService.getUserRights('john.doe@3ddiagnostix.com')

      expect(result.found).toBe(true)
      expect(result.userEmail).toBe('john.doe@3ddiagnostix.com')
      expect(result.fullName).toBe('John Doe')
      expect(result.groups).toEqual(['Engineering'])
      expect(result.roles).toEqual(['engineer'])
      expect(result.orgUnit).toBe('Software Development')
      expect(result.department).toBe('Engineering')
      expect(result.twoStepEnabled).toBe(true)
      
      expect(result.rights).toHaveLength(2)
      expect(result.rights[0].resource).toBe('imaging_systems')
      expect(result.rights[0].actions).toEqual(['read'])
      expect(result.rights[1].resource).toBe('patient_data')
      expect(result.rights[1].actions).toEqual(['read', 'write'])
    })

    test('should return not found for non-existing user', async () => {
      const result = await casbinService.getUserRights('unknown@example.com')

      expect(result.found).toBe(false)
      expect(result.userEmail).toBe('unknown@example.com')
      expect(result.rights).toEqual([])
      expect(result.groups).toEqual([])
      expect(result.roles).toEqual([])
    })

    test('should throw error when enforcer not initialized', async () => {
      casbinService.enforcer = null

      await expect(casbinService.getUserRights('john.doe@3ddiagnostix.com'))
        .rejects.toThrow('Casbin enforcer not initialized')
    })

    test('should handle enforcer errors', async () => {
      mockEnforcer.getRolesForUser.mockResolvedValue([])
      mockEnforcer.getPermissionsForUser.mockRejectedValue(new Error('Permissions error'))
      mockEnforcer.getPolicy.mockRejectedValue(new Error('Policy error'))

      await expect(casbinService.getUserRights('john.doe@3ddiagnostix.com'))
        .rejects.toThrow('Policy error')
    })
  })

  describe('addPolicy', () => {
    beforeEach(() => {
      casbinService.enforcer = mockEnforcer;
    });

    test('should add new policy successfully', async () => {
      mockEnforcer.addPolicy.mockResolvedValue(true);
      const result = await casbinService.addPolicy('Engineering', 'new_resource', 'read');
      expect(result).toBe(true);
      expect(mockEnforcer.addPolicy).toHaveBeenCalledWith('Engineering', 'new_resource', 'read');
    });

    test('should return false for existing policy', async () => {
      mockEnforcer.addPolicy.mockResolvedValue(false);
      const result = await casbinService.addPolicy('Engineering', 'patient_data', 'read');
      expect(result).toBe(false);
    });

    test('should throw error when addPolicy fails', async () => {
      mockEnforcer.addPolicy.mockRejectedValue(new Error('Add failed'));
      await expect(casbinService.addPolicy('Engineering', 'fail_resource', 'read'))
        .rejects.toThrow('Add failed');
    });

    test('should throw error when enforcer not initialized', async () => {
      casbinService.enforcer = null;
      await expect(casbinService.addPolicy('Engineering', 'resource', 'read'))
        .rejects.toThrow('Casbin enforcer not initialized');
    });
  })

  describe('removePolicy', () => {
    beforeEach(() => {
      casbinService.enforcer = mockEnforcer;
    });

    test('should remove existing policy successfully', async () => {
      mockEnforcer.removePolicy.mockResolvedValue(true);
      const result = await casbinService.removePolicy('Engineering', 'patient_data', 'write');
      expect(result).toBe(true);
      expect(mockEnforcer.removePolicy).toHaveBeenCalledWith('Engineering', 'patient_data', 'write');
    });

    test('should return false for non-existing policy', async () => {
      mockEnforcer.removePolicy.mockResolvedValue(false);
      const result = await casbinService.removePolicy('Engineering', 'nonexistent', 'read');
      expect(result).toBe(false);
    });

    test('should throw error when removePolicy fails', async () => {
      mockEnforcer.removePolicy.mockRejectedValue(new Error('Remove failed'));
      await expect(casbinService.removePolicy('Engineering', 'fail_resource', 'read'))
        .rejects.toThrow('Remove failed');
    });

    test('should throw error when enforcer not initialized', async () => {
      casbinService.enforcer = null;
      await expect(casbinService.removePolicy('Engineering', 'resource', 'read'))
        .rejects.toThrow('Casbin enforcer not initialized');
    });
  })

  describe('getAllPolicies', () => {
    beforeEach(() => {
      casbinService.enforcer = mockEnforcer
    })

    test('should return all policies', async () => {
      const expectedPolicies = [
        ['p', 'Engineering', 'patient_data', 'read'],
        ['p', 'Finance', 'financial_reports', 'read']
      ];
      mockEnforcer.getPolicy.mockResolvedValue(expectedPolicies);
      const result = await casbinService.getAllPolicies();
      expect(result).toEqual(expectedPolicies);
    });

    test('should throw error when enforcer not initialized', async () => {
      casbinService.enforcer = null

      await expect(casbinService.getAllPolicies())
        .rejects.toThrow('Casbin enforcer not initialized')
    })
  })

  describe('reloadPolicies', () => {
    beforeEach(() => {
      casbinService.enforcer = mockEnforcer
    })

    test('should reload policies successfully', async () => {
      mockEnforcer.loadPolicy.mockResolvedValue()

      await expect(casbinService.reloadPolicies()).resolves.not.toThrow()
      expect(mockEnforcer.loadPolicy).toHaveBeenCalled()
    })

    test('should throw error when enforcer not initialized', async () => {
      casbinService.enforcer = null

      await expect(casbinService.reloadPolicies())
        .rejects.toThrow('Casbin enforcer not initialized')
    })

    test('should handle reload errors', async () => {
      mockEnforcer.loadPolicy.mockRejectedValue(new Error('Reload failed'))

      await expect(casbinService.reloadPolicies())
        .rejects.toThrow('Reload failed')
    })
  })
});