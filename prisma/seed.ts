import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.redemption.deleteMany()
  await prisma.questAssignment.deleteMany()
  await prisma.quest.deleteMany()
  await prisma.reward.deleteMany()
  await prisma.child.deleteMany()
  await prisma.user.deleteMany()

  const user = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      password: await bcrypt.hash('password123', 10),
      familyName: 'The Quest Family',
      parentPin: '1234',
    },
  })

  const alex = await prisma.child.create({
    data: { name: 'Alex', avatar: 'wizard-f', color: 'blue', credits: 45, streak: 3, userId: user.id },
  })
  const sam = await prisma.child.create({
    data: { name: 'Sam', avatar: 'viking-m', color: 'red', credits: 22, streak: 1, userId: user.id },
  })

  const q1 = await prisma.quest.create({
    data: { title: 'Slay the Dish Dragon', description: 'Wash all the dishes and put them away. The kitchen dragon must be defeated!', emoji: 'game-icons:dragon-head', credits: 10, difficulty: 'easy', userId: user.id },
  })
  const q2 = await prisma.quest.create({
    data: { title: 'Vanquish the Laundry Beast', description: 'Do a full load of laundry: wash, dry, and fold. The laundry beast grows stronger each day!', emoji: 'game-icons:washing-machine', credits: 20, difficulty: 'medium', userId: user.id },
  })
  const q3 = await prisma.quest.create({
    data: { title: 'Tame the Bedroom Chaos', description: 'Clean your room completely. Make your bed, pick up clothes, and organize your desk.', emoji: 'game-icons:magic-broom', credits: 15, difficulty: 'medium', userId: user.id },
  })
  const q4 = await prisma.quest.create({
    data: { title: 'The Great Trash Quest', description: "Take out all the trash cans and replace the bags. A hero's duty!", emoji: 'game-icons:trash-can', credits: 10, difficulty: 'easy', userId: user.id },
  })
  const q5 = await prisma.quest.create({
    data: { title: 'Epic Floor Battle', description: 'Vacuum the entire house. This legendary quest requires great effort and skill!', emoji: 'game-icons:vacuum-cleaner', credits: 30, difficulty: 'hard', userId: user.id },
  })

  await prisma.quest.create({
    data: { title: 'The Sacred Table Ritual', description: 'Set the table for dinner and clear it afterward. The ancient mealtime ritual!', emoji: 'game-icons:fork-knife-spoon', credits: 8, difficulty: 'easy', isGrabbable: true, userId: user.id },
  })
  await prisma.quest.create({
    data: { title: 'Vanquish the Window Grime', description: 'Clean the windows inside and out. Banish the cloudy curse and let light return to the realm!', emoji: 'game-icons:soap', credits: 12, difficulty: 'easy', isGrabbable: true, userId: user.id },
  })
  await prisma.quest.create({
    data: { title: 'The Recycling Crusade', description: 'Sort and take out the recycling. Champions protect the realm from chaos!', emoji: 'game-icons:sickle', credits: 10, difficulty: 'easy', isGrabbable: true, userId: user.id },
  })
  await prisma.quest.create({
    data: { title: 'Tame the Wild Garden', description: 'Water the plants and pull weeds for 10 minutes. The garden spirits demand tribute!', emoji: 'game-icons:sprout', credits: 18, difficulty: 'medium', isGrabbable: true, userId: user.id },
  })

  await prisma.questAssignment.createMany({
    data: [
      { questId: q1.id, childId: alex.id },
      { questId: q2.id, childId: alex.id },
      { questId: q3.id, childId: alex.id },
      { questId: q3.id, childId: sam.id },
      { questId: q4.id, childId: sam.id },
      { questId: q5.id, childId: sam.id },
    ],
  })

  await prisma.reward.createMany({
    data: [
      { title: 'Movie Night',       description: 'Pick any movie for family movie night!',              emoji: 'game-icons:film-projector',      cost: 50, userId: user.id },
      { title: 'Extra Screen Time', description: 'One extra hour of screen time — no questions asked!', emoji: 'game-icons:joystick',             cost: 30, userId: user.id },
      { title: 'Choose Dinner',     description: 'You pick what the family eats for dinner tonight!',   emoji: 'game-icons:fork-knife-spoon',     cost: 40, userId: user.id },
      { title: 'Stay Up Late',      description: '30 extra minutes past your bedtime, just this once!', emoji: 'game-icons:moon',                 cost: 25, userId: user.id },
    ],
  })

  console.log('Seed complete — login: parent@example.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
