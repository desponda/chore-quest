import { prisma } from '@/lib/db'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { createQuest, deleteQuest, assignQuestToChild, unassignQuestFromChild } from '@/lib/actions'
import { IconPicker } from '@/components/IconPicker'
import { QUEST_ICON_OPTIONS, resolveIcon, DIFFICULTY_ICON_MAP, avatarSrc } from '@/lib/icons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DIFFICULTIES = ['easy', 'medium', 'hard', 'legendary']

const difficultyColors: Record<string, string> = {
  easy: '#16a34a', medium: '#d97706', hard: '#ea580c', legendary: '#7c3aed',
}
const difficultyLabels: Record<string, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard', legendary: 'Legendary',
}

export default async function QuestsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const quests = await prisma.quest.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      assignments: {
        include: { child: true },
      },
    },
  })
  const children = await prisma.child.findMany({ where: { userId }, orderBy: { name: 'asc' } })

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-2">Manage Quests</h1>
      <p className="text-gray-500 text-sm mb-8">
        Click a hero portrait to assign or remove a quest from them.
      </p>

      <div className="flex flex-col gap-4 mb-10">
        {quests.map((quest) => {
          const assignedIds = new Set(quest.assignments.map((a) => a.childId))

          return (
            <div
              key={quest.id}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-5"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
            >
              {/* Quest info row */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Icon icon={resolveIcon(quest.emoji)} width={28} height={28} color="rgba(196,167,255,0.85)" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-base">{quest.title}</div>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{quest.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${difficultyColors[quest.difficulty]}22`,
                        border: `1px solid ${difficultyColors[quest.difficulty]}60`,
                        color: difficultyColors[quest.difficulty],
                      }}
                    >
                      <Icon icon={DIFFICULTY_ICON_MAP[quest.difficulty] ?? 'game-icons:shield'} width={11} height={11} />
                      {difficultyLabels[quest.difficulty]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Icon icon="game-icons:coins" width={12} height={12} />
                      {quest.credits} credits
                    </span>
                    {quest.isGrabbable && (
                      <span data-testid="bonus-badge" className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                        ⚔️ BONUS
                      </span>
                    )}
                  </div>
                </div>

                <form action={deleteQuest.bind(null, quest.id)}>
                  <button className="text-gray-600 hover:text-red-400 transition-colors text-sm p-1" title="Delete quest">
                    <Icon icon="game-icons:trash-can" width={16} height={16} />
                  </button>
                </form>
              </div>

              {/* Hero assignment row — only for non-bonus quests */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                {quest.isGrabbable ? (
                  <div className="flex items-center gap-2 text-amber-500/70 text-xs">
                    <Icon icon="game-icons:crossed-swords" width={12} height={12} />
                    <span>Available to all heroes — anyone can claim this from their quest board</span>
                  </div>
                ) : children.length > 0 ? (
                  <>
                    <div className="text-gray-500 text-xs mb-3 flex items-center gap-1.5">
                      <Icon icon="game-icons:crossed-swords" width={11} height={11} />
                      <span>Assigned heroes — click to toggle</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {children.map((child) => {
                        const assigned = assignedIds.has(child.id)
                        return (
                          <form
                            key={child.id}
                            action={assigned
                              ? unassignQuestFromChild.bind(null, quest.id, child.id)
                              : assignQuestToChild.bind(null, quest.id, child.id)
                            }
                          >
                            <button
                              type="submit"
                              title={assigned ? `Remove from ${child.name}` : `Assign to ${child.name}`}
                              className="flex flex-col items-center gap-1.5"
                            >
                              <div
                                className="relative w-12 h-12 rounded-full overflow-hidden transition-all duration-200"
                                style={{
                                  boxShadow: assigned
                                    ? '0 0 0 3px #a855f7, 0 0 12px rgba(168,85,247,0.5)'
                                    : '0 0 0 2px rgba(255,255,255,0.1)',
                                  opacity: assigned ? 1 : 0.4,
                                  filter: assigned ? 'none' : 'grayscale(0.5)',
                                }}
                              >
                                <Image
                                  src={avatarSrc(child.avatar)}
                                  alt={child.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                                {assigned && (
                                  <div className="absolute inset-0 flex items-end justify-end p-0.5">
                                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                                      <Icon icon="game-icons:check-mark" width={10} height={10} color="white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span
                                className="text-xs font-medium"
                                style={{ color: assigned ? '#d8b4fe' : '#4b5563', fontSize: 11 }}
                              >
                                {child.name}
                              </span>
                            </button>
                          </form>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create new quest */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-white font-bold text-lg mb-1">Create New Quest</h2>
        <p className="text-gray-500 text-xs mb-5">You can assign it to heroes after creating it.</p>
        <form action={createQuest} className="flex flex-col gap-4">
          <input
            name="title"
            placeholder="Quest title (e.g. Slay the Dish Dragon)"
            required
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500"
          />
          <textarea
            name="description"
            placeholder="Quest description — make it epic!"
            required
            rows={2}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 resize-none"
          />
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Icon</label>
            <IconPicker name="emoji" options={QUEST_ICON_OPTIONS} defaultValue={QUEST_ICON_OPTIONS[0].id} />
          </div>
          <div className="flex gap-3">
            <select
              name="difficulty"
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{difficultyLabels[d]}</option>
              ))}
            </select>
            <input
              name="credits"
              type="number"
              placeholder="Credits"
              required
              min="1"
              className="w-32 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500"
            />
          </div>
          <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer select-none">
            <input type="checkbox" name="isGrabbable" className="rounded accent-purple-500" />
            <Icon icon="game-icons:crossed-swords" width={14} height={14} color="#fbbf24" />
            Bonus quest — any hero can grab this
          </label>
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2.5 rounded-xl transition-colors"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}
          >
            Create Quest
          </button>
        </form>
      </div>
    </div>
  )
}
