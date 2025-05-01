'use client'

import { logout } from "@/app/api/auth/actions"
import { Button } from "./ui/button"
import { useState } from "react"

export function LogoutButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleLogout}
            disabled={isLoading}
            variant="outline"
        >
            {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
    )
}