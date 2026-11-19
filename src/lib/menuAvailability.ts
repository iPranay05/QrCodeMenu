/**
 * Utility helpers for menu item time-based availability.
 *
 * Times are stored as "HH:MM" strings in 24-hour format.
 * NULL start/end time means "available all day".
 */

export interface AvailabilityResult {
  available: boolean
  /** Human-readable reason if unavailable, e.g. "Available 8:00 AM – 11:30 AM" */
  reason?: string
}

/** Convert "HH:MM" → total minutes since midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Format "HH:MM" → "8:00 AM" / "11:30 PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

/**
 * Check whether a menu item is available right now.
 * Handles:
 *  - is_available = false → always unavailable
 *  - no time window set   → available all day
 *  - normal window (start < end, e.g. 08:00–22:00)
 *  - overnight window (start > end, e.g. 22:00–02:00)
 */
export function isItemAvailableNow(item: {
  is_available: boolean
  available_start_time?: string | null
  available_end_time?: string | null
}): AvailabilityResult {
  if (!item.is_available) {
    return { available: false, reason: 'Currently Unavailable' }
  }

  const start = item.available_start_time
  const end = item.available_end_time

  if (!start || !end) {
    // No time restriction
    return { available: true }
  }

  const now = new Date()
  const currentMins = now.getHours() * 60 + now.getMinutes()
  const startMins = toMinutes(start)
  const endMins = toMinutes(end)

  let withinWindow: boolean
  if (startMins <= endMins) {
    // Normal window, e.g. 08:00–22:00
    withinWindow = currentMins >= startMins && currentMins < endMins
  } else {
    // Overnight window, e.g. 22:00–02:00
    withinWindow = currentMins >= startMins || currentMins < endMins
  }

  if (!withinWindow) {
    return {
      available: false,
      reason: `Available ${formatTime(start)} – ${formatTime(end)}`
    }
  }

  return { available: true }
}

/** Short badge text for dashboard item cards */
export function availabilityBadgeText(item: {
  available_start_time?: string | null
  available_end_time?: string | null
}): string | null {
  if (item.available_start_time && item.available_end_time) {
    return `${formatTime(item.available_start_time)} – ${formatTime(item.available_end_time)}`
  }
  return null
}

