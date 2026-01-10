import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // The notFound() function from Next.js will trigger this
  // We'll detect 404 responses and ensure proper status code
  const response = NextResponse.next()
  
  // This middleware runs for all requests
  // We can't directly set 404 here, but we can prepare for it
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
