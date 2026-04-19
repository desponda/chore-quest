'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { redeemReward } from '@/lib/actions'
import { Reward } from '@/lib/types'
import { resolveIcon } from '@/lib/icons'

interface RewardShopProps {
  childId: string
  credits: number
  rewards: Reward[]
}

export function RewardShop({ childId, credits, rewards }: RewardShopProps) {
  const [currentCredits, setCurrentCredits] = useState(credits)
  const [isPending, startTransition] = useTransition()
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleRedeem = (reward: Reward) => {
    if (currentCredits < reward.cost) return
    setRedeemingId(reward.id)
    startTransition(async () => {
      const result = await redeemReward(reward.id, childId)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setCurrentCredits((c) => c - reward.cost)
        setMessage({ type: 'success', text: `🎉 "${reward.title}" sent to your parent for approval!` })
      }
      setRedeemingId(null)
    })
  }

  const sorted = [...rewards].sort((a, b) => {
    const aAfford = currentCredits >= a.cost ? 0 : 1
    const bAfford = currentCredits >= b.cost ? 0 : 1
    return aAfford - bAfford || a.cost - b.cost
  })

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="quest-header flex items-center justify-between">
        <h2 className="text-white text-2xl font-bold flex items-center gap-3" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}>
          <span className="text-3xl">🏆</span>
          <span>TREASURE VAULT</span>
        </h2>
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: 'linear-gradient(135deg, rgba(146,64,14,0.3), rgba(180,83,9,0.2))',
            border: '1px solid rgba(245,158,11,0.4)',
            boxShadow: '0 0 16px rgba(245,158,11,0.15)',
          }}
        >
          <Icon icon="game-icons:coins" width={20} height={20} color="#fbbf24" />
          <span className="text-amber-300 font-bold text-lg" data-testid="vault-credits">{currentCredits}</span>
          <span className="text-amber-500/60 text-xs" style={{ fontFamily: "'Cinzel', serif" }}>CREDITS</span>
        </div>
      </div>

      {/* Toast message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-4 rounded-xl text-sm font-medium"
            style={{
              background: message.type === 'success'
                ? 'rgba(22,163,74,0.15)'
                : 'rgba(239,68,68,0.15)',
              border: `1px solid ${message.type === 'success' ? 'rgba(22,163,74,0.4)' : 'rgba(239,68,68,0.4)'}`,
              color: message.type === 'success' ? '#86efac' : '#fca5a5',
            }}
          >
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sorted.map((reward) => {
          const canAfford = currentCredits >= reward.cost
          const shortfall = reward.cost - currentCredits

          return (
            <motion.div
              key={reward.id}
              layout
              data-testid={`reward-card-${reward.id}`}
              className="relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: canAfford
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                  : 'rgba(0,0,0,0.3)',
                border: canAfford
                  ? '1px solid rgba(245,158,11,0.35)'
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: canAfford ? '0 4px 24px rgba(245,158,11,0.08)' : 'none',
                opacity: canAfford ? 1 : 0.55,
              }}
              whileHover={canAfford ? { y: -3, boxShadow: '0 8px 32px rgba(245,158,11,0.15)' } : {}}
            >
              {/* Locked overlay */}
              {!canAfford && (
                <div data-testid="locked-reward" className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/30 z-10 backdrop-blur-[1px]">
                  <span className="text-2xl mb-1">🔒</span>
                  <span className="text-xs text-gray-400" style={{ fontFamily: "'Cinzel', serif" }}>
                    {shortfall} more credits
                  </span>
                </div>
              )}

              <div className="p-5">
                {/* Icon + cost badge */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: canAfford
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(146,64,14,0.3))'
                        : 'rgba(255,255,255,0.04)',
                      border: canAfford ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon
                      icon={resolveIcon(reward.emoji)}
                      width={34}
                      height={34}
                      color={canAfford ? '#fbbf24' : '#4b5563'}
                    />
                  </div>
                  <span className="credit-pill text-xs">
                    <Icon icon="game-icons:coins" width={14} height={14} color="#fef3c7" />
                    <span>{reward.cost}</span>
                  </span>
                </div>

                <h3
                  className="text-white font-bold text-base mb-1 leading-snug"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {reward.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">{reward.description}</p>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford || isPending}
                  data-testid={`redeem-${reward.id}`}
                  className="w-full py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={canAfford ? {
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    color: '#fef3c7',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.06em',
                    boxShadow: '0 4px 12px rgba(217,119,6,0.35)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.2)',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.06em',
                  }}
                >
                  {redeemingId === reward.id ? '⏳ Claiming...' : '🏆 Claim Reward'}
                </button>
              </div>
            </motion.div>
          )
        })}

        {rewards.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <div className="text-5xl mb-4">🏺</div>
            <p className="text-gray-500" style={{ fontFamily: "'Cinzel', serif" }}>The vault is empty.</p>
            <p className="text-gray-600 text-sm mt-2">Ask a parent to add rewards.</p>
          </div>
        )}
      </div>
    </div>
  )
}
