'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Child } from '@/lib/types'
import { avatarSrc } from '@/lib/icons'

const colorThemes: Record<string, {
  bg: string
  border: string
  glow: string
  avatarBg: string
  avatarRing: string
  avatarGlow: string
  accentText: string
}> = {
  blue: {
    bg: 'linear-gradient(145deg, #050d1f 0%, #091a40 60%, #0c2255 100%)',
    border: 'linear-gradient(145deg, #3b82f6, #1d4ed8, #1e3a8a)',
    glow: 'rgba(59,130,246,0.45)',
    avatarBg: 'radial-gradient(circle at 35% 35%, #1d4ed8, #1e3a8a)',
    avatarRing: '#3b82f6',
    avatarGlow: 'rgba(59,130,246,0.5)',
    accentText: '#93c5fd',
  },
  red: {
    bg: 'linear-gradient(145deg, #1a0505 0%, #3d0a0a 60%, #521212 100%)',
    border: 'linear-gradient(145deg, #ef4444, #b91c1c, #7f1d1d)',
    glow: 'rgba(239,68,68,0.45)',
    avatarBg: 'radial-gradient(circle at 35% 35%, #b91c1c, #7f1d1d)',
    avatarRing: '#ef4444',
    avatarGlow: 'rgba(239,68,68,0.5)',
    accentText: '#fca5a5',
  },
  green: {
    bg: 'linear-gradient(145deg, #041408 0%, #0a2e12 60%, #0e3d18 100%)',
    border: 'linear-gradient(145deg, #22c55e, #15803d, #14532d)',
    glow: 'rgba(34,197,94,0.45)',
    avatarBg: 'radial-gradient(circle at 35% 35%, #15803d, #14532d)',
    avatarRing: '#22c55e',
    avatarGlow: 'rgba(34,197,94,0.5)',
    accentText: '#86efac',
  },
  purple: {
    bg: 'linear-gradient(145deg, #0d0520 0%, #1e0a45 60%, #280d5a 100%)',
    border: 'linear-gradient(145deg, #a855f7, #7e22ce, #581c87)',
    glow: 'rgba(168,85,247,0.5)',
    avatarBg: 'radial-gradient(circle at 35% 35%, #7e22ce, #581c87)',
    avatarRing: '#a855f7',
    avatarGlow: 'rgba(168,85,247,0.55)',
    accentText: '#d8b4fe',
  },
  yellow: {
    bg: 'linear-gradient(145deg, #1a1000 0%, #3d2a00 60%, #523800 100%)',
    border: 'linear-gradient(145deg, #eab308, #a16207, #713f12)',
    glow: 'rgba(234,179,8,0.45)',
    avatarBg: 'radial-gradient(circle at 35% 35%, #a16207, #713f12)',
    avatarRing: '#eab308',
    avatarGlow: 'rgba(234,179,8,0.5)',
    accentText: '#fde047',
  },
  pink: {
    bg: 'linear-gradient(145deg, #1a0510 0%, #3d0a22 60%, #52103a 100%)',
    border: 'linear-gradient(145deg, #ec4899, #be185d, #831843)',
    glow: 'rgba(236,72,153,0.45)',
    avatarBg: 'radial-gradient(circle at 35% 35%, #be185d, #831843)',
    avatarRing: '#ec4899',
    avatarGlow: 'rgba(236,72,153,0.5)',
    accentText: '#f9a8d4',
  },
}

export function ChildCard({ child }: { child: Child }) {
  const theme = colorThemes[child.color] ?? colorThemes.blue

  return (
    <Link href={`/child/${child.id}/quests`} data-testid={`hero-card-${child.name.toLowerCase()}`}>
      <div
        className="hero-card w-52 p-6 flex flex-col items-center gap-4 select-none"
        style={{
          background: theme.bg,
          '--card-border-gradient': theme.border,
          '--glow-color': theme.glow,
          animation: 'glow-pulse 3s ease-in-out infinite',
          boxShadow: `0 0 20px ${theme.glow}, 0 8px 32px rgba(0,0,0,0.6)`,
        } as React.CSSProperties}
      >
        {/* Portrait avatar */}
        <div
          className="relative rounded-full overflow-hidden flex-shrink-0"
          style={{
            width: 80,
            height: 80,
            boxShadow: `0 0 0 3px ${theme.avatarRing}, 0 0 20px ${theme.avatarGlow}, 0 4px 16px rgba(0,0,0,0.6)`,
          }}
        >
          <Image
            src={avatarSrc(child.avatar)}
            alt={child.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        {/* Name */}
        <div
          className="text-white text-xl font-bold tracking-wide text-center"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {child.name}
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.avatarRing}60, transparent)` }} />

        {/* Stats */}
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="credit-pill text-sm">
            <Icon icon="game-icons:coins" width={15} height={15} color="#fef3c7" />
            <span>{child.credits} credits</span>
          </span>
          {child.streak > 0 && (
            <div className="flex items-center gap-1.5" style={{ color: theme.accentText }}>
              <Icon icon="game-icons:fire" width={15} height={15} color={theme.accentText} />
              <span className="text-sm font-semibold">{child.streak} day streak</span>
            </div>
          )}
        </div>

        {/* Tap cue */}
        <div className="text-xs opacity-40 mt-1" style={{ color: theme.accentText, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
          TAP TO ENTER
        </div>
      </div>
    </Link>
  )
}
