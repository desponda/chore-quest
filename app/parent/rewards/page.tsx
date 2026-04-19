import { prisma } from '@/lib/db'
import { Icon } from '@iconify/react'
import { createReward, deleteReward } from '@/lib/actions'
import { IconPicker } from '@/components/IconPicker'
import { REWARD_ICON_OPTIONS, resolveIcon } from '@/lib/icons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RewardsPage() {
  const session = await getServerSession(authOptions)
  const rewards = await prisma.reward.findMany({
    where: { userId: session!.user.id },
    orderBy: { cost: 'asc' },
  })

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Manage Rewards</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-8">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Icon icon={resolveIcon(reward.emoji)} width={24} height={24} color="#fbbf24" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold">{reward.title}</div>
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                <Icon icon="game-icons:coins" width={11} height={11} color="#fbbf24" />
                <span>{reward.cost} credits</span>
              </div>
            </div>
            <form action={deleteReward.bind(null, reward.id)}>
              <button className="text-gray-600 hover:text-red-400 transition-colors text-sm">Delete</button>
            </form>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-bold mb-4">Add New Reward</h2>
        <form action={createReward} className="flex flex-col gap-4">
          <input
            name="title"
            placeholder="Reward title"
            required
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <input
            name="description"
            placeholder="Description"
            required
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Icon</label>
            <IconPicker name="emoji" options={REWARD_ICON_OPTIONS} defaultValue={REWARD_ICON_OPTIONS[0].id} />
          </div>
          <input
            name="cost"
            type="number"
            placeholder="Credit cost"
            required
            min="1"
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 rounded-lg transition-colors"
          >
            Add Reward
          </button>
        </form>
      </div>
    </div>
  )
}
