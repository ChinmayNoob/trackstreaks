import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useUser() {
    const supabase = createClient()
    
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) {
                console.error('Error fetching user:', error)
                throw error
            }
            return user as User | null
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
