"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buildSmoothPath } from "@/lib/path";
import {
  backgroundOpacity,
  clamp01,
  localProgress,
  segmentDrawFraction,
  segmentOpacity,
  statementOpacity,
  wordOpacity,
} from "@/lib/reveal";
import type { RoadmapPanel, RoadmapWord } from "@/lib/types";
import { roadmapConfig } from "./roadmapConfig";
import { PanelBackground } from "./PanelBackground";
import { PanelOverlay } from "./PanelOverlay";

const WORD_STYLE: CSSProperties = {
  fontSize: "clamp(0.75rem, 1.1vw, 1rem)",
  letterSpacing: "0.2em",
  fontWeight: 600,
  textShadow: "0 1px 10px rgba(0,0,0,0.55)",
};

const STATEMENT_STYLE: CSSProperties = {
  fontSize: "clamp(1.5rem, 4vw, 3rem)",
  letterSpacing: "-0.01em",
};

const count = roadmapConfig.length;

// Each scatter panel owns a connector segment: the previous scatter
// panel's last word (to bridge the seam) followed by its own words. The
// segment draws in and fades out with its panel, so the line stays a
// continuous thread across seams without older segments lingering.
const scatterPanels = roadmapConfig
  .map((panel, index) => ({ panel, index }))
  .filter(({ panel }) => panel.kind === "scatter");

const connectorSegments = scatterPanels.map(({ panel, index }, si) => {
  const prev = si > 0 ? scatterPanels[si - 1].panel : null;
  const prevLast = prev ? prev.words[prev.words.length - 1] : null;
  const points: RoadmapWord[] = prevLast ? [prevLast, ...panel.words] : [...panel.words];
  return { id: panel.id, index, points };
});

function Word({ word, forwardedRef, animated }: {
  word: RoadmapWord;
  forwardedRef?: (el: HTMLElement | null) => void;
  animated: boolean;
}) {
  return (
    <span
      ref={forwardedRef}
      className="absolute whitespace-nowrap text-white uppercase"
      style={{
        left: `${word.x}%`,
        top: `${word.y}%`,
        transform: "translate(-50%, -50%)",
        opacity: animated ? 0 : 1,
        willChange: "opacity, transform",
        ...WORD_STYLE,
      }}
    >
      {word.text}
    </span>
  );
}

function Statement({ panel, forwardedRef, animated }: {
  panel: RoadmapPanel;
  forwardedRef?: (el: HTMLDivElement | null) => void;
  animated: boolean;
}) {
  const dark = panel.theme === "intro";
  return (
    <div
      ref={forwardedRef}
      className={`absolute top-1/2 left-1/2 w-[80%] max-w-3xl text-center leading-[0.95] font-bold whitespace-pre-line uppercase italic ${dark ? "text-[#14110c]" : "text-white"}`}
      style={{
        transform: "translate(-50%, -50%)",
        opacity: animated ? 0 : 1,
        willChange: "opacity, transform",
        textShadow: dark ? "none" : "0 1px 14px rgba(0,0,0,0.5)",
        ...STATEMENT_STYLE,
      }}
    >
      {panel.statement}
    </div>
  );
}

