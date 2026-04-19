import { redirect } from 'next/navigation'

export default async function ChildHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/child/${id}/quests`)
}
