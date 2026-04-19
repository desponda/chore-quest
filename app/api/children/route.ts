/**
 * GET  /api/children        — list all children with credits and streak
 * POST /api/children        — create a child
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, avatar: true, color: true, credits: true, streak: true },
  })
  return NextResponse.json({ children })
}

const CreateChildSchema = z.object({
  name: z.string().min(1).max(50),
  avatar: z.string().min(1).max(10).default('🧙'),
  color: z.enum(['blue', 'red', 'green', 'purple', 'yellow', 'pink']).default('blue'),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = CreateChildSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const child = await prisma.child.create({ data: { ...parsed.data, userId: session.user.id } })
  return NextResponse.json({ child }, { status: 201 })
}
