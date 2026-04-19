/**
 * GET  /api/rewards          — list all active rewards
 * POST /api/rewards          — create a reward
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rewards = await prisma.reward.findMany({
    where: { isActive: true, userId: session.user.id },
    orderBy: { cost: 'asc' },
  })
  return NextResponse.json({ rewards })
}

const CreateRewardSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  emoji: z.string().min(1).max(10),
  cost: z.number().int().positive().max(10000),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = CreateRewardSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const reward = await prisma.reward.create({ data: { ...parsed.data, userId: session.user.id } })
  return NextResponse.json({ reward }, { status: 201 })
}
