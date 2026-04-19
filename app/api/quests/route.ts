/**
 * GET  /api/quests           — list all quests
 * POST /api/quests           — create a quest and optionally assign to children
 *
 * Example POST body:
 * {
 *   "title": "Vanquish the Vacuum Demon",
 *   "description": "Vacuum the entire living room and hallway.",
 *   "emoji": "🌪️",
 *   "credits": 25,
 *   "difficulty": "medium",
 *   "isGrabbable": false,
 *   "assignTo": ["child-id-1", "child-id-2"]   // optional
 * }
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const quests = await prisma.quest.findMany({
    where: { isActive: true, userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ quests })
}

const CreateQuestSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  emoji: z.string().min(1).max(10),
  credits: z.number().int().positive().max(10000),
  difficulty: z.enum(['easy', 'medium', 'hard', 'legendary']).default('easy'),
  isGrabbable: z.boolean().default(false),
  assignTo: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = CreateQuestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { assignTo, ...questData } = parsed.data
  const quest = await prisma.quest.create({ data: { ...questData, userId: session.user.id } })

  const assignments = []
  if (assignTo && assignTo.length > 0) {
    for (const childId of assignTo) {
      const child = await prisma.child.findUnique({ where: { id: childId, userId: session.user.id } })
      if (!child) continue
      const existing = await prisma.questAssignment.findFirst({
        where: { questId: quest.id, childId },
      })
      if (!existing) {
        const a = await prisma.questAssignment.create({
          data: { questId: quest.id, childId },
        })
        assignments.push(a)
      }
    }
  }

  return NextResponse.json({ quest, assignments }, { status: 201 })
}
