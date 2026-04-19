export interface Child {
  id: string
  name: string
  avatar: string
  color: string
  credits: number
  streak: number
}

export interface Quest {
  id: string
  title: string
  description: string
  emoji: string
  credits: number
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  isGrabbable: boolean
  isActive: boolean
}

export interface QuestAssignment {
  id: string
  questId: string
  childId: string
  status: 'available' | 'completed' | 'approved'
  completedAt: Date | null
  quest: Quest
}

export interface Reward {
  id: string
  title: string
  description: string
  emoji: string
  cost: number
  isActive: boolean
}

export interface Redemption {
  id: string
  rewardId: string
  childId: string
  status: 'pending' | 'approved' | 'rejected'
  reward: Reward
}
