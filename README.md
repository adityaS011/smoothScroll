# Window of Opportunity — Performance Lab

A scroll-linked roadmap section and a hero, built with Next.js 16 and TypeScript.

- **T#1 — The Roadmap**: a pinned section where phrases reveal by scroll position and thin lines draw themselves between them.
- **T#2 — The Hero**: headline, two CTAs, a live location readout, and a dismissible "Book a Tour" pill.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

| script | what it does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` / `npm start` | production build and serve |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run format` / `format:check` | Prettier |

Built against Node 24, Next 16.3, React 19.2, Tailwind 4.

---

## How the roadmap works

Eight full-viewport panels live in one tall strip. The section is pinned; the strip translates up through it. **Everything on screen is a pure function of one number** — how far the section has been scrolled — which is why scrolling back up un-reveals with no animation state to rewind.

```
scroll position
      │
      ▼
useScrollProgress ──► progress 0→1 (damped)
      │
      ▼
  translateY  ──►  view = { viewportH, centerY }
                          │
      ┌───────────────────┼───────────────────┬──────────────────┐
      ▼                   ▼                   ▼                  ▼
 BackgroundLayer     FrameLayer         ConnectorLayer      WordsLayer
 (parallax images)   (circle+rails)     (lines draw)        (phrases fade)
```

Each layer is handed `view` and works out its own opacity and position from it. No layer knows about any other.

### The two renderings

`RoadmapSection` picks one:

```tsx
return prefersReducedMotion === false ? <AnimatedRoadmap /> : <StaticRoadmap />
```

`usePrefersReducedMotion` returns `boolean | undefined`, and `undefined` is what the server and the first hydration pass see. So the **motionless version is the default, not the fallback** — the animated one takes over only on a definite `false`. Two consequences:

- `prefers-reduced-motion: reduce` gets the full section, stacked down the page, fully revealed, nothing moving.
- The server sends real content. With JavaScript disabled the roadmap still reads — panels, images, words and headlines are all in the HTML.

The one thing the static rendering can't do without JS is the connector lines: they're derived from measured word boxes, so they need a browser. The alternative would be hardcoded coordinates, which the brief rules out.

### Where things live

```
src/components/roadmap/
  RoadmapSection.tsx     picks a rendering
  AnimatedRoadmap.tsx    pinned strip
  StaticRoadmap.tsx      stacked, motionless
  useWordBoxes.ts        measures the DOM
  data.ts                content — panels, words, connections
  types.ts               its shape
  model/                 pure, no React
    reveal.ts              when things appear
    connectors.ts          where lines run
    validate.ts            whether the data holds together
  layers/                what gets drawn
```

`model/` imports `../data` and nothing else from the feature; layers import `../model/…` and never the reverse.

Generic hooks (`useScrollProgress`, `useViewportSize`, `usePrefersReducedMotion`, `useLocalStorageDismiss`) sit in `src/hooks/`. Feature-specific ones stay with their feature.

---

## Editing the content

Everything is in [`src/components/roadmap/data.ts`](src/components/roadmap/data.ts). Panels appear in scroll order.

```ts
{
  id: 3,
  image: '/blue3.jpg',
  words: [
    { id: 'health-systems',  text: 'HEALTH SYSTEMS',   x: 55, y: 30 },
    { id: 'arent-listening', text: 'AREN’T LISTENING', x: 40, y: 60 },
  ],
}
```

Lines are **not** stored per panel. `connections` names pairs of word ids, and only a named pair gets a line:

```ts
{ from: 'health-systems', to: 'arent-listening' }
{ from: 'b2-talking', to: 'but-most', curve: -0.38 }   // curve bends it
```

Two ways to place words, and they are **not** equally robust to copy changes:

| | spacing when the copy changes | use for |
| --- | --- | --- |
| `words` — `x`/`y` per word | shifts, since the word grows from its centre | diagonals, scattered placement |
| `rows` — flex, one gap | **unchanged** | phrases on one line |

`x`/`y` are percentages of the panel, never pixels.

### The validator

The data shape fails silently on its own: a mistyped connection id just doesn't draw, and a duplicate id points a line at the wrong word (word boxes are keyed by id, so one overwrites the other). `model/validate.ts` runs on import in development only and reports every problem at once:

