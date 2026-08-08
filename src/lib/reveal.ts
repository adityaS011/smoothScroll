export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Each panel owns a 1/N slice of scroll progress. */
export const panelSpan = (count: number) => 1 / count;

/** Triangular crossfade: a panel peaks at its window center and fades to
 *  zero at its neighbours' centers, so adjacent panels cross at ~0.5.
 *  The first and last panels hold full opacity past their center toward
 *  the section edges, so there's no dark flash at the very top/bottom. */
export function backgroundOpacity(progress: number, index: number, count: number) {
  const span = panelSpan(count);
  const center = (index + 0.5) * span;
  if (index === 0 && progress < center) return 1;
  if (index === count - 1 && progress > center) return 1;
  return clamp01(1 - Math.abs(progress - center) / span);
}

/** progress within a panel's own window, 0..1 (can fall outside). */
export function localProgress(progress: number, index: number, count: number) {
  return (progress - index * panelSpan(count)) / panelSpan(count);
}

/** Word j of K reveals in sequence across the panel window, then fades
 *  out as the window ends. Pure function of progress, so scrolling back
 *  up un-reveals with no stored "seen" state. */
export function wordOpacity(local: number, j: number, k: number) {
  const revealPoint = (j + 1) / (k + 1);
  const fadeIn = smoothstep(revealPoint - 0.18, revealPoint, local);
  const fadeOut = 1 - smoothstep(0.82, 1, local);
  return clamp01(Math.min(fadeIn, fadeOut));
}

/** Centered statement fades in early, holds, fades out late. */
export function statementOpacity(local: number) {
  const fadeIn = smoothstep(0, 0.25, local);
  const fadeOut = 1 - smoothstep(0.72, 0.95, local);
  return clamp01(Math.min(fadeIn, fadeOut));
}

/** Maps overall progress onto the scatter-panel span, so the connector
 *  draws only while the scatter words are on screen. */
export function lineProgress(progress: number, firstScatter: number, lastScatter: number, count: number) {
  const span = panelSpan(count);
  const start = firstScatter * span;
  const end = (lastScatter + 1) * span;
  return clamp01((progress - start) / (end - start));
}
