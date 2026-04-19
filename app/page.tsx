import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ChildCard } from '@/components/ChildCard'
import { Icon } from '@iconify/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Fixed star positions — avoids server/client mismatch and re-renders
const STARS = [
  { top: '4%',  left: '12%',  size: 2, delay: '0s',   dur: '3s' },
  { top: '8%',  left: '38%',  size: 1, delay: '1.2s', dur: '4s' },
  { top: '15%', left: '72%',  size: 3, delay: '0.4s', dur: '2.5s' },
  { top: '20%', left: '55%',  size: 1, delay: '2.1s', dur: '3.5s' },
  { top: '22%', left: '88%',  size: 2, delay: '0.8s', dur: '4.5s' },
  { top: '28%', left: '6%',   size: 1, delay: '1.8s', dur: '3s' },
  { top: '32%', left: '25%',  size: 2, delay: '0.2s', dur: '5s' },
  { top: '35%', left: '48%',  size: 1, delay: '3s',   dur: '3.5s' },
  { top: '40%', left: '80%',  size: 3, delay: '1.5s', dur: '2.8s' },
  { top: '45%', left: '15%',  size: 1, delay: '0.6s', dur: '4s' },
  { top: '50%', left: '62%',  size: 2, delay: '2.4s', dur: '3.2s' },
  { top: '55%', left: '92%',  size: 1, delay: '0.9s', dur: '4.8s' },
  { top: '60%', left: '35%',  size: 2, delay: '1.3s', dur: '3s' },
  { top: '65%', left: '70%',  size: 1, delay: '2.7s', dur: '3.8s' },
  { top: '70%', left: '8%',   size: 3, delay: '0.5s', dur: '2.5s' },
  { top: '75%', left: '50%',  size: 1, delay: '1.6s', dur: '4.2s' },
  { top: '80%', left: '82%',  size: 2, delay: '0.3s', dur: '3.6s' },
  { top: '85%', left: '28%',  size: 1, delay: '2s',   dur: '5s' },
  { top: '88%', left: '65%',  size: 2, delay: '1.1s', dur: '3s' },
  { top: '92%', left: '45%',  size: 1, delay: '3.2s', dur: '4s' },
  { top: '7%',  left: '95%',  size: 2, delay: '0.7s', dur: '3.3s' },
  { top: '18%', left: '2%',   size: 1, delay: '2.5s', dur: '4.5s' },
  { top: '42%', left: '42%',  size: 3, delay: '1.4s', dur: '2.7s' },
  { top: '58%', left: '18%',  size: 1, delay: '0.1s', dur: '3.9s' },
  { top: '73%', left: '90%',  size: 2, delay: '2.2s', dur: '3.1s' },
  { top: '3%',  left: '60%',  size: 1, delay: '1.7s', dur: '4.7s' },
  { top: '12%', left: '82%',  size: 2, delay: '0s',   dur: '3.4s' },
  { top: '48%', left: '3%',   size: 1, delay: '2.9s', dur: '4.1s' },
  { top: '62%', left: '55%',  size: 3, delay: '0.4s', dur: '2.9s' },
  { top: '95%', left: '75%',  size: 1, delay: '1.9s', dur: '3.7s' },
]

export default async function FamilyHub() {
  const session = await getServerSession(authOptions)
  const children = await prisma.child.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0a3e 0%, #0d0b1e 50%, #060410 100%)' }}
    >
      {/* Star field */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}

      {/* Nebula glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{ width: 500, height: 300, top: '10%', left: '-5%', background: 'radial-gradient(circle, #7c3aed, transparent)' }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-8"
          style={{ width: 400, height: 300, top: '50%', right: '-5%', background: 'radial-gradient(circle, #1d4ed8, transparent)' }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-6"
          style={{ width: 300, height: 200, bottom: '15%', left: '30%', background: 'radial-gradient(circle, #be185d, transparent)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 py-12 w-full max-w-3xl">
        {/* Logo / Title */}
        <div className="text-center mb-2">
          <div className="mb-3 flex justify-center">
            <Icon icon="game-icons:crossed-swords" width={52} height={52} color="rgba(196,167,255,0.9)" style={{ filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.8))' }} />
          </div>
          <h1
            className="text-5xl sm:text-6xl font-black text-white tracking-widest leading-none"
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              textShadow: '0 0 24px rgba(168,85,247,0.9), 0 0 60px rgba(168,85,247,0.4), 0 2px 0 rgba(0,0,0,0.8)',
            }}
          >
            CHORE QUEST
          </h1>
          <p
            className="mt-3 text-sm tracking-[0.3em] uppercase"
            style={{ color: 'rgba(196,167,255,0.7)', fontFamily: "'Cinzel', serif" }}
          >
            Choose Your Hero
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 my-8 w-full max-w-sm">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.5))' }} />
          <span className="text-purple-400/60 text-sm">✦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(168,85,247,0.5))' }} />
        </div>

        {/* Hero cards */}
        <div className="flex flex-wrap gap-6 justify-center">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
          {children.length === 0 && (
            <div className="text-center py-12">
              <p className="text-purple-300/60 text-base" style={{ fontFamily: "'Cinzel', serif" }}>
                No heroes yet.
              </p>
              <p className="text-purple-400/40 text-sm mt-2">A parent must add heroes first.</p>
            </div>
          )}
        </div>

        {/* Bottom decorative divider */}
        <div className="flex items-center gap-4 mt-10 w-full max-w-sm">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.3))' }} />
          <span className="text-purple-400/40 text-sm">✦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(168,85,247,0.3))' }} />
        </div>
      </div>

      {/* Parent access */}
      <Link
        href="/parent"
        className="absolute bottom-5 right-5 z-10 text-gray-600 hover:text-gray-400 transition-all duration-200 hover:scale-110"
        title="Parent Access"
        aria-label="Parent Access"
        data-testid="parent-lock"
      >
        <span className="text-xl">🔐</span>
      </Link>
    </div>
  )
}
