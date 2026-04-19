'use client'

import { useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { deleteChild, adjustCredits } from '@/lib/actions'
import { avatarSrc } from '@/lib/icons'

interface Child {
  id: string
  name: string
  avatar: string
  credits: number
  streak: number
}

export function ChildCard({ child }: { child: Child }) {
  const [adjusting, setAdjusting] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  async function handleDelete() {
    if (!confirm(`Remove ${child.name}? This cannot be undone.`)) return
    await deleteChild(child.id)
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-700">
          <Image src={avatarSrc(child.avatar)} alt={child.name} fill className="object-cover" sizes="40px" />
        </div>
        <div className="flex-1">
          <div className="text-white font-bold">{child.name}</div>
          <div className="text-gray-400 text-sm">⚡ {child.credits} credits · 🔥 {child.streak} streak</div>
        </div>
        <button
          onClick={() => setAdjusting((v) => !v)}
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          {adjusting ? 'Cancel' : '⚡ Credits'}
        </button>
        <button onClick={handleDelete} className="text-gray-600 hover:text-red-400 transition-colors text-sm">
          Remove
        </button>
      </div>

      {adjusting && (
        <form
          action={adjustCredits}
          onSubmit={() => setAdjusting(false)}
          className="flex gap-2 items-center"
        >
          <input type="hidden" name="childId" value={child.id} />
          <input
            ref={amountRef}
            name="amount"
            type="number"
            placeholder="e.g. 10 or -5"
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            Apply
          </button>
          <span className="text-gray-500 text-xs">Use negative to deduct</span>
        </form>
      )}
    </div>
  )
}
