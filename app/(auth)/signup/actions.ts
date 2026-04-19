'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const familyName = (formData.get('familyName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!familyName || !email || !password) {
    return { error: 'All fields are required' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'An account with that email already exists' }
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { email, password: hashed, familyName, parentPin: '1234' },
  })

  redirect('/signin')
}
