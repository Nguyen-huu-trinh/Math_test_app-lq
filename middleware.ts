import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAME, verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const verifiedToken = await verifyToken(token)
  if (!verifiedToken) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete({ name: AUTH_COOKIE_NAME, path: "/" })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/create/:path*"],
}
