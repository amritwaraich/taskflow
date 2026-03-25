'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Inbox,
  Calendar,
  Clock,
  Tag,
  Filter,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  Search,
  Command,
} from 'lucide-react'
import { ProjectList } from '@/components/projects/ProjectList'
import { QuickAddModal } from '@/components/tasks/QuickAddModal'
import { LabelDot } from '@/components/ui/ColorPicker'
import { useAppStore } from '@/store/tasks'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const {
    user,
    profile,
    labels,
    projects,
    setUser,
    setProfile,
    setProjects,
    setLabels,
    init,
    setShowQuickAdd,
    showQuickAdd,
  } = useAppStore()
  const supabase = createClient()

  useEffect(() => {
    const initApp = async () => {
      await init()
      setLoading(false)
    }
    initApp()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowQuickAdd(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowQuickAdd])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    )
  }

  const sidebarItems = [
    { href: '/app/inbox', icon: Inbox, label: 'Inbox' },
    { href: '/app/today', icon: Clock, label: 'Today' },
    { href: '/app/upcoming', icon: Calendar, label: 'Upcoming' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">TaskFlow</span>
          </Link>
        </div>

        {/* Quick Add Button */}
        <div className="p-3">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-violet-300 hover:text-violet-600 transition text-sm"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Quick Add
            </span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-500">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}

          {/* Projects */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
            </div>
            <ProjectList />
          </div>

          {/* Labels */}
          <div className="pt-4">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <Tag className="w-5 h-5" />
              <span className="flex-1 text-left">Labels</span>
              <ChevronDown className={`w-4 h-4 transition ${showLabels ? 'rotate-180' : ''}`} />
            </button>
            {showLabels && (
              <div className="ml-4 mt-1 space-y-1">
                {labels.map((label) => (
                  <Link
                    key={label.id}
                    href={`/app/labels?filter=${label.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    <LabelDot color={label.color} />
                    <span className="truncate">{label.name}</span>
                  </Link>
                ))}
                {labels.length === 0 && (
                  <p className="px-3 py-1.5 text-xs text-gray-400">No labels yet</p>
                )}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="pt-4 space-y-1">
            <Link
              href="/app/filters"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </Link>
          </div>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-medium text-sm">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.subscription_tier || 'Free'} plan
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50">
                <Link
                  href="/app/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>

      {/* Quick Add Modal */}
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  )
}
