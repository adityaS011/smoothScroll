'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * Whether the visitor asked for reduced motion — `undefined` until the client
 * can answer. That third state is what the server and hydration see, so a
 * component can default to motionless and opt into animation once it knows.
 */
export function usePrefersReducedMotion(): boolean | undefined {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => undefined,
  )
}
