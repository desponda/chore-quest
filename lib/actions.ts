'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Not authenticated')
  return session
}

export async function completeQuest(assignmentId: string, childId: string) {
  await requireSession()
  await prisma.questAssignment.update({
    where: { id: assignmentId },
    data: { status: 'completed', completedAt: new Date() },
  })
  revalidatePath(`/child/${childId}/quests`)
}

export async function approveQuest(assignmentId: string) {
  await requireSession()
  const assignment = await prisma.questAssignment.findUnique({
    where: { id: assignmentId },
    include: { quest: true, child: true },
  })
  if (!assignment) return

  await prisma.questAssignment.update({
    where: { id: assignmentId },
    data: { status: 'approved', approvedAt: new Date() },
  })
  await prisma.child.update({
    where: { id: assignment.childId },
    data: { credits: { increment: assignment.quest.credits } },
  })
  revalidatePath('/parent/approvals')
  revalidatePath(`/child/${assignment.childId}/quests`)
}

export async function rejectQuest(assignmentId: string) {
  await requireSession()
  await prisma.questAssignment.update({
    where: { id: assignmentId },
    data: { status: 'available', completedAt: null },
  })
  revalidatePath('/parent/approvals')
}

export async function grabQuest(questId: string, childId: string) {
  await requireSession()
  const existing = await prisma.questAssignment.findFirst({
    where: { questId, childId },
  })
  if (existing) return

  await prisma.questAssignment.create({
    data: { questId, childId },
  })
  revalidatePath(`/child/${childId}/quests`)
}

export async function redeemReward(rewardId: string, childId: string) {
  await requireSession()
  const [child, reward] = await Promise.all([
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.reward.findUnique({ where: { id: rewardId } }),
  ])
  if (!child || !reward) return { error: 'Not found' }
  if (child.credits < reward.cost) return { error: 'Insufficient credits' }

  await prisma.child.update({
    where: { id: childId },
    data: { credits: { decrement: reward.cost } },
  })
  await prisma.redemption.create({
    data: { rewardId, childId },
  })
  revalidatePath(`/child/${childId}/rewards`)
}

export async function approveRedemption(redemptionId: string) {
  await requireSession()
  await prisma.redemption.update({
    where: { id: redemptionId },
    data: { status: 'approved' },
  })
  revalidatePath('/parent/approvals')
}

export async function rejectRedemption(redemptionId: string) {
  await requireSession()
  const redemption = await prisma.redemption.findUnique({
    where: { id: redemptionId },
    include: { reward: true },
  })
  if (!redemption) return

  await prisma.redemption.update({
    where: { id: redemptionId },
    data: { status: 'rejected' },
  })
  await prisma.child.update({
    where: { id: redemption.childId },
    data: { credits: { increment: redemption.reward.cost } },
  })
  revalidatePath('/parent/approvals')
}

export async function createChild(formData: FormData) {
  const session = await requireSession()
  const name = formData.get('name') as string
  const avatar = formData.get('avatar') as string
  const color = formData.get('color') as string

  await prisma.child.create({ data: { name, avatar, color, userId: session.user.id } })
  revalidatePath('/parent/children')
  revalidatePath('/')
}

export async function deleteChild(childId: string) {
  const session = await requireSession()
  await prisma.questAssignment.deleteMany({ where: { childId } })
  await prisma.redemption.deleteMany({ where: { childId } })
  await prisma.child.delete({ where: { id: childId, userId: session.user.id } })
  revalidatePath('/parent/children')
  revalidatePath('/')
}

export async function adjustCredits(formData: FormData) {
  await requireSession()
  const childId = formData.get('childId') as string
  const amount = parseInt(formData.get('amount') as string)
  if (isNaN(amount)) return
  await prisma.child.update({
    where: { id: childId },
    data: { credits: { increment: amount } },
  })
  revalidatePath('/parent/children')
  revalidatePath('/')
}

export async function createQuest(formData: FormData) {
  const session = await requireSession()
  await prisma.quest.create({
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      emoji: formData.get('emoji') as string,
      credits: parseInt(formData.get('credits') as string),
      difficulty: formData.get('difficulty') as string,
      isGrabbable: formData.get('isGrabbable') === 'on',
      userId: session.user.id,
    },
  })
  revalidatePath('/parent/quests')
}

export async function deleteQuest(questId: string) {
  const session = await requireSession()
  await prisma.questAssignment.deleteMany({ where: { questId } })
  await prisma.quest.delete({ where: { id: questId, userId: session.user.id } })
  revalidatePath('/parent/quests')
}

export async function assignQuestToChild(questId: string, childId: string) {
  await requireSession()
  const existing = await prisma.questAssignment.findFirst({
    where: { questId, childId },
  })
  if (existing) return
  await prisma.questAssignment.create({ data: { questId, childId } })
  revalidatePath('/parent/quests')
  revalidatePath('/')
}

export async function unassignQuestFromChild(questId: string, childId: string) {
  await requireSession()
  await prisma.questAssignment.deleteMany({ where: { questId, childId } })
  revalidatePath('/parent/quests')
  revalidatePath('/')
}

export async function createReward(formData: FormData) {
  const session = await requireSession()
  await prisma.reward.create({
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      emoji: formData.get('emoji') as string,
      cost: parseInt(formData.get('cost') as string),
      userId: session.user.id,
    },
  })
  revalidatePath('/parent/rewards')
}

export async function deleteReward(rewardId: string) {
  const session = await requireSession()
  await prisma.redemption.deleteMany({ where: { rewardId } })
  await prisma.reward.delete({ where: { id: rewardId, userId: session.user.id } })
  revalidatePath('/parent/rewards')
}

export async function verifyPin(pin: string): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return false
  if (user.parentPin !== pin) return false

  const cookieStore = await cookies()
  cookieStore.set('parent_auth', 'true', { maxAge: 60 * 60 * 8, httpOnly: true, path: '/' })
  return true
}

export async function checkParentAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('parent_auth')?.value === 'true'
}

export async function logoutParent() {
  const cookieStore = await cookies()
  cookieStore.delete('parent_auth')
  redirect('/')
}

export async function updatePin(formData: FormData) {
  const session = await requireSession()
  const newPin = formData.get('pin') as string
  if (!/^\d{4}$/.test(newPin)) return { error: 'PIN must be 4 digits' }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { parentPin: newPin },
  })
  revalidatePath('/parent')
}
