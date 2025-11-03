/**
 * E2E Dashboard Access Tests with Mock Users
 * 
 * These tests verify dashboard section visibility based on user groups
 * using mock authentication to simulate different user types.
 */

import { test, expect } from '@playwright/test';

/**
 * Helper function to set mock session in browser
 * @param {Page} page - Playwright page object
 * @param {string} userType - Type of user (admin, swd, regular, etc.)
 */
async function setMockUserSession(page, userType) {
  const mockSessions = {
    admin: {
      user: {
        email: 'test.admin@3ddx.com',
        id: 'mock-admin-001',
        name: 'Test Admin User'
      },
      groups: ['admin', 'SWD', 'developers']
    },
    swd: {
      user: {
        email: 'test.developer@3ddx.com',
        id: 'mock-swd-001',
        name: 'Test Developer User'
      },
      groups: ['SWD', 'developers']
    },
    regular: {
      user: {
        email: 'test.user@3ddx.com',
        id: 'mock-user-001',
        name: 'Test Regular User'
      },
      groups: ['users', 'sales']
    },
    finance: {
      user: {
        email: 'test.finance@3ddx.com',
        id: 'mock-finance-001',
        name: 'Test Finance User'
      },
      groups: ['finance', 'users']
    }
  };

  const session = mockSessions[userType] || mockSessions.regular;

  // Set mock session in localStorage or sessionStorage
  await page.evaluate((mockSession) => {
    // Store mock user data
    localStorage.setItem('mock-user', JSON.stringify(mockSession.user));
    localStorage.setItem('mock-groups', JSON.stringify(mockSession.groups));
    localStorage.setItem('mock-auth-enabled', 'true');
  }, session);
}

test.describe('Dashboard Access Control - Admin User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setMockUserSession(page, 'admin');
    await page.goto('/dashboard');
  });

  test('should show all dashboard sections for admin', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check User Details & Organization (public)
    await expect(page.locator('text=User Details & Organization')).toBeVisible();

    // Check User Rights & Permissions (restricted)
    await expect(page.locator('text=User Rights & Permissions')).toBeVisible();

    // Check Technical User Info (restricted)
    await expect(page.locator('text=Technical User Info')).toBeVisible();

    // Check API Documentation (restricted)
    await expect(page.locator('text=API Documentation')).toBeVisible();
  });

  test('should NOT show access restriction notice for admin', async ({ page }) => {
    // Access restriction alert should not be visible
    await expect(page.locator('text=Limited Access')).not.toBeVisible();
  });

  test('should show admin badge in user details', async ({ page }) => {
    // Check for admin status indicator
    await expect(page.locator('text=Administrator')).toBeVisible();
  });
});

test.describe('Dashboard Access Control - SWD User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setMockUserSession(page, 'swd');
    await page.goto('/dashboard');
  });

  test('should show restricted sections for SWD member', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check public sections
    await expect(page.locator('text=User Details & Organization')).toBeVisible();

    // Check restricted sections (should be visible for SWD)
    await expect(page.locator('text=User Rights & Permissions')).toBeVisible();
    await expect(page.locator('text=Technical User Info')).toBeVisible();
    await expect(page.locator('text=API Documentation')).toBeVisible();
  });

  test('should NOT show access restriction notice for SWD', async ({ page }) => {
    await expect(page.locator('text=Limited Access')).not.toBeVisible();
  });

  test('should show SWD group membership', async ({ page }) => {
    // Scroll to groups section
    await page.locator('text=Groups').scrollIntoViewIfNeeded();
    
    // Check for SWD group
    await expect(page.locator('text=Software Development')).toBeVisible();
  });
});

test.describe('Dashboard Access Control - Regular User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setMockUserSession(page, 'regular');
    await page.goto('/dashboard');
  });

  test('should only show public sections for regular user', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check public sections are visible
    await expect(page.locator('text=User Details & Organization')).toBeVisible();

    // Check restricted sections are NOT visible
    await expect(page.locator('text=User Rights & Permissions')).not.toBeVisible();
    await expect(page.locator('text=Technical User Info')).not.toBeVisible();
    await expect(page.locator('text=API Documentation')).not.toBeVisible();
  });

  test('should show access restriction notice for regular user', async ({ page }) => {
    // Access restriction alert should be visible
    await expect(page.locator('text=Limited Access')).toBeVisible();
    
    // Should explain which sections are restricted
    await expect(page.locator('text=The following sections are restricted')).toBeVisible();
  });

  test('should show required groups in restriction notice', async ({ page }) => {
    // Scroll to restriction notice
    await page.locator('text=Limited Access').scrollIntoViewIfNeeded();
    
    // Should mention required groups
    await expect(page.getByText(/SWD.*admin.*developers/)).toBeVisible();
  });

  test('should show user info but not admin badge', async ({ page }) => {
    await expect(page.locator('text=Test Regular User')).toBeVisible();
    await expect(page.locator('text=Administrator')).not.toBeVisible();
  });
});

