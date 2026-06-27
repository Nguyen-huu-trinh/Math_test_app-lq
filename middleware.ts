import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAME, verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  console.log("[auth] middleware cookie token:", token)

  if (!token) {
    console.log("[auth] middleware verification result:", null)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const verifiedToken = await verifyToken(token)
  console.log("[auth] middleware verification result:", verifiedToken)

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
