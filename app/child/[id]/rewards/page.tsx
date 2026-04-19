import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { RewardShop } from './RewardShop'

export default async function RewardsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const child = await prisma.child.findUnique({ where: { id } })
  if (!child) notFound()

  const rewards = await prisma.reward.findMany({
    where: { isActive: true, userId: child.userId },
    orderBy: { cost: 'asc' },
  })

  return (
    <RewardShop
      childId={id}
      credits={child.credits}
      rewards={rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        emoji: r.emoji,
        cost: r.cost,
        isActive: r.isActive,
      }))}
    />
  )
}
