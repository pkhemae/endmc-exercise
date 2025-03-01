import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages that require authentication
const protectedRoutes = ['/dashboard', '/dashboard/profile', '/dashboard/settings']
// Pages that are only accessible to non-authenticated users
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // For debugging
  console.log('Middleware checking path:', pathname)
  console.log('Token exists:', !!token)

  // Check protected routes - redirect to login if no token
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      console.log('No token found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Check auth routes - redirect to dashboard if token exists
  if (authRoutes.includes(pathname)) {
    if (token) {
      console.log('Token found, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [...protectedRoutes, ...authRoutes]
}