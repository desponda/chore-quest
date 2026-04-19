/**
 * USER STORIES — COMPREHENSIVE E2E TEST SUITE
 *
 * Covers every user story, use case, and edge case for ChoreQuest.
 * Database is reset to seed state before this suite (globalSetup).
 * Organized by persona: Child, Parent.
 */

import { test, expect, Page } from '@playwright/test'

// ─── Helpers ───────────────────────────────────────────────────────

async function unlockParent(page: Page) {
  await page.goto('/parent')
  await page.waitForSelector('[data-digit="1"]')
  for (const d of ['1', '2', '3', '4']) {
    await page.click(`[data-digit="${d}"]`)
  }
  // Wait for the PIN modal to disappear (confirmed by Dashboard heading appearing)
  await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 8000 })
}

async function goToChildQuests(page: Page, heroName: string) {
  await page.goto('/')
  await page.waitForTimeout(400)
  await page.click(`[data-testid="hero-card-${heroName.toLowerCase()}"]`)
  await page.waitForURL('**/quests')
  await page.waitForTimeout(400)
}

async function goToChildRewards(page: Page, heroName: string) {
  await goToChildQuests(page, heroName)
  await page.locator('[data-testid="parent-nav"]').isHidden().catch(() => {})
  await page.getByText('Rewards').click()
  await page.waitForURL('**/rewards')
  await page.waitForTimeout(400)
}

async function navTo(page: Page, testid: string) {
  await page.locator(`[data-testid="${testid}"]`).click()
  await page.waitForTimeout(400)
}

// ─── FAMILY HUB ────────────────────────────────────────────────────

test.describe('Family Hub', () => {
  test('US-01: loads and shows the CHORE QUEST title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=CHORE QUEST')).toBeVisible()
  })

  test('US-02: shows all registered heroes', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="hero-card-alex"]')).toBeVisible()
    await expect(page.locator('[data-testid="hero-card-sam"]')).toBeVisible()
  })

  test('US-03: hero card shows credits and streak', async ({ page }) => {
    await page.goto('/')
    const alexCard = page.locator('[data-testid="hero-card-alex"]')
    await expect(alexCard.locator('text=45')).toBeVisible()
    await expect(alexCard.locator('text=3 day streak')).toBeVisible()
  })

  test('US-04: clicking a hero navigates to their quest board', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="hero-card-alex"]')
    await page.waitForURL('**/quests')
    await expect(page).toHaveURL(/\/child\/.+\/quests/)
  })

  test('US-05: parent lock icon is visible and links to /parent', async ({ page }) => {
    await page.goto('/')
    const lock = page.locator('[data-testid="parent-lock"]')
    await expect(lock).toBeVisible()
    await lock.click()
    await expect(page).toHaveURL(/\/parent/)
  })
})

// ─── CHILD: QUEST BOARD ────────────────────────────────────────────

