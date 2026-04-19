import { prisma } from '@/lib/db'
import { createChild } from '@/lib/actions'
import { ChildCard } from '@/components/ChildActions'
import { AvatarPicker } from '@/components/AvatarPicker'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const COLORS = ['blue', 'red', 'green', 'purple', 'yellow', 'pink']

export default async function ChildrenPage() {
  const session = await getServerSession(authOptions)
  const children = await prisma.child.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Manage Heroes</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
        {children.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-white font-bold mb-4">Add New Hero</h2>
        <form action={createChild} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Hero name"
            required
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Portrait</label>
            <AvatarPicker />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="color" value={c} className="sr-only" defaultChecked={c === 'blue'} />
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-${c}-400 bg-${c}-900/50 hover:scale-110 transition-transform`}
                    title={c}
                  />
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 rounded-lg transition-colors"
          >
            Add Hero
          </button>
        </form>
      </div>
    </div>
  )
}
