'use client'

import { useCallback, useSyncExternalStore } from 'react'

// localStorage fires no storage event in the tab that wrote it, so writers
// notify subscribers directly.
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

/**
 * A one-way "dismissed" flag that survives reloads.
 *
 * `dismissed` is `undefined` until localStorage has actually been read, which
 * can only happen on the client. Callers render nothing in that state, so an
 * already-dismissed element never flashes in for a frame after a refresh.
 */
export function useLocalStorageDismiss(key: string) {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key) === 'true',
    () => undefined,
  )

  const dismiss = useCallback(() => {
    window.localStorage.setItem(key, 'true')
    listeners.forEach((notify) => notify())
  }, [key])

  return { dismissed, dismiss }
}
