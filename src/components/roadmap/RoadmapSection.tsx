"use client";

import { useRef } from "react";
import Image from "next/image";
import type { RoadmapSectionConfig } from "@/lib/types";
import { RevealWord } from "./RevealWord";
import { GridOverlay } from "./GridOverlay";
import { ConnectorLine } from "./ConnectorLine";

type RoadmapSectionProps = {
  section: RoadmapSectionConfig;
  priority?: boolean;
};

export function RoadmapSection({ section, priority = false }: RoadmapSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<Map<string, HTMLElement>>(new Map());
  const variant = section.theme === "intro" ? "dark" : "light";

  return (
    <section ref={sectionRef} className="relative h-[100dvh] w-full overflow-hidden">
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
        />
      )}
    </section>
  );
}
