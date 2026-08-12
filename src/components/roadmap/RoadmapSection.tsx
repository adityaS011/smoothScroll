'use client'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { AnimatedRoadmap } from './AnimatedRoadmap'
import { StaticRoadmap } from './StaticRoadmap'

/**
 * The motionless roadmap is the default, not the fallback: it is what the
 * server renders and what stands in whenever we don't know that motion is
 * welcome. The scrolling version takes over only on a definite `false`, so the
 * section can never be blank waiting for an answer.
 */
export function RoadmapSection() {
  const prefersReducedMotion = usePrefersReducedMotion()
  return prefersReducedMotion === false ? <AnimatedRoadmap /> : <StaticRoadmap />
}
