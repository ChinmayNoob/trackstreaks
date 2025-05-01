import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Debug logs for callback
  console.log('--- /auth/callback ---')
  console.log('request.url:', request.url)
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Always redirect to the appropriate base URL
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                     (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
      
      console.log('Redirecting to:', `${baseUrl}${next}`)
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/auth-code-error`)
}