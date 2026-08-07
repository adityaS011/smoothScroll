"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import type { RoadmapSectionConfig } from "@/lib/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RevealWord } from "./RevealWord";
import { GridOverlay } from "./GridOverlay";
import { ConnectorLine, type ConnectorLineHandle } from "./ConnectorLine";

type RoadmapSectionProps = {
  section: RoadmapSectionConfig;
  priority?: boolean;
};

const REVEAL_THRESHOLDS = Array.from({ length: 11 }, (_, i) => i / 10);
const REVEAL_ROOT_MARGIN = "-30% 0px -30% 0px";
const RISE_DISTANCE_PX = 24;

export function RoadmapSection({ section, priority = false }: RoadmapSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<Map<string, HTMLElement>>(new Map());
  const connectorHandleRef = useRef<ConnectorLineHandle>(null);
  const reducedMotion = useReducedMotion();
  const variant = section.theme === "intro" ? "dark" : "light";
  const lastWordId = section.words[section.words.length - 1]?.id;

  // Scroll-linked reveal: intersectionRatio is written straight to each
  // word's style on every callback, so there is no "already revealed"
  // state anywhere — scrolling back up naturally un-reveals, since the
  // ratio just goes back down. Skipped entirely under reduced motion,
  // so words keep their default (fully visible) styling instead of
  // paying for an observer that would just animate nothing.
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const words = wordRefs.current;
    const idByElement = new Map(Array.from(words.entries(), ([id, el]) => [el, id]));

    words.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = `translateY(${RISE_DISTANCE_PX}px)`;
    });
    connectorHandleRef.current?.setProgress(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const ratio = entry.intersectionRatio;
          el.style.opacity = String(ratio);
          el.style.transform = `translateY(${(1 - ratio) * RISE_DISTANCE_PX}px)`;

          if (idByElement.get(el) === lastWordId) {
            connectorHandleRef.current?.setProgress(ratio);
          }
        }
      },
      { root: null, rootMargin: REVEAL_ROOT_MARGIN, threshold: REVEAL_THRESHOLDS },
    );

    words.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reducedMotion, lastWordId]);

  return (
    <section ref={sectionRef} className="relative h-dvh w-full overflow-hidden">
      {section.background.kind === "image" ? (
        <Image
          src={section.background.src}
          alt={section.background.alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          style={
            section.background.focal ? { objectPosition: section.background.focal } : undefined
          }
        />
      ) : (
        <div className={`absolute inset-0 ${section.background.className}`} />
      )}

      {variant === "light" && <div className="absolute inset-0 bg-black/20" />}

      {section.showOverlay && <GridOverlay variant={variant} />}

      <div className="word-grid relative z-10 h-full w-full p-[clamp(1rem,4vw,4rem)]">
        {section.words.map((word) => (
          <RevealWord
            key={word.id}
            word={word}
            variant={variant}
            ref={(el) => {
              if (el) wordRefs.current.set(word.id, el);
              else wordRefs.current.delete(word.id);
            }}
          />
        ))}
      </div>

      {section.showConnector && (
        <ConnectorLine
          containerRef={sectionRef}
          wordRefs={wordRefs}
          wordIds={section.words.map((word) => word.id)}
          variant={variant}
          handleRef={connectorHandleRef}
        />
      )}
    </section>
  );
}
