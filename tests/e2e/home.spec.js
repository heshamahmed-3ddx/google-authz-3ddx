import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page without crashing', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    
    // Page should load (may show login or home content)
    await page.waitForSelector('body', { timeout: 5000 })
    
    // Verify we're on the home route
    await expect(page).toHaveURL(/\/$/)
    
    // Should have some content
    const body = await page.locator('body').textContent()
    expect(body.length).toBeGreaterThan(0)
  })

  test('should have page title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    
    // Check page has a title
    const title = await page.title()
    expect(title).toContain('InsightHub')
  })
})