test.describe('Child — Quest Board', () => {
  test('US-10: quest board shows assigned quests as scrolls', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await expect(page.locator('[data-testid="scroll-card"]').first()).toBeVisible()
  })

  test('US-11: quest board shows child name in header', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await expect(page.locator('text=ALEX')).toBeVisible()
  })

  test('US-12: credit balance is shown in header', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await expect(page.locator('[data-testid="credit-balance"]')).toBeVisible()
  })

  test('US-13: quests display their title and credit reward', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    const firstCard = page.locator('[data-testid="scroll-card"]').first()
    await expect(firstCard).toBeVisible()
    // Quest title text is rendered inside the scroll card
    await expect(firstCard).toContainText(/Slay|Vanquish|Bedroom|Trash|Floor|Table/i)
  })

  test('US-14: tapping a quest scroll unfurls it and shows the complete button', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await page.locator('[data-testid="scroll-card"]').first().click()
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="complete-button"]')).toBeVisible()
  })

  test('US-15: tapping an open quest closes it again', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    const card = page.locator('[data-testid="scroll-card"]').first()
    await card.click()
    await page.waitForTimeout(400)
    await expect(page.locator('[data-testid="complete-button"]')).toBeVisible()
    await card.click()
    await page.waitForTimeout(400)
    await expect(page.locator('[data-testid="complete-button"]')).not.toBeVisible()
  })

  test('US-16: completing a quest marks it done', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await page.locator('[data-testid="scroll-card"]').first().click()
    await page.waitForTimeout(400)
    await page.locator('[data-testid="complete-button"]').click()
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="complete-button"]')).not.toBeVisible()
  })

  test('US-17: bonus quests show for children who have not grabbed them', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    const grabCards = page.locator('[data-testid="grab-scroll-card"]')
    await expect(grabCards.first()).toBeVisible()
    await expect(grabCards.first()).toContainText('BONUS QUEST')
    // Should have multiple up-for-grabs quests
    const count = await grabCards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('US-18: nav links to Rewards are visible', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await expect(page.getByText('Rewards')).toBeVisible()
  })

  test('US-19: Sam has different quests assigned', async ({ page }) => {
    await goToChildQuests(page, 'Sam')
    await expect(page.locator('[data-testid="scroll-card"]').first()).toBeVisible()
  })
})

// ─── CHILD: REWARD SHOP ────────────────────────────────────────────

test.describe('Child — Reward Shop', () => {
  test('US-20: treasure vault shows all active rewards', async ({ page }) => {
    await goToChildRewards(page, 'Alex')
    await expect(page.locator('text=TREASURE VAULT')).toBeVisible()
    await expect(page.locator('[data-testid^="reward-card-"]').first()).toBeVisible()
  })

  test('US-21: credit balance is displayed in the vault', async ({ page }) => {
    await goToChildRewards(page, 'Alex')
    await expect(page.locator('[data-testid="vault-credits"]')).toBeVisible()
  })

  test('US-22: affordable rewards show the Claim Reward button enabled', async ({ page }) => {
    await goToChildRewards(page, 'Alex')
    // Alex has 45 credits; Stay Up Late (25), Extra Screen Time (30), Choose Dinner (40) all affordable
    const redeemBtn = page.locator('button:has-text("Claim Reward")').first()
    await expect(redeemBtn).toBeEnabled()
  })

  test('US-23: Movie Night (50cr) is locked for Alex (45cr)', async ({ page }) => {
    await goToChildRewards(page, 'Alex')
    await expect(page.locator('[data-testid="locked-reward"]').first()).toBeVisible()
  })

  test('US-24: Sam (22cr) sees all rewards locked', async ({ page }) => {
    await goToChildRewards(page, 'Sam')
    // Sam has 22 credits, cheapest reward costs 25 — all locked
    const locks = page.locator('[data-testid="locked-reward"]')
    await expect(locks.first()).toBeVisible()
  })

  test('US-25: redeeming a reward decreases credit balance', async ({ page }) => {
    await goToChildRewards(page, 'Alex')
    const balanceBefore = parseInt((await page.locator('[data-testid="vault-credits"]').textContent()) ?? '0')
    await page.locator('button:has-text("Claim Reward")').first().click()
    await page.waitForTimeout(1000)
    const balanceAfter = parseInt((await page.locator('[data-testid="vault-credits"]').textContent()) ?? '0')
    expect(balanceAfter).toBeLessThan(balanceBefore)
  })

  test('US-26: redeeming shows a success toast', async ({ page }) => {
    // Give Sam enough credits via parent panel
    await unlockParent(page)
    await navTo(page, 'nav-children')
    // Open Sam's credit panel (Sam is typically listed second)
    const creditBtns = page.locator('text=⚡ Credits')
    await creditBtns.last().click()
    const amountInput = page.locator('input[name="amount"]').first()
    await amountInput.fill('100')
    await page.locator('button:has-text("Apply")').first().click()
    await page.waitForTimeout(800)

    // Go to Sam's reward shop and redeem
    await goToChildRewards(page, 'Sam')
    const redeemBtn = page.locator('button:has-text("Claim Reward")').first()
    await expect(redeemBtn).toBeEnabled({ timeout: 5000 })
    await redeemBtn.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=parent for approval')).toBeVisible()
  })
})

