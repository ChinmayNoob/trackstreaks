// /app/(dashboard)/layout.tsx
'use client'

import { useUser } from '@/lib/hooks/user'
import { Sidebar } from '@/components/sidebar'

import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const { data: user, isLoading } = useUser()

    // If user is not logged in and not on the auth page, redirect to login
    if (!isLoading && !user) {
        redirect('/')
    }

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}