'use client'

import { useEffect, useState } from 'react'

type Telemetry = {
  city: string
  lat: number
  lon: number
}

const BASE: Telemetry = { city: 'BENGALURU', lat: 12.9629, lon: 77.6412 }
const JITTER = 0.0015
const TICK_MS = 1200

function jitter(value: number) {
  return value + (Math.random() - 0.5) * JITTER
}

export function useTelemetryTicker() {
  const [reading, setReading] = useState(BASE)

  useEffect(() => {
    const id = setInterval(() => {
      setReading((prev) => ({
        city: prev.city,
        lat: jitter(BASE.lat),
        lon: jitter(BASE.lon),
      }))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  return reading
}
