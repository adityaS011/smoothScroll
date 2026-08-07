import { forwardRef } from "react";
import type { RoadmapWord } from "@/lib/types";
import { zoneClasses } from "@/lib/zone";

type RevealWordProps = {
  word: RoadmapWord;
  variant: "light" | "dark";
};

export const RevealWord = forwardRef<HTMLSpanElement, RevealWordProps>(
  function RevealWord({ word, variant }, ref) {
    const sizeClass =
      word.emphasis === "large"
        ? "text-[clamp(2.5rem,6vw,5rem)] font-bold"
        : "text-[clamp(1.25rem,2.5vw,2rem)] font-medium";
    const colorClass = variant === "light" ? "text-white" : "text-black";

    return (
      <span
        ref={ref}
        style={{ gridArea: word.zone }}
        className={`${zoneClasses(word.zone)} ${sizeClass} ${colorClass} whitespace-pre-line px-2 py-1 tracking-tight`}
      >
        {word.text}
      </span>
    );
  },
);