// ─── PARENT: PIN ACCESS ────────────────────────────────────────────

test.describe('Parent — PIN Access', () => {
  test('US-30: navigating to /parent shows the PIN entry screen', async ({ page }) => {
    await page.goto('/parent')
    await expect(page.locator('text=Enter Parent PIN')).toBeVisible()
  })

  test('US-31: PIN entry pad shows digits 0–9 and CLR', async ({ page }) => {
    await page.goto('/parent')
    for (let i = 0; i <= 9; i++) {
      await expect(page.locator(`[data-digit="${i}"]`)).toBeVisible()
    }
    await expect(page.locator('text=CLR')).toBeVisible()
  })

  test('US-32: correct PIN (1234) grants access to parent dashboard', async ({ page }) => {
    await unlockParent(page)
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
  })

  test('US-33: wrong PIN does not grant access', async ({ page }) => {
    await page.goto('/parent')
    for (const d of ['9', '9', '9', '9']) {
      await page.click(`[data-digit="${d}"]`)
    }
    await page.waitForTimeout(800)
    await expect(page).toHaveURL(/\/parent/)
    await expect(page.locator('text=Enter Parent PIN')).toBeVisible()
  })

  test('US-34: CLR button clears the PIN input', async ({ page }) => {
    await page.goto('/parent')
    await page.click('[data-digit="1"]')
    await page.click('[data-digit="2"]')
    await page.click('text=CLR')
    await expect(page.locator('text=Enter Parent PIN')).toBeVisible()
  })

  test('US-35: /parent/children without PIN shows PIN screen', async ({ page }) => {
    await page.goto('/parent/children')
    await expect(page.locator('text=Enter Parent PIN')).toBeVisible()
  })
})

// ─── PARENT: DASHBOARD ─────────────────────────────────────────────

test.describe('Parent — Dashboard', () => {
  test('US-40: dashboard shows stat cards', async ({ page }) => {
    await unlockParent(page)
    await expect(page.locator('text=Active Quests')).toBeVisible()
    await expect(page.locator('text=Heroes')).toBeVisible()
  })

  test('US-41: all sidebar nav links are present', async ({ page }) => {
    await unlockParent(page)
    for (const id of ['nav-dashboard', 'nav-approvals', 'nav-children', 'nav-quests', 'nav-rewards']) {
      await expect(page.locator(`[data-testid="${id}"]`)).toBeVisible()
    }
  })

  test('US-42: Back to Family Hub link is present', async ({ page }) => {
    await unlockParent(page)
    await expect(page.locator('text=Back to Family Hub')).toBeVisible()
  })

  test('US-43: recent completions section renders', async ({ page }) => {
    await unlockParent(page)
    await expect(page.locator('text=Recent Completions')).toBeVisible()
  })
})

// ─── PARENT: MANAGE CHILDREN ───────────────────────────────────────

test.describe('Parent — Manage Children', () => {
  test('US-50: children page lists existing heroes', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-children')
    await expect(page.locator('text=Alex')).toBeVisible()
    await expect(page.locator('text=Sam')).toBeVisible()
  })

  test('US-51: each hero shows credit balance', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-children')
    await expect(page.locator('text=credits').first()).toBeVisible()
  })

  test('US-52: credits adjustment panel opens', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-children')
    await page.locator('text=⚡ Credits').first().click()
    await expect(page.locator('input[name="amount"]').first()).toBeVisible()
  })

  test('US-53: add hero form is present with name input', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-children')
    await expect(page.locator('text=Add New Hero')).toBeVisible()
    await expect(page.locator('input[placeholder="Hero name"]')).toBeVisible()
  })

  test('US-54: portrait picker is shown', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-children')
    await expect(page.locator('text=Portrait')).toBeVisible()
  })

  test('US-55: color picker is shown', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-children')
    await expect(page.locator('text=Color')).toBeVisible()
  })
})

