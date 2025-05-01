// /components/sidebar.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { LogOut, Calendar } from 'lucide-react'
import { GiBandit } from 'react-icons/gi'
import { logout } from '@/app/api/auth/actions'
import { useUser } from '@/lib/hooks/user'

export function Sidebar() {
  const pathname = usePathname()
  const { data: user } = useUser()

  const displayName = user?.user_metadata?.full_name || user?.email || 'User'

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const routes = [
    {
      href: '/',
      label: 'Dashboard',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      active: pathname === '/dashboard',
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-black">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-zinc-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <GiBandit className="text-white size-8" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            TrackStreaks
          </h1>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                route.active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}