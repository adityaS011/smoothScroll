export type RoadmapWord = {
  id: string;
  text: string;
};

export type ConnectorAnchor = {
  wordId: string;
  edge: "start" | "end" | "center";
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
  connector: { from: ConnectorAnchor; to: ConnectorAnchor } | null;
  showOverlay: boolean;
};