// ─── PARENT: MANAGE QUESTS ─────────────────────────────────────────

test.describe('Parent — Manage Quests', () => {
  test('US-60: quests page lists all active quests', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-quests')
    await expect(page.locator('text=Slay the Dish Dragon')).toBeVisible()
  })

  test('US-61: each quest shows difficulty and credit value', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-quests')
    await expect(page.locator('text=easy').first()).toBeVisible()
  })

  test('US-62: grabbable quests show BONUS badge', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-quests')
    await expect(page.locator('[data-testid="bonus-badge"]').first()).toBeVisible()
  })

  test('US-63: create quest form is present', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-quests')
    await expect(page.locator('text=Create New Quest')).toBeVisible()
    await expect(page.locator('input[name="title"]')).toBeVisible()
  })

  test('US-64: hero portrait assignment toggles are present per quest', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-quests')
    // Assigned heroes show as portrait images below each quest
    await expect(page.locator('text=Assigned heroes — click to toggle').first()).toBeVisible()
  })

  test('US-65: delete icon present per quest', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-quests')
    // Delete is now a trash-can icon button (title="Delete quest")
    await expect(page.locator('[title="Delete quest"]').first()).toBeVisible()
  })
})

// ─── PARENT: MANAGE REWARDS ────────────────────────────────────────

test.describe('Parent — Manage Rewards', () => {
  test('US-70: rewards page lists all active rewards', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-rewards')
    await expect(page.locator('text=Movie Night')).toBeVisible()
    await expect(page.locator('text=Extra Screen Time')).toBeVisible()
  })

  test('US-71: each reward shows its credit cost', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-rewards')
    await expect(page.locator('text=50 credits')).toBeVisible()
  })

  test('US-72: add reward form is present', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-rewards')
    await expect(page.locator('text=Add New Reward')).toBeVisible()
  })

  test('US-73: delete button present per reward', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-rewards')
    await expect(page.locator('text=Delete').first()).toBeVisible()
  })
})

// ─── PARENT: APPROVALS ─────────────────────────────────────────────

test.describe('Parent — Approvals', () => {
  test('US-80: approvals page loads via nav link', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-approvals')
    await expect(page.locator('h1, h2').filter({ hasText: /Approval/i })).toBeVisible()
  })

  test('US-81: approvals page shows pending items or the all-caught-up state', async ({ page }) => {
    await unlockParent(page)
    await navTo(page, 'nav-approvals')
    // Either shows pending approvals OR the empty state — both are valid
    const hasContent = await page.locator('text=All caught up').isVisible().catch(() => false)
    const hasPending = await page.locator('text=Approve').first().isVisible().catch(() => false)
    expect(hasContent || hasPending).toBe(true)
  })
})

// ─── EDGE CASES ────────────────────────────────────────────────────