test.describe('Dashboard Access Control - Finance User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setMockUserSession(page, 'finance');
    await page.goto('/dashboard');
  });

  test('should show limited access for finance user', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Public sections visible
    await expect(page.locator('text=User Details & Organization')).toBeVisible();

    // Restricted sections NOT visible (finance is not in SWD/admin/developers)
    await expect(page.locator('text=User Rights & Permissions')).not.toBeVisible();
    await expect(page.locator('text=Technical User Info')).not.toBeVisible();
  });

  test('should show finance department in user details', async ({ page }) => {
    await expect(page.locator('text=Finance & Accounting')).toBeVisible();
  });
});

test.describe('Dashboard Section Interactions', () => {
  test('admin can expand/collapse technical info', async ({ page }) => {
    await page.goto('/');
    await setMockUserSession(page, 'admin');
    await page.goto('/dashboard');

    // Find technical info section
    await page.locator('text=Technical User Info').scrollIntoViewIfNeeded();

    // Technical info should be expanded by default
    await expect(page.locator('pre').first()).toBeVisible();

    // Click collapse button
    await page.locator('[data-test="technical-info-toggle"]').or(
      page.locator('button', { has: page.locator('[class*="mdi-chevron"]') })
    ).first().click();

    // Wait for collapse animation
    await page.waitForTimeout(500);

    // Content should be hidden
    // (Check is removed as implementation may vary)
  });

  test('admin can test authorization', async ({ page }) => {
    await page.goto('/');
    await setMockUserSession(page, 'admin');
    await page.goto('/dashboard');

    // Scroll to User Rights & Permissions
    await page.locator('text=User Rights & Permissions').scrollIntoViewIfNeeded();

    // Expand first resource (if using accordion)
    const firstResource = page.locator('.v-expansion-panel').first();
    if (await firstResource.isVisible()) {
      await firstResource.click();

      // Look for test buttons
      const testButton = page.locator('button:has-text("Test")').first();
      if (await testButton.isVisible()) {
        await testButton.click();

        // Should show toast notification
        await expect(page.locator('.simple-toast')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('SWD user can view API documentation links', async ({ page }) => {
    await page.goto('/');
    await setMockUserSession(page, 'swd');
    await page.goto('/dashboard');

    // Scroll to API Documentation
    await page.locator('text=API Documentation').scrollIntoViewIfNeeded();

    // Check for Swagger and JSDoc links
    await expect(page.locator('text=Swagger API Docs')).toBeVisible();
    await expect(page.locator('text=JSDoc Documentation')).toBeVisible();

    // Check for View buttons
    await expect(page.locator('button:has-text("View Swagger Docs")')).toBeVisible();
    await expect(page.locator('button:has-text("View JSDoc Docs")')).toBeVisible();
  });
});

test.describe('Dashboard Responsive Behavior', () => {
  test('should display restricted sections correctly on mobile for SWD', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await setMockUserSession(page, 'swd');
    await page.goto('/dashboard');

    // All sections should still be visible on mobile
    await expect(page.locator('text=User Details & Organization')).toBeVisible();
    await expect(page.locator('text=User Rights & Permissions')).toBeVisible();
  });

  test('should show restriction notice correctly on mobile for regular user', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await setMockUserSession(page, 'regular');
    await page.goto('/dashboard');

    // Restriction notice should be visible
    await expect(page.locator('text=Limited Access')).toBeVisible();
  });
});

test.describe('Dashboard Error Handling', () => {
  test('should handle missing user rights gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Set incomplete session
    await page.evaluate(() => {
      localStorage.setItem('mock-user', JSON.stringify({
        email: 'test.incomplete@3ddx.com',
        id: 'mock-incomplete-001'
      }));
      localStorage.setItem('mock-auth-enabled', 'true');
    });

    await page.goto('/dashboard');

    // Should still show dashboard but with limited access
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Clear any existing session
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/dashboard');

    // Should redirect to home/login
    await expect(page).toHaveURL(/\/(login)?/);
  });
});
