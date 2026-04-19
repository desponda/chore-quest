import { FullConfig, chromium } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

export default async function globalSetup(_config: FullConfig) {
  // Reset and reseed the database before the test suite runs
  execSync('npx prisma db push --force-reset --accept-data-loss', {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
  execSync('npx prisma db seed', {
    cwd: process.cwd(),
    stdio: 'inherit',
  })

  // Sign in and save auth state so all tests start authenticated
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto('http://localhost:3000/signin')
  await page.fill('input[name="email"]', 'parent@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL('http://localhost:3000/', { timeout: 15000 })

  const storageDir = path.join(process.cwd(), 'playwright/.auth')
  fs.mkdirSync(storageDir, { recursive: true })
  await page.context().storageState({ path: path.join(storageDir, 'user.json') })

  await browser.close()
}
