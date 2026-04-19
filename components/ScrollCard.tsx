'use client'

import { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { completeQuest, grabQuest } from '@/lib/actions'
import { QuestAssignment } from '@/lib/types'
import { resolveIcon, DIFFICULTY_ICON_MAP } from '@/lib/icons'

const difficultyConfig: Record<string, { label: string; bg: string; glow: string }> = {
  easy:      { label: 'EASY',      bg: '#16a34a', glow: 'rgba(22,163,74,0.5)' },
  medium:    { label: 'MEDIUM',    bg: '#d97706', glow: 'rgba(217,119,6,0.5)' },
  hard:      { label: 'HARD',      bg: '#ea580c', glow: 'rgba(234,88,12,0.5)' },
  legendary: { label: 'LEGENDARY', bg: '#7c3aed', glow: 'rgba(124,58,237,0.6)' },
}

function SparkleEffect({ onDone }: { onDone: () => void }) {
  const particles = ['✨', '⭐', '🌟', '💫', '✨', '⭐', '🌟', '💫']
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <>
      {particles.map((p, i) => {
        const rad = (angles[i] * Math.PI) / 180
        const tx = `${Math.cos(rad) * 60}px`
        const ty = `${Math.sin(rad) * 60}px`
        return (
          <span
            key={i}
            className="sparkle-particle"
            style={{ '--tx': tx, '--ty': ty } as React.CSSProperties}
            onAnimationEnd={i === 0 ? onDone : undefined}
          >
            {p}
          </span>
        )
      })}
    </>
  )
}

function FloatingCredits({ amount }: { amount: number }) {
  return <span className="float-credit">+{amount} 🪙</span>
}

interface ScrollCardProps {
  assignment: QuestAssignment
  childId: string
}

export function ScrollCard({ assignment, childId }: ScrollCardProps) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(assignment.status !== 'available')
  const [showSparkle, setShowSparkle] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [isPending, startTransition] = useTransition()
  const cardRef = useRef<HTMLDivElement>(null)
  const { quest } = assignment

  const diff = difficultyConfig[quest.difficulty] ?? difficultyConfig.easy
  const isCompleted = assignment.status !== 'available' || done

  const handleComplete = () => {
    startTransition(async () => {
      await completeQuest(assignment.id, childId)
      setDone(true)
      setOpen(false)
      setShowSparkle(true)
      setShowCredits(true)
    })
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      data-quest-title={quest.title}
      data-testid="scroll-card"
      className="relative"
      style={{ filter: isCompleted ? 'none' : 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))' }}
      whileHover={isCompleted ? {} : { y: -2 }}
    >
      {/* Floating effects */}
      {showSparkle && <SparkleEffect onDone={() => setShowSparkle(false)} />}
      {showCredits && (
        <FloatingCredits amount={quest.credits} />
      )}

      {/* Top rod — SVG cylinder */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/scroll-cap.svg" alt="" aria-hidden="true" className="scroll-rod-svg scroll-rod-top-svg" />

      {/* Parchment body */}
      <motion.div
        onClick={() => !isCompleted && setOpen((o) => !o)}
        className={`scroll-parchment px-8 pt-10 pb-8 relative overflow-hidden cursor-pointer ${isCompleted ? 'completed' : ''}`}
        animate={isCompleted ? { opacity: 0.6 } : { opacity: 1 }}
      >
        {/* Difficulty ribbon */}
        <div
          className="difficulty-ribbon"
          style={{ background: diff.bg, boxShadow: `0 2px 8px ${diff.glow}` }}
        >
          <Icon icon={DIFFICULTY_ICON_MAP[quest.difficulty] ?? 'game-icons:shield'} width={12} height={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          {diff.label}
        </div>

        {/* Bonus quest banner */}
        {quest.isGrabbable && !isCompleted && (
          <div className="bonus-banner">
            <Icon icon="game-icons:crossed-swords" width={12} height={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            BONUS QUEST
          </div>
        )}

        {/* Quest content */}
        <div className="flex items-start gap-4 mt-2">
          <div
            className="flex-shrink-0 mt-1"
            style={{ opacity: isCompleted ? 0.5 : 1 }}
          >
            <Icon
              icon={resolveIcon(quest.emoji)}
              width={44}
              height={44}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(120,70,10,0.3))' }}
              color="#78350f"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-heading text-gray-900 font-bold text-base leading-snug"
              style={{
                fontFamily: "'Cinzel', serif",
                textDecoration: isCompleted ? 'line-through' : 'none',
                opacity: isCompleted ? 0.6 : 1,
              }}
            >
              {quest.title}
            </h3>

            <div className="flex items-center gap-2 mt-2">
              <span className="credit-pill">
                <Icon icon="game-icons:coins" width={14} height={14} color="#fef3c7" />
                <span>{quest.credits}</span>
              </span>
              {!isCompleted && (
                <span className="text-amber-800/60 text-xs italic">
                  {open ? 'tap to close' : 'tap to open'}
                </span>
              )}
            </div>
          </div>

          {isCompleted && (
            <div className="wax-seal flex-shrink-0">✓</div>
          )}
        </div>

        {/* Expanded quest content */}
        <AnimatePresence>
          {open && !isCompleted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-amber-800/20">
                <p
                  className="text-gray-700 text-sm leading-relaxed italic"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  "{quest.description}"
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleComplete() }}
                  disabled={isPending}
                  className="mt-4 w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: 'white',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
                  }}
                  data-testid="complete-button"
                >
                  {isPending ? '⏳ Completing...' : '⚔️ Accept & Complete'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom rod — SVG cylinder */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/scroll-cap.svg" alt="" aria-hidden="true" className="scroll-rod-svg scroll-rod-bottom-svg" />
    </motion.div>
  )
}

