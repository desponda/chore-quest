import { test } from '@playwright/test'

async function unlockParent(page: any) {
  await page.goto('/parent')
  for (const d of ['1','2','3','4']) {
    await page.click(`[data-digit="${d}"]`)
  }
  await page.waitForURL('**/parent')
  await page.waitForTimeout(300)
}

test('parent children page', async ({ page }) => {
  await unlockParent(page)
  await page.click('text=Children')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/07-parent-children.png', fullPage: true })
})

test('parent quests page', async ({ page }) => {
  await unlockParent(page)
  await page.click('text=Quests')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/08-parent-quests.png', fullPage: true })
})

test('parent rewards page', async ({ page }) => {
  await unlockParent(page)
  await page.click('text=Rewards')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/09-parent-rewards.png', fullPage: true })
})

test('parent approvals page', async ({ page }) => {
  await unlockParent(page)
  await page.click('text=Approvals')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/10-parent-approvals.png', fullPage: true })
})
