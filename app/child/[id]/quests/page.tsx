import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { ScrollCard, GrabScrollCard } from '@/components/ScrollCard'

function SectionDivider({ icon, label, sub }: { icon: string; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <Icon icon={icon} width={18} height={18} color="rgba(196,167,255,0.6)" />
      <span
        className="text-xs font-bold tracking-[0.2em] uppercase"
        style={{ color: 'rgba(196,167,255,0.6)', fontFamily: "'Cinzel', serif" }}
      >
        {label}
      </span>
      {sub && (
        <span className="text-xs text-gray-600" style={{ fontFamily: "'Cinzel', serif" }}>
          — {sub}
        </span>
      )}
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(168,85,247,0.3), transparent)' }} />
    </div>
  )
}

type Assignment = {
  id: string
  questId: string
  childId: string
  status: string
  completedAt: Date | null
  quest: {
    id: string
    title: string
    description: string
    emoji: string
    credits: number
    difficulty: string
    isGrabbable: boolean
    isActive: boolean
  }
}

export default async function QuestBoard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const child = await prisma.child.findUnique({ where: { id } })
  if (!child) notFound()

  const assignments = await prisma.questAssignment.findMany({
    where: { childId: id },
    include: { quest: true },
    orderBy: { createdAt: 'asc' },
  })

  const myQuestIds = new Set(assignments.map((a) => a.questId))

  const grabbableQuests = await prisma.quest.findMany({
    where: { isGrabbable: true, isActive: true, userId: child.userId },
    orderBy: { credits: 'desc' },
  })

  const availableGrabs = grabbableQuests.filter((q) => !myQuestIds.has(q.id))

  const active = assignments.filter((a) => a.status === 'available')
  const completed = assignments.filter((a) => a.status !== 'available')

  const toAssignment = (a: typeof assignments[0]): Assignment => ({
    id: a.id,
    questId: a.questId,
    childId: a.childId,
    status: a.status,
    completedAt: a.completedAt,
    quest: {
      id: a.quest.id,
      title: a.quest.title,
      description: a.quest.description,
      emoji: a.quest.emoji,
      credits: a.quest.credits,
      difficulty: a.quest.difficulty,
      isGrabbable: a.quest.isGrabbable,
      isActive: a.quest.isActive,
    },
  })

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="quest-header flex items-center gap-3 mb-6">
        <Icon icon="game-icons:scroll-unfurled" width={24} height={24} color="rgba(196,167,255,0.8)" />
        <h2
          className="text-white text-2xl font-bold tracking-wide"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}
        >
          YOUR QUESTS
        </h2>
        {active.length > 0 && (
          <span
            className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#d8b4fe', fontFamily: "'Cinzel', serif" }}
          >
            {active.length} ACTIVE
          </span>
        )}
      </div>

      {/* All-done state */}
      {active.length === 0 && availableGrabs.length === 0 && (
        <div className="text-center py-12">
          <Icon icon="game-icons:trophy" width={56} height={56} color="#fbbf24" className="mx-auto mb-4" />
          <p
            className="text-purple-300 text-lg"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            All quests complete! You are a true hero.
          </p>
        </div>
      )}

      {/* Assigned quests */}
      {active.length > 0 && (
        <div className="flex flex-col gap-5">
          {active.map((a) => (
            <ScrollCard key={a.id} assignment={toAssignment(a) as Parameters<typeof ScrollCard>[0]['assignment']} childId={id} />
          ))}
        </div>
      )}

      {/* Up for Grabs section */}
      {availableGrabs.length > 0 && (
        <div>
          <SectionDivider
            icon="game-icons:crossed-swords"
            label="Up for Grabs"
            sub="any hero can claim these"
          />
          <div className="flex flex-col gap-5">
            {availableGrabs.map((quest) => (
              <GrabScrollCard
                key={quest.id}
                questId={quest.id}
                title={quest.title}
                emoji={quest.emoji}
                credits={quest.credits}
                difficulty={quest.difficulty}
                description={quest.description}
                childId={id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed quests */}
      {completed.length > 0 && (
        <div>
          <SectionDivider icon="game-icons:check-mark" label="Completed" />
          <div className="flex flex-col gap-4">
            {completed.map((a) => (
              <ScrollCard key={a.id} assignment={toAssignment(a) as Parameters<typeof ScrollCard>[0]['assignment']} childId={id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
