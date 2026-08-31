export interface AdminTokenPayload {
  sub: string
  role: 'admin'
  iat: number
  exp: number
}

export const ADMIN_COOKIE_NAME = 'tots_admin_session'
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60 // 7 days

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'tots-admin-fallback-secret-key-2026'
  )
}

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64url')
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64url').toString('utf8')
  }
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return decodeURIComponent(escape(atob(base64)))
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buf).toString('base64url')
  }
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlToBuffer(str: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(str, 'base64url'))
  }
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getCryptoKey(): Promise<CryptoKey> {
  const secret = getSecretKey()
  const keyData = new TextEncoder().encode(secret)
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Signs a JWT for the admin session using HMAC-SHA256
 */
export async function signAdminToken(username: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminTokenPayload = {
    sub: username,
    role: 'admin',
    iat: now,
    exp: now + SESSION_DURATION_SECONDS
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const key = await getCryptoKey()
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  )

  const encodedSignature = bufferToBase64Url(signatureBuffer)

  return `${dataToSign}.${encodedSignature}`
}

/**
 * Verifies the JWT and its expiration
 */
export async function verifyAdminToken(
  token: string | null | undefined
): Promise<{ valid: boolean; payload?: AdminTokenPayload }> {
  if (!token || typeof token !== 'string') {
    return { valid: false }
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return { valid: false }
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const dataToVerify = `${encodedHeader}.${encodedPayload}`

  try {
    const key = await getCryptoKey()
    const signatureBytes = base64UrlToBuffer(encodedSignature)

    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      new TextEncoder().encode(dataToVerify)
    )

    if (!isValidSig) {
      return { valid: false }
    }

    const payloadJson = base64UrlDecode(encodedPayload)
    const payload: AdminTokenPayload = JSON.parse(payloadJson)

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return { valid: false } // Expired
    }

    if (payload.role !== 'admin') {
      return { valid: false }
    }

    return { valid: true, payload }
  } catch {
    return { valid: false }
  }
}

/**
 * Validates admin credentials securely against environment variables
 */
export function verifyAdminCredentials(username?: string, password?: string): boolean {
  const validUsername = process.env.ADMIN_USERNAME
  const validPassword = process.env.ADMIN_PASSWORD

  if (!validUsername || !validPassword) {
    console.error('ADMIN_USERNAME or ADMIN_PASSWORD environment variable is not configured.')
    return false
  }

  if (!username || !password) {
    return false
  }

  // Safe string matching
  const isUserMatch = safeStringCompare(username.trim().toLowerCase(), validUsername.trim().toLowerCase())
  const isPassMatch = safeStringCompare(password, validPassword)

  return isUserMatch && isPassMatch
}

function safeStringCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Returns options for setting the authentication cookie
 */
export function getAuthCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SECONDS
  }
}
