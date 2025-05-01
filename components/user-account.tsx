'use client'

import { User } from '@supabase/supabase-js'
import { LogoutButton } from './logout-button'

interface UserAccountProps {
  user: User | null
}

export function UserAccount({ user }: UserAccountProps) {
  if (!user) return null

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  )
}