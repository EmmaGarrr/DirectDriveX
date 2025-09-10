import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for non-admin routes
  if (!req.nextUrl.pathname.startsWith('/admin-panel')) {
    return res
  }
  
  // Skip middleware for admin login page
  if (req.nextUrl.pathname === '/admin/login') {
    return res
  }
  
  // For server-side auth check, we'll look for the admin token in localStorage
  // Since we can't access localStorage directly in middleware, we'll rely on
  // the client-side auth check in the layout component
  // This middleware mainly serves to ensure proper routing structure
  
  // Add a header to indicate this is an admin route
  res.headers.set('x-admin-route', 'true')
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}