/** Demo build has no auth; swap in the signed-in user's id when sessions exist. */
export const CURRENT_USER_ID = 'demo-user'

const SAVE_DELAY_MS = 300

function preferenceUrl(key: string) {
  return `/api/users/${encodeURIComponent(CURRENT_USER_ID)}/preferences/${encodeURIComponent(key)}`
}

/** Returns the saved value, or `null` when nothing is saved or the server is unreachable. */
export async function loadUserPreference(key: string): Promise<unknown> {
  try {
    const response = await fetch(preferenceUrl(key), { headers: { Accept: 'application/json' } })
    if (!response.ok) return null
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

const pendingSaves = new Map<string, { value: unknown; timer: number }>()

function flush(key: string) {
  const pending = pendingSaves.get(key)
  if (!pending) return
  window.clearTimeout(pending.timer)
  pendingSaves.delete(key)
  fetch(preferenceUrl(key), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pending.value),
    keepalive: true,
  }).catch(() => {
    console.warn(`Could not save the "${key}" preference.`)
  })
}

/** Saves after a short pause so rapid changes (e.g. dragging a divider) send one request. */
export function saveUserPreference(key: string, value: unknown) {
  const existing = pendingSaves.get(key)
  if (existing) window.clearTimeout(existing.timer)
  pendingSaves.set(key, { value, timer: window.setTimeout(() => flush(key), SAVE_DELAY_MS) })
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    for (const key of [...pendingSaves.keys()]) flush(key)
  })
}
