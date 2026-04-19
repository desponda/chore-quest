import { describe, it, expect } from 'vitest'
import {
  applyCreditsAdjustment,
  canAffordReward,
  creditShortfall,
  validatePin,
  isPinFormatValid,
  difficultyLabel,
  difficultyMultiplier,
  isStreakActive,
  nextStreak,
  canCompleteQuest,
  canApproveQuest,
  isRedemptionPending,
  parseCreditsAdjustment,
  validateQuestInput,
  validateRewardInput,
} from '@/lib/logic'

// ─── Credits ───────────────────────────────────────────────────────

describe('applyCreditsAdjustment', () => {
  it('adds positive credits', () => {
    expect(applyCreditsAdjustment(10, 5)).toBe(15)
  })

  it('deducts negative credits', () => {
    expect(applyCreditsAdjustment(20, -8)).toBe(12)
  })

  it('clamps to 0 when deduction exceeds balance', () => {
    expect(applyCreditsAdjustment(5, -100)).toBe(0)
  })

  it('stays at 0 when balance is already 0', () => {
    expect(applyCreditsAdjustment(0, -10)).toBe(0)
  })

  it('handles exact deduction to 0', () => {
    expect(applyCreditsAdjustment(15, -15)).toBe(0)
  })

  it('handles large additions', () => {
    expect(applyCreditsAdjustment(1000, 9000)).toBe(10000)
  })
})

// ─── Reward affordability ───────────────────────────────────────────

describe('canAffordReward', () => {
  it('returns true when credits exceed cost', () => {
    expect(canAffordReward(50, 30)).toBe(true)
  })

  it('returns true on exact match', () => {
    expect(canAffordReward(30, 30)).toBe(true)
  })

  it('returns false when credits are insufficient', () => {
    expect(canAffordReward(29, 30)).toBe(false)
  })

  it('returns false when credits are 0', () => {
    expect(canAffordReward(0, 1)).toBe(false)
  })

  it('returns false for zero-cost reward (data integrity guard)', () => {
    expect(canAffordReward(100, 0)).toBe(false)
  })
})

describe('creditShortfall', () => {
  it('returns the gap when insufficient', () => {
    expect(creditShortfall(20, 50)).toBe(30)
  })

  it('returns 0 when affordable', () => {
    expect(creditShortfall(50, 50)).toBe(0)
  })

  it('returns 0 when more than enough', () => {
    expect(creditShortfall(100, 50)).toBe(0)
  })
})

// ─── PIN validation ─────────────────────────────────────────────────

describe('validatePin', () => {
  it('accepts matching 4-digit PINs', () => {
    expect(validatePin('1234', '1234')).toBe(true)
  })

  it('rejects wrong PIN', () => {
    expect(validatePin('9999', '1234')).toBe(false)
  })

  it('rejects PIN that is too short', () => {
    expect(validatePin('123', '1234')).toBe(false)
  })

  it('rejects PIN that is too long', () => {
    expect(validatePin('12345', '1234')).toBe(false)
  })

  it('rejects PIN with non-digits', () => {
    expect(validatePin('12ab', '12ab')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validatePin('', '1234')).toBe(false)
  })

  it('accepts all-zero PIN', () => {
    expect(validatePin('0000', '0000')).toBe(true)
  })
})

describe('isPinFormatValid', () => {
  it('accepts 4 digits', () => {
    expect(isPinFormatValid('0000')).toBe(true)
    expect(isPinFormatValid('9999')).toBe(true)
  })

  it('rejects non-numeric input', () => {
    expect(isPinFormatValid('abcd')).toBe(false)
  })

  it('rejects wrong length', () => {
    expect(isPinFormatValid('123')).toBe(false)
    expect(isPinFormatValid('12345')).toBe(false)
  })
})

// ─── Difficulty ─────────────────────────────────────────────────────

describe('difficultyLabel', () => {
  it('uppercases difficulty', () => {
    expect(difficultyLabel('easy')).toBe('EASY')
    expect(difficultyLabel('legendary')).toBe('LEGENDARY')
  })
})

describe('difficultyMultiplier', () => {
  it('legendary quests pay double', () => {
    expect(difficultyMultiplier('legendary')).toBe(2)
  })

  it('other difficulties pay 1x', () => {
    expect(difficultyMultiplier('easy')).toBe(1)
    expect(difficultyMultiplier('medium')).toBe(1)
    expect(difficultyMultiplier('hard')).toBe(1)
  })
})

// ─── Streaks ────────────────────────────────────────────────────────

describe('isStreakActive', () => {
  it('returns false when lastActive is null', () => {
    expect(isStreakActive(null, new Date())).toBe(false)
  })

  it('returns true when lastActive was within the last 24h', () => {
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    expect(isStreakActive(twoHoursAgo, now)).toBe(true)
  })

  it('returns false when lastActive was more than 24h ago', () => {
    const now = new Date()
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    expect(isStreakActive(twoDaysAgo, now)).toBe(false)
  })
})

