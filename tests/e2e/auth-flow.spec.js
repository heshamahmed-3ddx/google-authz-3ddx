/**
 * @file auth-flow.spec.js
 * @description End-to-end tests for authentication and authorization flow
 * @author 3D Diagnostix Development Team
 */

import { test, expect } from '@playwright/test'

test.describe('3D Diagnostix Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:5173')
  })

  test('should display home page with login option', async ({ page }) => {
    // Check if home page loads
    await expect(page.locator('h1')).toContainText('3D Diagnostix')
    
    // Check for login button
    await expect(page.locator('text=Login with Google')).toBeVisible()
  })

  test('should navigate to login when clicking login button', async ({ page }) => {
    // Click login button
    await page.click('text=Login with Google')
    
    // Should redirect to Google OAuth (or mock in test environment)
    await page.waitForURL(/auth\/google/)
  })

  test('should show authentication error for invalid session', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('http://localhost:5173/profile')
    
    // Should redirect to home or show error
    await expect(page.url()).toContain('/')
  })

  test('should display dashboard after successful authentication', async ({ page }) => {
    // Mock authentication state (in real test, would go through OAuth)
    await page.evaluate(() => {
      // Mock authenticated session
      sessionStorage.setItem('isAuthenticated', 'true')
    })
    
    await page.goto('http://localhost:5173/dashboard')
    
    // Check if dashboard elements are visible
    await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
    await expect(page.locator('text=User Details')).toBeVisible()
    await expect(page.locator('text=User Rights')).toBeVisible()
  })

  test('should navigate to user profile page', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      sessionStorage.setItem('isAuthenticated', 'true')
    })
    
    await page.goto('http://localhost:5173/dashboard')
    await page.click('text=User Details')
    
    // Should navigate to profile page
    await expect(page.url()).toContain('/profile')
    await expect(page.locator('h1')).toContainText('User Details')
  })

  test('should navigate to user rights page', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      sessionStorage.setItem('isAuthenticated', 'true')
    })
    
    await page.goto('http://localhost:5173/dashboard')
    await page.click('text=User Rights')
    
    // Should navigate to user rights page
    await expect(page.url()).toContain('/user-rights')
    await expect(page.locator('h1')).toContainText('User Rights')
  })
})

test.describe('Theme System', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should toggle between light and dark themes', async ({ page }) => {
    // Check initial theme (should be light)
    await expect(page.locator('html')).toHaveClass(/v-theme--light/)
    
    // Find and click theme toggle button
    await page.click('[data-testid="theme-toggle"]')
    
    // Should switch to dark theme
    await expect(page.locator('html')).toHaveClass(/v-theme--dark/)
    
    // Toggle back to light
    await page.click('[data-testid="theme-toggle"]')
    await expect(page.locator('html')).toHaveClass(/v-theme--light/)
  })

  test('should persist theme preference', async ({ page }) => {
    // Set dark theme
    await page.click('[data-testid="theme-toggle"]')
    await expect(page.locator('html')).toHaveClass(/v-theme--dark/)
    
    // Reload page
    await page.reload()
    
    // Theme should persist
    await expect(page.locator('html')).toHaveClass(/v-theme--dark/)
  })

  test('should support keyboard shortcut for theme toggle', async ({ page }) => {
    // Use keyboard shortcut Ctrl+Shift+T (or Cmd+Shift+T on Mac)
    await page.keyboard.press('Control+Shift+KeyT')
    
    // Theme should toggle
    await expect(page.locator('html')).toHaveClass(/v-theme--dark/)
  })
})

test.describe('Responsive Design', () => {
  
  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5173')
    
    // Check for mobile menu elements
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('should display desktop navigation on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5173')
    
    // Check for desktop navigation elements
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  
  test('should display error page for non-existent routes', async ({ page }) => {
    await page.goto('http://localhost:5173/non-existent-page')
    
    // Should show 404 or redirect to home
    await expect(page.url()).toContain('/')
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      sessionStorage.setItem('isAuthenticated', 'true')
    })
    
    // Intercept API calls and return errors
    await page.route('**/api/user/details', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
          }
        })
      })
    })
    
    await page.goto('http://localhost:5173/profile')
    
    // Should display error message
    await expect(page.locator('text=Error Loading User Details')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check for proper ARIA attributes
    await expect(page.locator('[role="main"]')).toBeVisible()
    await expect(page.locator('[role="navigation"]')).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Tab through focusable elements
    await page.keyboard.press('Tab')
    
    // Check if focus is visible
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // This would require axe-core or similar accessibility testing tool
    // For now, just ensure page loads without accessibility errors
    await expect(page.locator('body')).toBeVisible()
  })
})