function AnimatedRoadmap() {
  const outerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef(new Map<string, HTMLElement>());
  const wordRefs = useRef(new Map<string, HTMLElement>());
  const stmtRefs = useRef(new Map<string, HTMLElement>());
  const segRefs = useRef(new Map<string, SVGPathElement>());
  const segLenRefs = useRef(new Map<string, number>());
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const segmentPaths = useMemo(
    () =>
      connectorSegments.map((seg) => ({
        id: seg.id,
        index: seg.index,
        d: buildSmoothPath(seg.points.map((w) => ({ x: (w.x / 100) * dims.w, y: (w.y / 100) * dims.h }))),
      })),
    [dims],
  );

  // Sticky container size — connector geometry is rebuilt only when this
  // changes (mount + resize), never on scroll.
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Whenever segments are rebuilt, refresh each path's length for dashoffset.
  useLayoutEffect(() => {
    for (const seg of segmentPaths) {
      const path = segRefs.current.get(seg.id);
      if (!path) continue;
      const length = path.getTotalLength();
      segLenRefs.current.set(seg.id, length);
      path.style.strokeDasharray = `${length}`;
    }
  }, [segmentPaths]);

  // Single scroll-progress driver. scrollY is free (no layout read); the
  // outer section's offset is cached and only refreshed on resize.
  useEffect(() => {
    let top = 0;
    let height = 0;
    const measureOuter = () => {
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      top = rect.top + window.scrollY;
      height = el.offsetHeight;
    };

    const apply = (p: number) => {
      roadmapConfig.forEach((panel, i) => {
        const bg = bgRefs.current.get(panel.id);
        if (bg) bg.style.opacity = String(backgroundOpacity(p, i, count));

        const local = localProgress(p, i, count);
        if (panel.kind === "statement") {
          const el = stmtRefs.current.get(panel.id);
          if (el) {
            const o = statementOpacity(local);
            el.style.opacity = String(o);
            el.style.transform = `translate(-50%, -50%) translateY(${(1 - o) * 10}px)`;
          }
          return;
        }

        const k = panel.words.length;
        panel.words.forEach((word, j) => {
          const el = wordRefs.current.get(word.id);
          if (!el) return;
          const o = wordOpacity(local, j, k);
          el.style.opacity = String(o);
          el.style.transform = `translate(-50%, -50%) translateY(${(1 - o) * 8}px)`;
        });
      });

      for (const seg of connectorSegments) {
        const path = segRefs.current.get(seg.id);
        const length = segLenRefs.current.get(seg.id);
        if (!path || !length) continue;
        const local = localProgress(p, seg.index, count);
        path.style.strokeDashoffset = String(length * (1 - segmentDrawFraction(local)));
        path.style.opacity = String(segmentOpacity(local));
      }
    };

    let raf = 0;
    let ticking = false;
    const frame = () => {
      ticking = false;
      const denom = height - window.innerHeight;
      apply(denom > 0 ? clamp01((window.scrollY - top) / denom) : 0);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(frame);
      }
    };
    const onResize = () => {
      measureOuter();
      frame();
    };

    measureOuter();
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [segmentPaths]);

  return (
    <section ref={outerRef} className="relative" style={{ height: `${count * 100}vh` }}>
      <div ref={stickyRef} className="sticky top-0 h-dvh w-full overflow-hidden">
        {roadmapConfig.map((panel, i) => (
          <PanelBackground
            key={panel.id}
            panel={panel}
            priority={i <= 1}
            ref={(el) => {
              if (el) bgRefs.current.set(panel.id, el);
              else bgRefs.current.delete(panel.id);
            }}
          />
        ))}

        <PanelOverlay />

        {dims.w > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {segmentPaths.map((seg) => (
              <path
                key={seg.id}
                ref={(el) => {
                  if (el) segRefs.current.set(seg.id, el);
                  else segRefs.current.delete(seg.id);
                }}
                d={seg.d}
                fill="none"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                style={{ opacity: 0 }}
              />
            ))}
          </svg>
        )}

        <div className="absolute inset-0 z-30">
          {roadmapConfig.map((panel) =>
            panel.kind === "scatter" ? (
              panel.words.map((word) => (
                <Word
                  key={word.id}
                  word={word}
                  animated
                  forwardedRef={(el) => {
                    if (el) wordRefs.current.set(word.id, el);
                    else wordRefs.current.delete(word.id);
                  }}
                />
              ))
            ) : (
              <Statement
                key={panel.id}
                panel={panel}
                animated
                forwardedRef={(el) => {
                  if (el) stmtRefs.current.set(panel.id, el);
                  else stmtRefs.current.delete(panel.id);
                }}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function StaticRoadmap() {
  return (
    <div>
      {roadmapConfig.map((panel, i) => (
        <section key={panel.id} className="relative h-dvh w-full overflow-hidden">
          <PanelBackground panel={panel} priority={i <= 1} visible />
          <PanelOverlay />
          <div className="absolute inset-0 z-30">
            {panel.kind === "scatter" ? (
              panel.words.map((word) => <Word key={word.id} word={word} animated={false} />)
            ) : (
              <Statement panel={panel} animated={false} />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function Roadmap() {
  const reduced = useReducedMotion();
  return reduced ? <StaticRoadmap /> : <AnimatedRoadmap />;
}
