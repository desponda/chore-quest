import { test } from '@playwright/test'
import * as fs from 'fs'

test.beforeAll(() => { fs.mkdirSync('screenshots', { recursive: true }) })

async function unlockParent(page: any) {
  await page.goto('/parent')
  for (const d of ['1','2','3','4']) await page.click(`[data-digit="${d}"]`)
  await page.waitForURL('**/parent')
  await page.waitForTimeout(400)
}

test('hub redesigned', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1200) // let fonts load
  await page.screenshot({ path: 'screenshots/new-01-hub.png', fullPage: true })
})

test('quest board redesigned', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(800)
  await page.click('[data-testid="hero-card-alex"]')
  await page.waitForURL('**/quests')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'screenshots/new-02-quests.png', fullPage: true })
})

test('quest unfurled redesigned', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(600)
  await page.click('[data-testid="hero-card-alex"]')
  await page.waitForURL('**/quests')
  await page.waitForTimeout(800)
  await page.click('[data-testid="scroll-card"]:first-child')
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'screenshots/new-03-quest-open.png', fullPage: true })
})

test('rewards redesigned', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(600)
  await page.click('[data-testid="hero-card-alex"]')
  await page.waitForURL('**/quests')
  await page.getByText('Rewards').click()
  await page.waitForURL('**/rewards')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'screenshots/new-04-rewards.png', fullPage: true })
})

test('parent dashboard redesigned', async ({ page }) => {
  await unlockParent(page)
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'screenshots/new-05-parent.png', fullPage: true })
})
