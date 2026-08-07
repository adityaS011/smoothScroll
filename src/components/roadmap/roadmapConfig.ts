import type { RoadmapSectionConfig } from "@/lib/types";

function words(text: string, prefix: string) {
  return text.split(" ").map((word, index) => ({
    id: `${prefix}-${index}`,
    text: word,
  }));
}

export const roadmapConfig: RoadmapSectionConfig[] = [
  {
    id: "intro",
    theme: "intro",
    background: { kind: "image", src: "/white.jpg", alt: "" },
    words: words("YOUR HEALTH DOESN'T MOVE IN STRAIGHT LINES.", "intro"),
    connector: null,
    showOverlay: true,
  },
  {
    id: "blue-1",
    theme: "blue",
    background: { kind: "image", src: "/blue1.jpg", alt: "" },
    words: words("TODO: real copy for blue-1", "blue-1"),
    connector: null,
    showOverlay: true,
  },
  {
    id: "blue-2",
    theme: "blue",
    background: { kind: "image", src: "/blue2.jpg", alt: "" },
    words: words("TODO: real copy for blue-2", "blue-2"),
    connector: null,
    showOverlay: false,
  },
  {
    id: "blue-3",
    theme: "blue",
    background: { kind: "image", src: "/blue3.jpg", alt: "" },
    words: words("TODO: real copy for blue-3", "blue-3"),
    connector: null,
    showOverlay: false,
  },
  {
    id: "orange-1",
    theme: "orange",
    background: { kind: "image", src: "/orange1.jpg", alt: "" },
    words: words("TODO: real copy for orange-1", "orange-1"),
    connector: null,
    showOverlay: false,
  },
  {
    id: "orange-2",
    theme: "orange",
    background: { kind: "image", src: "/orange2.jpg", alt: "" },
    words: words("TODO: real copy for orange-2", "orange-2"),
    connector: null,
    showOverlay: false,
  },
  {
    id: "orange-3",
    theme: "orange",
    background: { kind: "image", src: "/orange3.jpg", alt: "" },
    words: words("TODO: real copy for orange-3", "orange-3"),
    connector: null,
    showOverlay: true,
  },
  {
    id: "orange-4",
    theme: "orange",
    background: { kind: "image", src: "/orange4.jpg", alt: "" },
    words: words("TODO: real copy for orange-4", "orange-4"),
    connector: null,
    showOverlay: false,
  },
];