interface GrabScrollCardProps {
  questId: string
  title: string
  emoji: string
  credits: number
  difficulty: string
  description: string
  childId: string
}

export function GrabScrollCard({ questId, title, emoji, credits, difficulty, description, childId }: GrabScrollCardProps) {
  const [grabbed, setGrabbed] = useState(false)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const diff = difficultyConfig[difficulty] ?? difficultyConfig.easy

  const handleGrab = (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      await grabQuest(questId, childId)
      setGrabbed(true)
    })
  }

  if (grabbed) return null

  return (
    <motion.div
      layout
      data-testid="grab-scroll-card"
      className="relative"
      style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))' }}
      whileHover={{ y: -2 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/scroll-cap.svg" alt="" aria-hidden="true" className="scroll-rod-svg scroll-rod-top-svg" />

      <motion.div
        onClick={() => setOpen((o) => !o)}
        className="scroll-parchment px-8 pt-10 pb-8 relative overflow-hidden cursor-pointer"
      >
        <div
          className="difficulty-ribbon"
          style={{ background: diff.bg, boxShadow: `0 2px 8px ${diff.glow}` }}
        >
          {diff.label}
        </div>
        <div className="bonus-banner">
          <Icon icon="game-icons:crossed-swords" width={12} height={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          BONUS QUEST
        </div>

        <div className="flex items-start gap-4 mt-2">
          <div className="flex-shrink-0 mt-1">
            <Icon icon={resolveIcon(emoji)} width={44} height={44} color="#78350f" style={{ filter: 'drop-shadow(0 2px 4px rgba(120,70,10,0.3))' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-gray-900 font-bold text-base leading-snug"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {title}
            </h3>
            <div className="mt-2">
              <span className="credit-pill">
                <Icon icon="game-icons:coins" width={14} height={14} color="#fef3c7" />
                <span>{credits}</span>
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-amber-800/20">
                <p
                  className="text-gray-700 text-sm leading-relaxed italic"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  "{description}"
                </p>
                <button
                  onClick={handleGrab}
                  disabled={isPending}
                  className="mt-4 w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #b45309, #92400e)',
                    color: 'white',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 12px rgba(180,83,9,0.4)',
                  }}
                >
                  {isPending ? '⏳ Claiming...' : '⚔️ Grab This Quest!'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/scroll-cap.svg" alt="" aria-hidden="true" className="scroll-rod-svg scroll-rod-bottom-svg" />
    </motion.div>
  )
}
