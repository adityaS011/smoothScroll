export type RoadmapWord = {
  id: string;
  text: string;
  /** Position within the sticky viewport, as a percentage. Constrained to
   *  the middle 50% box (25–75) so the composition stays centered. */
  x: number;
  y: number;
};

export type RoadmapPanelKind = "statement" | "scatter";

export type RoadmapTheme = "intro" | "blue" | "orange";

export type RoadmapPanel = {
  id: string;
  kind: RoadmapPanelKind;
  theme: RoadmapTheme;
  /** Image src under /public, or null for the plain intro backdrop. */
  background: string | null;
  /** object-position focal point, tuned per photo. */
  focalPoint: string;
  /** Tailwind overlay class tuned to each photo's brightness. */
  overlay: string;
  /** Scatter words (empty for statement panels). */
  words: RoadmapWord[];
  /** Centered statement text for statement panels. */
  statement?: string;
};
