/**
 * GET /api  — API reference for AI agents
 *
 * Returns a machine-readable description of all available endpoints.
 * Designed so an AI agent can discover and use the full API without docs.
 */

import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    name: 'ChoreQuest API',
    version: '1.0',
    description: 'Manage a family chore gamification system. Heroes earn credits by completing quests and can redeem them for rewards.',
    endpoints: [
      {
        method: 'GET',
        path: '/api/children',
        description: 'List all children (heroes) with their credit balances and streaks',
        response: '{ children: [{ id, name, avatar, color, credits, streak }] }',
      },
      {
        method: 'POST',
        path: '/api/children',
        description: 'Create a new child/hero',
        body: '{ name: string, avatar?: string (emoji), color?: "blue"|"red"|"green"|"purple"|"yellow"|"pink" }',
        response: '{ child: { id, name, avatar, color, credits, streak } }',
      },
      {
        method: 'GET',
        path: '/api/children/[id]',
        description: 'Get a child with all their quest assignments and statuses',
        response: '{ child: { ...fields, assignments: [{ id, status, quest: {...} }] } }',
      },
      {
        method: 'PATCH',
        path: '/api/children/[id]',
        description: 'Adjust a child\'s credits or rename them. Use creditsAdjustment: positive to add, negative to deduct (never goes below 0)',
        body: '{ creditsAdjustment?: number, name?: string }',
        response: '{ child: { id, name, credits, ... } }',
      },
      {
        method: 'DELETE',
        path: '/api/children/[id]',
        description: 'Remove a child and all their assignments',
        response: '{ deleted: true }',
      },
      {
        method: 'GET',
        path: '/api/quests',
        description: 'List all active quests',
        response: '{ quests: [{ id, title, description, emoji, credits, difficulty, isGrabbable }] }',
      },
      {
        method: 'POST',
        path: '/api/quests',
        description: 'Create a quest and optionally assign it to specific children immediately',
        body: '{ title: string, description: string, emoji: string, credits: number, difficulty: "easy"|"medium"|"hard"|"legendary", isGrabbable?: boolean, assignTo?: string[] (child IDs) }',
        response: '{ quest: {...}, assignments: [...] }',
        example: {
          title: 'Conquer the Dishwasher',
          description: 'Unload and reload the dishwasher completely.',
          emoji: '🍽️',
          credits: 15,
          difficulty: 'easy',
          assignTo: ['<child-id>'],
        },
      },
      {
        method: 'GET',
        path: '/api/rewards',
        description: 'List all active rewards children can redeem',
        response: '{ rewards: [{ id, title, description, emoji, cost }] }',
      },
      {
        method: 'POST',
        path: '/api/rewards',
        description: 'Create a new reward for the treasure vault',
        body: '{ title: string, description: string, emoji: string, cost: number }',
        response: '{ reward: {...} }',
      },
    ],
    quickstart: [
      '1. GET /api/children to see all heroes and their IDs',
      '2. POST /api/quests with assignTo:[childId] to create and assign a quest',
      '3. PATCH /api/children/[id] with creditsAdjustment: 50 to add bonus credits',
      '4. POST /api/rewards to add a new reward to the treasure vault',
    ],
  })
}
