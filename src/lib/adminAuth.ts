import crypto from 'crypto'

export function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function createAdminSessionToken(secret: string): string {
  const timestamp = Date.now().toString()
  const signature = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  return `${timestamp}.${signature}`
}

export function verifyAdminSessionToken(token: string | null | undefined, secret: string): boolean {
  if (!token) return false
  const [timestamp, signature] = token.split('.')
  if (!timestamp || !signature) return false

  const expected = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  if (expected !== signature) return false

  // Session valid for 24 hours
  const age = Date.now() - parseInt(timestamp, 10)
  if (isNaN(age) || age < 0 || age > 24 * 60 * 60 * 1000) return false

  return true
}

export function isAuthorizedAdmin(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET_KEY
  if (!secret) return false

  // 1. Check header (for script or curl access)
  const headerKey = req.headers.get('x-admin-key')
  if (headerKey && headerKey === secret) {
    return true
  }

  // 2. Check HttpOnly cookie (for browser access, invisible to inspect / JS)
  const cookieHeader = req.headers.get('cookie')
  const sessionToken = getCookieValue(cookieHeader, 'admin_session')
  if (sessionToken && verifyAdminSessionToken(sessionToken, secret)) {
    return true
  }

  return false
}

