import { prisma } from '@/lib/db'
import { Icon } from '@iconify/react'
import { resolveIcon } from '@/lib/icons'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ParentDashboard() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [pendingApprovals, activeQuests, children, pendingRedemptions] = await Promise.all([
    prisma.questAssignment.count({ where: { status: 'completed', child: { userId } } }),
    prisma.quest.count({ where: { isActive: true, userId } }),
    prisma.child.count({ where: { userId } }),
    prisma.redemption.count({ where: { status: 'pending', child: { userId } } }),
  ])

  const recentAssignments = await prisma.questAssignment.findMany({
    where: { status: 'completed', child: { userId } },
    include: { quest: true, child: true },
    orderBy: { completedAt: 'desc' },
    take: 5,
  })

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard label="Pending Approvals" value={pendingApprovals + pendingRedemptions} color="yellow" icon="⏳" />
        <StatCard label="Active Quests" value={activeQuests} color="purple" icon="📜" />
        <StatCard label="Heroes" value={children} color="blue" icon="⚔️" />
        <StatCard label="Pending Rewards" value={pendingRedemptions} color="green" icon="🎁" />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-white font-bold mb-4">Recent Completions</h2>
        {recentAssignments.length === 0 ? (
          <p className="text-gray-500 text-sm">No quests completed yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentAssignments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <Icon icon={resolveIcon(a.quest.emoji)} width={20} height={20} color="rgba(196,167,255,0.8)" />
                <div>
                  <span className="text-white font-medium">{a.child.name}</span>
                  <span className="text-gray-400"> completed </span>
                  <span className="text-purple-300">{a.quest.title}</span>
                </div>
                <span className="ml-auto text-yellow-400">+{a.quest.credits}⚡</span>
              </div>
            ))}
          </div>
        )}
        {pendingApprovals + pendingRedemptions > 0 && (
          <Link
            href="/parent/approvals"
            className="mt-4 block text-center bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded-lg transition-colors text-sm"
          >
            Review {pendingApprovals + pendingRedemptions} Pending Items →
          </Link>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const colors: Record<string, string> = {
    yellow: 'border-yellow-500/30 bg-yellow-900/10',
    purple: 'border-purple-500/30 bg-purple-900/10',
    blue: 'border-blue-500/30 bg-blue-900/10',
    green: 'border-green-500/30 bg-green-900/10',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color] ?? colors.purple}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
      <div className="text-gray-400 text-xs">{label}</div>
    </div>
  )
}
