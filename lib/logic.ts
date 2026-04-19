/**
 * Pure business logic functions — no side effects, no DB calls.
 * These are unit-testable in isolation.
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'legendary'
export type QuestStatus = 'available' | 'completed' | 'approved'
export type RedemptionStatus = 'pending' | 'approved' | 'rejected'

/** Credits can never go below 0 */
export function applyCreditsAdjustment(current: number, delta: number): number {
  return Math.max(0, current + delta)
}

/** Returns true when a child has enough credits to claim a reward */
export function canAffordReward(credits: number, cost: number): boolean {
  return credits >= cost && cost > 0
}

/** How many more credits are needed */
export function creditShortfall(credits: number, cost: number): number {
  return Math.max(0, cost - credits)
}

/** Validate a 4-digit PIN entry */
export function validatePin(input: string, stored: string): boolean {
  return input.length === 4 && /^\d{4}$/.test(input) && input === stored
}

/** Whether a PIN input string is valid format */
export function isPinFormatValid(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/** Map a difficulty string to its display label */
export function difficultyLabel(difficulty: string): string {
  return difficulty.toUpperCase()
}

/** Map a difficulty to its credit multiplier bonus (legendary quests pay 2x) */
export function difficultyMultiplier(difficulty: Difficulty): number {
  const map: Record<Difficulty, number> = { easy: 1, medium: 1, hard: 1, legendary: 2 }
  return map[difficulty] ?? 1
}

/** Whether a streak is active (child completed a quest today) */
export function isStreakActive(lastActive: Date | null, now: Date): boolean {
  if (!lastActive) return false
  const diffMs = now.getTime() - lastActive.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays < 1
}

/** Calculate next streak value: +1 if yesterday was last active, reset to 1 otherwise */
export function nextStreak(currentStreak: number, lastActive: Date | null, now: Date): number {
  if (!lastActive) return 1
  const diffMs = now.getTime() - lastActive.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays < 2) return currentStreak + 1 // continued streak
  return 1 // streak broken, restart
}

/** Whether a quest assignment can be completed (only available quests can be completed) */
export function canCompleteQuest(status: QuestStatus): boolean {
  return status === 'available'
}

/** Whether a quest assignment can be approved (only completed quests can be approved) */
export function canApproveQuest(status: QuestStatus): boolean {
  return status === 'completed'
}

/** Whether a redemption is pending (can be approved/rejected) */
export function isRedemptionPending(status: RedemptionStatus): boolean {
  return status === 'pending'
}

/** Validate credit adjustment input from a form */
export function parseCreditsAdjustment(raw: string | null): { valid: true; amount: number } | { valid: false; reason: string } {
  if (!raw || raw.trim() === '') return { valid: false, reason: 'Amount is required' }
  const n = parseInt(raw, 10)
  if (isNaN(n)) return { valid: false, reason: 'Amount must be a number' }
  if (n === 0) return { valid: false, reason: 'Amount cannot be zero' }
  if (Math.abs(n) > 10000) return { valid: false, reason: 'Amount too large (max ±10,000)' }
  return { valid: true, amount: n }
}

/** Validate quest creation form data */
export function validateQuestInput(data: {
  title: string
  description: string
  emoji: string
  credits: string
  difficulty: string
}): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = []
  if (!data.title.trim()) errors.push('Title is required')
  if (data.title.length > 100) errors.push('Title must be 100 characters or fewer')
  if (!data.description.trim()) errors.push('Description is required')
  if (!data.emoji.trim()) errors.push('Emoji is required')
  const credits = parseInt(data.credits, 10)
  if (isNaN(credits) || credits <= 0) errors.push('Credits must be a positive number')
  if (credits > 10000) errors.push('Credits cannot exceed 10,000')
  const validDifficulties = ['easy', 'medium', 'hard', 'legendary']
  if (!validDifficulties.includes(data.difficulty)) errors.push('Invalid difficulty')
  return errors.length === 0 ? { valid: true } : { valid: false, errors }
}

/** Validate reward creation */
export function validateRewardInput(data: {
  title: string
  description: string
  emoji: string
  cost: string
}): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = []
  if (!data.title.trim()) errors.push('Title is required')
  if (data.title.length > 100) errors.push('Title must be 100 characters or fewer')
  if (!data.emoji.trim()) errors.push('Emoji is required')
  const cost = parseInt(data.cost, 10)
  if (isNaN(cost) || cost <= 0) errors.push('Cost must be a positive number')
  if (cost > 10000) errors.push('Cost cannot exceed 10,000')
  return errors.length === 0 ? { valid: true } : { valid: false, errors }
}
