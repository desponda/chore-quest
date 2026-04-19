import { prisma } from '@/lib/db'
import { Icon } from '@iconify/react'
import { approveQuest, rejectQuest, approveRedemption, rejectRedemption } from '@/lib/actions'
import { resolveIcon } from '@/lib/icons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const pendingQuests = await prisma.questAssignment.findMany({
    where: { status: 'completed', child: { userId } },
    include: { quest: true, child: true },
    orderBy: { completedAt: 'desc' },
  })

  const pendingRedemptions = await prisma.redemption.findMany({
    where: { status: 'pending', child: { userId } },
    include: { reward: true, child: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Approvals</h1>

      {pendingQuests.length === 0 && pendingRedemptions.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-gray-400">All caught up! Nothing pending.</p>
        </div>
      )}

      {pendingQuests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-gray-300 font-semibold mb-4 uppercase tracking-wider text-xs">Quest Completions</h2>
          <div className="flex flex-col gap-3">
            {pendingQuests.map((a) => (
              <div key={a.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <Icon icon={resolveIcon(a.quest.emoji)} width={22} height={22} color="rgba(196,167,255,0.85)" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{a.quest.title}</div>
                  <div className="text-gray-400 text-sm">{a.child.name} · +{a.quest.credits}⚡</div>
                </div>
                <div className="flex gap-2">
                  <form action={approveQuest.bind(null, a.id)}>
                    <button className="bg-green-700 hover:bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-colors">
                      Approve
                    </button>
                  </form>
                  <form action={rejectQuest.bind(null, a.id)}>
                    <button className="bg-gray-700 hover:bg-red-900/50 text-gray-300 text-sm font-bold px-4 py-1.5 rounded-lg transition-colors">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRedemptions.length > 0 && (
        <div>
          <h2 className="text-gray-300 font-semibold mb-4 uppercase tracking-wider text-xs">Reward Requests</h2>
          <div className="flex flex-col gap-3">
            {pendingRedemptions.map((r) => (
              <div key={r.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Icon icon={resolveIcon(r.reward.emoji)} width={22} height={22} color="#fbbf24" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{r.reward.title}</div>
                  <div className="text-gray-400 text-sm">{r.child.name} · {r.reward.cost}⚡</div>
                </div>
                <div className="flex gap-2">
                  <form action={approveRedemption.bind(null, r.id)}>
                    <button className="bg-green-700 hover:bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-colors">
                      Approve
                    </button>
                  </form>
                  <form action={rejectRedemption.bind(null, r.id)}>
                    <button className="bg-gray-700 hover:bg-red-900/50 text-gray-300 text-sm font-bold px-4 py-1.5 rounded-lg transition-colors">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
