import { cookies } from 'next/headers'
import { ParentPin } from '@/components/ParentPin'
import Link from 'next/link'
import { logoutParent } from '@/lib/actions'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get('parent_auth')?.value === 'true'

  if (!isAuthed) {
    return <ParentPin />
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="text-purple-400 font-black text-lg tracking-wide">
            ⚔️ CHORE QUEST
          </Link>
          <p className="text-gray-500 text-xs mt-1">Parent Dashboard</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1" data-testid="parent-nav">
          <NavLink href="/parent" testid="nav-dashboard">Dashboard</NavLink>
          <NavLink href="/parent/approvals" testid="nav-approvals">Approvals</NavLink>
          <NavLink href="/parent/children" testid="nav-children">Children</NavLink>
          <NavLink href="/parent/quests" testid="nav-quests">Quests</NavLink>
          <NavLink href="/parent/rewards" testid="nav-rewards">Rewards</NavLink>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <form action={logoutParent}>
            <button className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-full text-left">
              ← Back to Family Hub
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}

function NavLink({ href, children, testid }: { href: string; children: React.ReactNode; testid?: string }) {
  return (
    <Link
      href={href}
      data-testid={testid}
      className="text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
    >
      {children}
    </Link>
  )
}
