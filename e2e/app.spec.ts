import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

test.beforeAll(async () => {
  fs.mkdirSync(path.join(process.cwd(), 'screenshots'), { recursive: true })
})

test('family hub loads with child profiles', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=CHORE QUEST')).toBeVisible()
  await expect(page.locator('text=Alex')).toBeVisible()
  await expect(page.locator('text=Sam')).toBeVisible()
  await page.screenshot({ path: 'screenshots/01-hub.png', fullPage: true })
})

test('child quest board shows scrolls', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Alex')
  await page.waitForURL('/child/**/quests')
  await expect(page.locator('text=Slay the Dish Dragon')).toBeVisible()
  await page.screenshot({ path: 'screenshots/02-quest-board.png', fullPage: true })
})

test('quest unfurls on click', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Alex')
  await page.waitForURL('/child/**/quests')
  await page.click('text=Slay the Dish Dragon')
  await page.waitForTimeout(600)
  await expect(page.locator('text=Accept & Complete')).toBeVisible()
  await page.screenshot({ path: 'screenshots/03-quest-unfurled.png', fullPage: true })
})

test('reward shop shows rewards', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Alex')
  await page.waitForURL('/child/**/quests')
  await page.click('text=Rewards')
  await expect(page.locator('text=TREASURE VAULT')).toBeVisible()
  await page.screenshot({ path: 'screenshots/04-rewards.png', fullPage: true })
})

test('parent PIN blocks access', async ({ page }) => {
  await page.goto('/parent')
  await expect(page.locator('text=Enter Parent PIN')).toBeVisible()
  await page.screenshot({ path: 'screenshots/05-parent-pin.png', fullPage: true })
})

test('parent PIN grants access with correct code', async ({ page }) => {
  await page.goto('/parent')
  await page.click('[data-digit="1"]')
  await page.click('[data-digit="2"]')
  await page.click('[data-digit="3"]')
  await page.click('[data-digit="4"]')
  await page.waitForURL('/parent')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.screenshot({ path: 'screenshots/06-parent-dashboard.png', fullPage: true })
})
