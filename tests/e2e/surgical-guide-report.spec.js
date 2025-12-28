import { test, expect } from '@playwright/test'

test.describe('Surgical Guide Report', () => {
  test('should navigate to report route without crashing', async ({ page }) => {
    await page.goto('/finance/surgical-guide-report', { waitUntil: 'domcontentloaded' })

    // Page should load (may show login or access denied, but shouldn't crash)
    const url = page.url()
    expect(url).toContain('surgical-guide-report')
    
    // Should have some content loaded
    await page.waitForSelector('body', { timeout: 5000 })
    const body = await page.locator('body').textContent()
    expect(body.length).toBeGreaterThan(0)
  })

  test('should have title', async ({ page }) => {
    await page.goto('/finance/surgical-guide-report', { waitUntil: 'domcontentloaded' })

    // Check page has a title
    const title = await page.title()
    expect(title).toContain('InsightHub')
  })
})
