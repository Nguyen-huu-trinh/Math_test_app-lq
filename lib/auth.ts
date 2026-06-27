import bcrypt from "bcryptjs"

export const AUTH_COOKIE_NAME = "auth_token"

const TEACHER_USERNAME = "Math-ster"
const HASHED_PASSWORD = "$2b$10$B5eDvKBLV1JAhW7I/NOZvuXULrXOo8jpJt1p6pOHetFbCsyq7OcoS"

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.")
  }
  return secret
}

export type AuthTokenPayload = {
  username: string
}

export async function validateTeacherCredentials(
  username: string,
  password: string,
): Promise<AuthTokenPayload | null> {
  if (username !== TEACHER_USERNAME) {
    return null
  }

  const isValid = await bcrypt.compare(password, HASHED_PASSWORD)
  return isValid ? { username: TEACHER_USERNAME } : null
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function base64UrlToJson<T>(value: string): T {
  const bytes = base64UrlToBytes(value)
  const json = new TextDecoder().decode(bytes)
  return JSON.parse(json) as T
}

function jsonToBase64Url(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)))
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "")
}

async function signHs256(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getJwtSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))

  return bytesToBase64Url(new Uint8Array(signature))
}

export async function issueToken(payload: AuthTokenPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const expiresInSeconds = 60 * 60
  const encodedHeader = jsonToBase64Url({ alg: "HS256", typ: "JWT" })
  const encodedPayload = jsonToBase64Url({
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  })
  const signedData = `${encodedHeader}.${encodedPayload}`
  const signature = await signHs256(signedData)

  return `${signedData}.${signature}`
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".")
    if (!encodedHeader || !encodedPayload || !signature) {
      return null
    }

    const header = base64UrlToJson<{ alg?: string; typ?: string }>(encodedHeader)
    if (header.alg !== "HS256") {
      return null
    }

    const signedData = `${encodedHeader}.${encodedPayload}`
    const expectedSignature = await signHs256(signedData)

    if (expectedSignature !== signature) {
      return null
    }

    const decoded = base64UrlToJson<AuthTokenPayload & { exp?: number }>(encodedPayload)
    if (decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }

    if (typeof decoded.username !== "string") {
      return null
    }

    return { username: decoded.username }
  } catch {
    return null
  }
}
