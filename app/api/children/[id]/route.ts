/**
 * GET    /api/children/[id]                  — get child with their quests
 * PATCH  /api/children/[id]                  — update credits (delta) or name
 * DELETE /api/children/[id]                  — remove child
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { applyCreditsAdjustment } from '@/lib/logic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const child = await prisma.child.findUnique({
    where: { id, userId: session.user.id },
    include: {
      assignments: {
        include: { quest: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  return NextResponse.json({ child })
}

const PatchChildSchema = z.object({
  creditsAdjustment: z.number().int().optional(),
  name: z.string().min(1).max(50).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = PatchChildSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const child = await prisma.child.findUnique({ where: { id, userId: session.user.id } })
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const updates: Record<string, unknown> = {}
  if (parsed.data.name) updates.name = parsed.data.name
  if (parsed.data.creditsAdjustment !== undefined) {
    updates.credits = applyCreditsAdjustment(child.credits, parsed.data.creditsAdjustment)
  }

  const updated = await prisma.child.update({ where: { id }, data: updates })
  return NextResponse.json({ child: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const child = await prisma.child.findUnique({ where: { id, userId: session.user.id } })
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  await prisma.questAssignment.deleteMany({ where: { childId: id } })
  await prisma.redemption.deleteMany({ where: { childId: id } })
  await prisma.child.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
