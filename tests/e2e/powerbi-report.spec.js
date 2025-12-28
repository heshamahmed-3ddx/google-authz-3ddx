import { test, expect } from '@playwright/test'

test.describe('PowerBI Report Page', () => {
  test('should navigate to PowerBI route without crashing', async ({ page }) => {
    await page.goto('/reports/powerbi', { waitUntil: 'domcontentloaded' })

    // Page should load (may redirect to home or show login, but shouldn't crash)
    await page.waitForSelector('body', { timeout: 5000 })
    
    // Should have content loaded (either the powerbi page or home/login page)
    const body = await page.locator('body').textContent()
    expect(body.length).toBeGreaterThan(0)
  })

  test('should have title', async ({ page }) => {
    await page.goto('/reports/powerbi', { waitUntil: 'domcontentloaded' })

    // Check page has a title
    const title = await page.title()
    expect(title).toContain('InsightHub')
  })
})
