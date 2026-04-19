import { test, expect } from '@playwright/test'
import * as fs from 'fs'

async function unlockParent(page: any) {
  await page.goto('/parent')
  for (const d of ['1','2','3','4']) {
    await page.click(`[data-digit="${d}"]`)
  }
  await page.waitForURL('**/parent')
  await page.waitForTimeout(300)
}

test('parent children page loads with heroes and credits button', async ({ page }) => {
  fs.mkdirSync('screenshots', { recursive: true })
  await unlockParent(page)
  await page.click('text=Children')
  await page.waitForTimeout(800)
  await expect(page.locator('text=Alex')).toBeVisible()
  await expect(page.locator('text=Sam')).toBeVisible()
  await page.screenshot({ path: 'screenshots/07-parent-children.png', fullPage: true })
})

test('credits adjustment UI works', async ({ page }) => {
  await unlockParent(page)
  await page.click('text=Children')
  await page.waitForTimeout(500)
  // Click the Credits button for Alex
  await page.locator('text=⚡ Credits').first().click()
  await expect(page.locator('input[name="amount"]').first()).toBeVisible()
  await page.screenshot({ path: 'screenshots/11-credits-adjust.png', fullPage: true })
})
