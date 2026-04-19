'use client'

import { useState, useTransition } from 'react'
import { verifyPin } from '@/lib/actions'
import { useRouter } from 'next/navigation'

export function ParentPin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    setError('')

    if (next.length === 4) {
      startTransition(async () => {
        const ok = await verifyPin(next)
        if (ok) {
          router.refresh()
        } else {
          setError('Wrong PIN. Try again.')
          setPin('')
        }
      })
    }
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-purple-500/50 rounded-2xl p-8 w-80 flex flex-col items-center gap-6 shadow-2xl shadow-purple-500/20">
        <div className="text-4xl">🔐</div>
        <h2 className="text-white text-xl font-bold">Enter Parent PIN</h2>

        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pin.length
                  ? 'bg-purple-400 border-purple-400'
                  : 'bg-transparent border-gray-500'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              data-digit={d}
              onClick={() => handleDigit(d)}
              disabled={isPending}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold rounded-xl py-3 transition-colors disabled:opacity-50"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="bg-gray-700 hover:bg-red-900/50 text-gray-400 text-sm rounded-xl py-3 transition-colors"
          >
            CLR
          </button>
          <button
            data-digit="0"
            onClick={() => handleDigit('0')}
            disabled={isPending}
            className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold rounded-xl py-3 transition-colors disabled:opacity-50"
          >
            0
          </button>
          <div />
        </div>

        {isPending && <p className="text-purple-400 text-sm animate-pulse">Checking...</p>}
      </div>
    </div>
  )
}
