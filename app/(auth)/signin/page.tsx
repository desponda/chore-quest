'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'

export default function SigninPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0a3e 0%, #0d0b1e 50%, #060410 100%)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.25)', boxShadow: '0 8px 40px rgba(168,85,247,0.15)' }}
      >
        <div className="text-center">
          <Icon icon="game-icons:crossed-swords" width={40} height={40} color="rgba(196,167,255,0.9)" className="mx-auto mb-3" />
          <h1
            className="text-2xl font-black text-white tracking-widest"
            style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", textShadow: '0 0 20px rgba(168,85,247,0.6)' }}
          >
            CHORE QUEST
          </h1>
          <p className="text-purple-300/60 text-sm mt-1" style={{ fontFamily: "'Cinzel', serif" }}>
            Sign in to your family account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            autoComplete="email"
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 placeholder:text-gray-600 text-sm"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 placeholder:text-gray-600 text-sm"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}
          >
            {isPending ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          New here?{' '}
          <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
            Create a family account
          </Link>
        </p>
      </div>
    </div>
  )
}