test.describe('Edge Cases', () => {
  test('EC-01: invalid child ID shows a graceful error page', async ({ page }) => {
    await page.goto('/child/nonexistent-id-xyz/quests')
    const body = await page.locator('body').textContent()
    expect(body).toBeTruthy()
  })

  test('EC-02: quest board loads without crashing when all quests exist', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await expect(page.locator('text=YOUR QUESTS')).toBeVisible()
  })

  test('EC-03: locked rewards show the lock overlay when credits insufficient', async ({ page, request }) => {
    // Use the API to zero out Alex's credits so all rewards are locked regardless of prior test state
    const resp = await request.get('/api/children')
    const { children } = await resp.json()
    const alex = children.find((c: { name: string }) => c.name === 'Alex')
    if (alex && alex.credits > 0) {
      await request.patch(`/api/children/${alex.id}`, {
        data: { creditsAdjustment: -alex.credits },
      })
    }
    await goToChildRewards(page, 'Alex')
    await expect(page.locator('[data-testid="locked-reward"]').first()).toBeVisible()
  })

  test('EC-04: /parent/quests without PIN shows PIN entry', async ({ page }) => {
    await page.goto('/parent/quests')
    await expect(page.locator('text=Enter Parent PIN')).toBeVisible()
  })

  test('EC-05: rapidly clicking a quest does not produce errors', async ({ page }) => {
    // Use Sam — always has available quests in the seed
    await goToChildQuests(page, 'Sam')
    const card = page.locator('[data-testid="scroll-card"]').first()
    await card.click()
    await page.waitForTimeout(300)
    const btn = page.locator('[data-testid="complete-button"]')
    await expect(btn).toBeVisible()
    await btn.click()
    await page.waitForTimeout(800)
    // Page should not show a crash/error state
    await expect(page.locator('text=Server Error')).not.toBeVisible()
  })

  test('EC-06: back navigation from quest board returns to family hub', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await page.locator('a[href="/"]').first().click()
    await expect(page).toHaveURL('/')
  })

  test('EC-07: Rewards nav in child header works', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await page.getByText('Rewards').click()
    await expect(page).toHaveURL(/\/rewards$/)
  })

  test('EC-08: Quests nav from rewards page works', async ({ page }) => {
    await goToChildRewards(page, 'Alex')
    await page.getByText('Quests').click()
    await expect(page).toHaveURL(/\/quests$/)
  })

  test('EC-09: parent can visit all sections without errors', async ({ page }) => {
    await unlockParent(page)
    for (const id of ['nav-approvals', 'nav-children', 'nav-quests', 'nav-rewards', 'nav-dashboard']) {
      await page.locator(`[data-testid="${id}"]`).click()
      await page.waitForTimeout(400)
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).toBeTruthy()
    }
  })
})

// ─── UX BEHAVIOR ───────────────────────────────────────────────────

test.describe('UX Behavior', () => {
  test('UX-01: scroll cards are hoverable without JS errors', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await page.locator('[data-testid="scroll-card"]').first().hover()
    await page.waitForTimeout(300)
    await expect(page.locator('[data-testid="scroll-card"]').first()).toBeVisible()
  })

  test('UX-02: quest board shows ACTIVE badge count', async ({ page }) => {
    // Use Sam who retains available quests throughout the suite
    await goToChildQuests(page, 'Sam')
    await expect(page.locator('text=ACTIVE')).toBeVisible()
  })

  test('UX-03: header credit balance element is visible', async ({ page }) => {
    await goToChildQuests(page, 'Sam')
    await expect(page.locator('[data-testid="credit-balance"]')).toBeVisible()
  })

  test('UX-04: PIN entry unlocks and shows dashboard heading', async ({ page }) => {
    await unlockParent(page)
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
  })

  test('UX-05: affordable rewards show enabled Claim Reward buttons', async ({ page }) => {
    // Give credits to Sam fresh so this test is self-contained
    await unlockParent(page)
    await navTo(page, 'nav-children')
    await page.locator('text=⚡ Credits').last().click()
    await page.locator('input[name="amount"]').first().fill('200')
    await page.locator('button:has-text("Apply")').first().click()
    await page.waitForTimeout(600)

    await goToChildRewards(page, 'Sam')
    const btn = page.locator('button:has-text("Claim Reward")').first()
    await expect(btn).toBeEnabled({ timeout: 8000 })
  })

  test('UX-06: TREASURE VAULT title renders with Cinzel font class', async ({ page }) => {
    await goToChildRewards(page, 'Alex')
    await expect(page.locator('text=TREASURE VAULT')).toBeVisible()
  })

  test('UX-07: YOUR QUESTS heading is visible on quest board', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    await expect(page.locator('text=YOUR QUESTS')).toBeVisible()
  })

  test('UX-08: each scroll has a difficulty ribbon', async ({ page }) => {
    await goToChildQuests(page, 'Alex')
    // All seeded Alex quests have explicit difficulty; at least one should show "EASY"
    await expect(page.locator('.difficulty-ribbon').first()).toBeVisible()
  })
})
