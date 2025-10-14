import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'mobile', width: 375, height: 667 }, // iPhone 8
  { name: 'tablet', width: 834, height: 1112 }, // iPad Pro
  { name: 'desktop', width: 1280, height: 800 }
]

test.describe('Theme switching and responsive layout', () => {
  for (const vp of viewports) {
    test(`should display correct layout and switch theme on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')

      // Check theme toggle is visible
      await expect(page.locator('.theme-toggle-container')).toBeVisible()

      // Switch to dark theme
      await page.locator('.theme-toggle-container').click()
      await page.locator('text=Dark').click()
      // Check body or Vuetify dark class applied
      await expect(page.locator('body')).toHaveClass(/dark/)

      // Switch to light theme
      await page.locator('.theme-toggle-container').click()
      await page.locator('text=Light').click()
      await expect(page.locator('body')).not.toHaveClass(/dark/)

      // Check header/footer/sidebar responsive behavior
      if (vp.name === 'mobile') {
        await expect(page.locator('header')).toBeVisible()
        await expect(page.locator('footer')).toBeVisible()
        // Sidebar should be collapsed or hidden
        await expect(page.locator('.sidebar')).toBeHidden()
      } else {
        await expect(page.locator('.sidebar')).toBeVisible()
      }
    })
  }
})