describe('nextStreak', () => {
  it('starts at 1 for first-ever completion', () => {
    expect(nextStreak(0, null, new Date())).toBe(1)
  })

  it('increments when continuing a streak', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000) // 20h ago
    expect(nextStreak(3, yesterday, now)).toBe(4)
  })

  it('resets to 1 when streak is broken', () => {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    expect(nextStreak(5, threeDaysAgo, now)).toBe(1)
  })
})

// ─── Quest/Approval status ──────────────────────────────────────────

describe('canCompleteQuest', () => {
  it('allows completing available quests', () => {
    expect(canCompleteQuest('available')).toBe(true)
  })

  it('blocks completing already-completed quests', () => {
    expect(canCompleteQuest('completed')).toBe(false)
    expect(canCompleteQuest('approved')).toBe(false)
  })
})

describe('canApproveQuest', () => {
  it('allows approving completed quests', () => {
    expect(canApproveQuest('completed')).toBe(true)
  })

  it('blocks approving available or already-approved quests', () => {
    expect(canApproveQuest('available')).toBe(false)
    expect(canApproveQuest('approved')).toBe(false)
  })
})

describe('isRedemptionPending', () => {
  it('returns true for pending redemptions', () => {
    expect(isRedemptionPending('pending')).toBe(true)
  })

  it('returns false for resolved redemptions', () => {
    expect(isRedemptionPending('approved')).toBe(false)
    expect(isRedemptionPending('rejected')).toBe(false)
  })
})

// ─── Input parsing & validation ─────────────────────────────────────

describe('parseCreditsAdjustment', () => {
  it('parses valid positive integers', () => {
    expect(parseCreditsAdjustment('10')).toEqual({ valid: true, amount: 10 })
  })

  it('parses valid negative integers', () => {
    expect(parseCreditsAdjustment('-5')).toEqual({ valid: true, amount: -5 })
  })

  it('rejects null', () => {
    const r = parseCreditsAdjustment(null)
    expect(r.valid).toBe(false)
  })

  it('rejects empty string', () => {
    const r = parseCreditsAdjustment('')
    expect(r.valid).toBe(false)
  })

  it('rejects zero', () => {
    const r = parseCreditsAdjustment('0')
    expect(r.valid).toBe(false)
  })

  it('rejects non-numeric string', () => {
    const r = parseCreditsAdjustment('abc')
    expect(r.valid).toBe(false)
  })

  it('rejects amounts over 10,000', () => {
    const r = parseCreditsAdjustment('10001')
    expect(r.valid).toBe(false)
  })

  it('accepts boundary value 10000', () => {
    expect(parseCreditsAdjustment('10000')).toEqual({ valid: true, amount: 10000 })
  })
})

describe('validateQuestInput', () => {
  const validInput = {
    title: 'Slay the Dragon',
    description: 'Do the thing',
    emoji: '🐉',
    credits: '20',
    difficulty: 'easy',
  }

  it('accepts valid input', () => {
    expect(validateQuestInput(validInput)).toEqual({ valid: true })
  })

  it('rejects empty title', () => {
    const r = validateQuestInput({ ...validInput, title: '' })
    expect(r.valid).toBe(false)
  })

  it('rejects title over 100 chars', () => {
    const r = validateQuestInput({ ...validInput, title: 'A'.repeat(101) })
    expect(r.valid).toBe(false)
  })

  it('rejects zero credits', () => {
    const r = validateQuestInput({ ...validInput, credits: '0' })
    expect(r.valid).toBe(false)
  })

  it('rejects negative credits', () => {
    const r = validateQuestInput({ ...validInput, credits: '-1' })
    expect(r.valid).toBe(false)
  })

  it('rejects invalid difficulty', () => {
    const r = validateQuestInput({ ...validInput, difficulty: 'impossible' })
    expect(r.valid).toBe(false)
  })

  it('rejects credits over 10000', () => {
    const r = validateQuestInput({ ...validInput, credits: '10001' })
    expect(r.valid).toBe(false)
  })

  it('returns all errors together', () => {
    const r = validateQuestInput({ title: '', description: '', emoji: '', credits: '0', difficulty: 'bad' })
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors.length).toBeGreaterThan(1)
  })
})

describe('validateRewardInput', () => {
  const validInput = {
    title: 'Movie Night',
    description: 'Pick any movie',
    emoji: '🎬',
    cost: '50',
  }

  it('accepts valid input', () => {
    expect(validateRewardInput(validInput)).toEqual({ valid: true })
  })

  it('rejects empty title', () => {
    const r = validateRewardInput({ ...validInput, title: '' })
    expect(r.valid).toBe(false)
  })

  it('rejects zero cost', () => {
    const r = validateRewardInput({ ...validInput, cost: '0' })
    expect(r.valid).toBe(false)
  })

  it('rejects negative cost', () => {
    const r = validateRewardInput({ ...validInput, cost: '-10' })
    expect(r.valid).toBe(false)
  })

  it('rejects cost over 10000', () => {
    const r = validateRewardInput({ ...validInput, cost: '10001' })
    expect(r.valid).toBe(false)
  })
})
