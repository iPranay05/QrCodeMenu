// Simple in-memory sliding window rate limiter
interface RateLimitRecord {
  count: number
  resetTime: number
}

const ipRequestMap = new Map<string, RateLimitRecord>()

// Cleanup old entries every 10 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of ipRequestMap.entries()) {
    if (now > value.resetTime) {
      ipRequestMap.delete(key)
    }
  }
}, 10 * 60 * 1000)

export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = ipRequestMap.get(key)

  if (!record || now > record.resetTime) {
    ipRequestMap.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  record.count += 1
  return { success: true, remaining: maxRequests - record.count }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || '127.0.0.1'
}

