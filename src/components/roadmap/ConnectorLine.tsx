"use client";

import { useEffect, useState, type RefObject } from "react";

type Point = { x: number; y: number };

type ConnectorLineProps = {
  containerRef: RefObject<HTMLElement | null>;
  wordRefs: RefObject<Map<string, HTMLElement>>;
  wordIds: string[];
  variant: "light" | "dark";
};

export function ConnectorLine({ containerRef, wordRefs, wordIds, variant }: ConnectorLineProps) {
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const containerRect = container!.getBoundingClientRect();
      const next = wordIds
        .map((id) => wordRefs.current?.get(id))
        .filter((el): el is HTMLElement => Boolean(el))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          };
        });
      setPoints(next);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, wordRefs, wordIds]);

  if (points.length < 2) return null;

  const d = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const stroke = variant === "light" ? "white" : "black";

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeOpacity={0.6} strokeWidth={1} />
    </svg>
  );
}
