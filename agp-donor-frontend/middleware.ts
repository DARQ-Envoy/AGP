import { NextRequest, NextResponse } from 'next/server'

const ACCESS_TOKEN_KEY = 'access_token'

const publicRoutes = ['/auth']

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value
// console.log(!accessToken)
  if (!accessToken) {
    // console.log("middlware is responsible")
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(authUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|fonts|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
}
