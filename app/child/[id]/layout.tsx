import Link from 'next/link'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { avatarSrc } from '@/lib/icons'

const colorAccents: Record<string, { border: string; glow: string; text: string }> = {
  blue:   { border: '#3b82f6', glow: 'rgba(59,130,246,0.25)', text: '#93c5fd' },
  red:    { border: '#ef4444', glow: 'rgba(239,68,68,0.25)',  text: '#fca5a5' },
  green:  { border: '#22c55e', glow: 'rgba(34,197,94,0.25)',  text: '#86efac' },
  purple: { border: '#a855f7', glow: 'rgba(168,85,247,0.25)', text: '#d8b4fe' },
  yellow: { border: '#eab308', glow: 'rgba(234,179,8,0.25)',  text: '#fde047' },
  pink:   { border: '#ec4899', glow: 'rgba(236,72,153,0.25)', text: '#f9a8d4' },
}

export default async function ChildLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const child = await prisma.child.findUnique({ where: { id } })
  if (!child) notFound()

  const accent = colorAccents[child.color] ?? colorAccents.purple

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #080614 0%, #0f0826 50%, #080e1e 100%)' }}
    >
      {/* Header bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4"
        style={{
          background: 'rgba(8,6,20,0.85)',
          borderColor: `${accent.border}30`,
          boxShadow: `0 2px 24px ${accent.glow}`,
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Back + identity */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" title="Back to hero select">
            <div
              className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ boxShadow: `0 0 0 2px ${accent.border}80, 0 0 8px ${accent.glow}` }}
            >
              <Image src={avatarSrc(child.avatar)} alt={child.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="hidden sm:block">
              <div
                className="font-bold text-base text-white leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {child.name}
              </div>
              <div className="text-xs mt-0.5 opacity-60" style={{ color: accent.text }}>
                Hero
              </div>
            </div>
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            <span className="credit-pill text-sm" data-testid="credit-balance">
              <Icon icon="game-icons:coins" width={16} height={16} color="#fef3c7" />
              <span>{child.credits}</span>
            </span>
            {child.streak > 0 && (
              <div
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', color: '#fb923c' }}
              >
                <Icon icon="game-icons:fire" width={16} height={16} color="#fb923c" />
                <span>{child.streak}d</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex gap-1 flex-shrink-0">
            {[
              { href: `/child/${id}/quests`, label: '📜 Quests' },
              { href: `/child/${id}/rewards`, label: '🏆 Rewards' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:text-white"
                style={{ color: accent.text, fontFamily: "'Cinzel', serif", fontSize: '12px', letterSpacing: '0.04em' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Thin color accent line */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(to right, transparent, ${accent.border}, transparent)` }}
      />

      <main className="max-w-2xl mx-auto px-4 py-8 page-enter">
        {children}
      </main>
    </div>
  )
}