```
roadmap data: 2 problem(s)
  duplicate word id "health-systems" (panel 3) — lines will attach to the wrong word
  connection b1-body -> b1-taking names "b1-taking", which is not a word
```

It checks duplicate word and panel ids, unresolved connection endpoints, self-links, duplicate connections, and `x`/`y` outside 0–100. It logs rather than throws — a content mistake shouldn't blank the section.

---

## Decisions worth knowing

**Connector lines use `pathLength={1}`.** Every path is restated as one unit long, so `strokeDasharray="1 2"` and a `strokeDashoffset` of `1 − drawn` are fractions regardless of the path's real length. No `getTotalLength()`, nothing to re-measure on resize. The gap is wider than the dash so the pattern can't wrap and leave a stray segment at the far end.

**Curved connectors solve their endpoints twice.** Which edge of a word a line touches depends on the heading it arrives on. A bowed line arrives on a different heading than the straight line between the two words, so it's solved once with a rough control point, then again against that curve's tangents. Without the second pass, a line sweeping in horizontally still terminates on the word's *top* edge.

**The strip chases the scroll position rather than tracking it.** Wheel input arrives in discrete ~100px steps; following it exactly makes full-bleed panels teleport. Damping is exponential and expressed in elapsed time (`DEFAULT_TAU = 0.1`), so 60Hz and 144Hz feel the same.

**Parallax lives inside each panel, not on it.** The image frame overhangs its slot by `PARALLAX_DRIFT` (12%) on each side and slides within it. The slot stays exactly panel-sized, so the image can lag the strip without ever opening a seam between panels.

**Responsiveness is structural, not a breakpoint.** Rows are `flex-wrap` with `maxWidth: 2·min(x, 100−x)%` — the room a row centred at `x` actually has before it runs off the nearer side. Placed words use `width: max-content` with the same cap. So a long phrase wraps on a 360px screen instead of being clipped by `overflow-x: clip`.

### Performance

| | |
| --- | --- |
| Frame loop | Gated by `IntersectionObserver` — no rAF callback or layout read while the section is off screen |
| Images | `PanelImage` is `memo`'d with stable props, so React skips the strip's heaviest subtrees each frame |
| GPU layers | `will-change: transform` only on panels actually in transit — at most two, never all eight |
| DOM writes | Reveal values quantised to 1/1000, so a barely-moved frame produces an identical style and React writes nothing |
| Webfonts | One family (JetBrains Mono), self-hosted by `next/font` — no third-party round trip |

### Tuning

| constant | file | effect |
| --- | --- | --- |
| `SCROLL_PER_PANEL` | `AnimatedRoadmap.tsx` | viewports of scroll each panel takes (1.5) |
| `REVEAL_FULL` / `REVEAL_END` | `model/reveal.ts` | how long a phrase stays fully visible, and where it fades out |
| `DEFAULT_TAU` | `hooks/useScrollProgress.ts` | scroll damping — larger is heavier |
| `PARALLAX_DRIFT` / `PANEL_ZOOM` | `layers/BackgroundLayer.tsx` | depth and settle of the images |
| `STROKE_WIDTH` | `layers/ConnectorLayer.tsx` | line weight |
| `WORD_TEXT_STYLE` | `layers/typography.ts` | one type treatment for words and statements |

---

## The hero

- **Live readout** — `useTelemetryTicker` jitters a Bengaluru coordinate by ±0.0015° every 1200ms. Invented data, plausible motion.
- **Dismissible pill** — `useLocalStorageDismiss` uses `useSyncExternalStore` with `undefined` as the server snapshot. The pill renders nothing until localStorage has actually been read, so a dismissed pill never flashes in after a refresh.

---

## Known limitations

- **Connectors need JavaScript.** They're measured from laid-out text, so the no-JS rendering has words and images but no lines.
- **The document gets taller at hydration.** The motionless rendering is `PANEL_COUNT × 100dvh`; the animated one is 1150vh because of `SCROLL_PER_PANEL`. The swap happens before the section is reachable, so it isn't visible in practice, but the two heights genuinely differ.
- **Not measured on real hardware.** The performance work above is structural. It has not been profiled on a mid-range Android device.
- **Scroll listener, not `animation-timeline`.** The bonus route wasn't taken. The instinct it asks about — content readable where the reveal never fires — is covered by the static rendering being the default.
