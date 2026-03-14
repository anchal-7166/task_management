'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  User,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/new', label: 'New Task', icon: PlusCircle },
]

function SidebarContent({
  onClose,
  user,
  logout,
  pathname,
}: {
  onClose: () => void
  user: { name?: string; email?: string } | null
  logout: () => void
  pathname: string
}) {
  return (
    <>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-ink-800 flex items-center justify-between">
        <Link href="/dashboard" className="font-display text-2xl text-amber-400 italic">
          TaskFlow
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden text-ink-400 hover:text-ink-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-ink-800 px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <User size={13} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink-200 text-sm font-medium truncate">{user?.name}</p>
            <p className="text-ink-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="min-h-screen flex bg-ink-950">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-ink-800">
        <SidebarContent
          onClose={() => setSidebarOpen(false)}
          user={user}
          logout={logout}
          pathname={pathname}
        />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-60 bg-ink-950 border-r border-ink-800 flex flex-col',
          'transform transition-transform duration-250 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent
          onClose={() => setSidebarOpen(false)}
          user={user}
          logout={logout}
          pathname={pathname}
        />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-ink-800 bg-ink-950">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-ink-400 hover:text-ink-200 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-display text-xl text-amber-400 italic">TaskFlow</span>
        </header>

        <main className="flex-1 overflow-auto bg-grid noise">
          {children}
        </main>

      </div>
    </div>
  )
}