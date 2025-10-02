import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // Update session (refresh tokens, etc.)
  const response = await updateSession(request)

  // Protect dashboard routes with server-side authentication
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === '/login') {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
