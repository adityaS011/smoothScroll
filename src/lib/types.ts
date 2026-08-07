export type WordZone =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type RoadmapWord = {
  id: string;
  text: string;
  zone: WordZone;
  emphasis?: "large" | "normal";
};

export type RoadmapBackground =
  | { kind: "image"; src: string; alt: string; focal?: string }
  | { kind: "gradient"; className: string };

export type RoadmapTheme = "intro" | "blue" | "orange";

export type RoadmapSectionConfig = {
  id: string;
  theme: RoadmapTheme;
  background: RoadmapBackground;
  words: RoadmapWord[];
  showConnector: boolean;
  showOverlay: boolean;
};
