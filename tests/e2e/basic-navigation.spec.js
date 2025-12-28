/**
 * @file basic-navigation.spec.js
 * @description Basic E2E tests for navigation and home page
 */

import { test, expect } from '@playwright/test'

test.describe('Basic Navigation', () => {
  
  test('should load home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    
    // Wait for page to render
    await page.waitForSelector('body', { timeout: 5000 })
    
    // Should have content loaded
    const body = await page.locator('body').textContent()
    expect(body.length).toBeGreaterThan(0)
  })

  test('should have page title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    
    // Check page has a title
    const title = await page.title()
    expect(title).toContain('InsightHub')
  })

  test('should navigate without errors', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    
    // Verify URL is correct
    await expect(page).toHaveURL(/\/$/)
  })
})
