import type { RoadmapSectionConfig } from "@/lib/types";

export const roadmapConfig: RoadmapSectionConfig[] = [
  {
    id: "intro",
    theme: "intro",
    background: { kind: "gradient", className: "bg-[#f8f5f0]" },
    words: [
      {
        id: "intro-line",
        text: "Your health doesn't move\nin straight lines.",
        zone: "center",
      },
    ],
    showConnector: false,
    showOverlay: true,
  },
  {
    id: "blue-1",
    theme: "blue",
    background: { kind: "image", src: "/blue1.jpg", alt: "" },
    words: [
      { id: "blue1-your", text: "your", zone: "top-left" },
      { id: "blue1-body", text: "body", zone: "center-left" },
      { id: "blue1-is", text: "is", zone: "center" },
      { id: "blue1-talking", text: "talking", zone: "center-right" },
      { id: "blue1-every", text: "every", zone: "bottom-right" },
      { id: "blue1-where", text: "where", zone: "bottom-center" },
    ],
    showConnector: true,
    // blue1.jpg already has the circle+grid motif baked into the photo —
    // rendering our own on top would double it up.
    showOverlay: false,
  },
  {
    id: "blue-2",
    theme: "blue",
    background: { kind: "image", src: "/blue2.jpg", alt: "" },
    words: [
      { id: "blue2-but-most", text: "BUT MOST", zone: "top-right" },
      { id: "blue2-health-systems", text: "HEALTH SYSTEMS", zone: "center-right" },
      { id: "blue2-arent-listening", text: "AREN'T LISTENING", zone: "bottom-left" },
    ],
    showConnector: true,
    showOverlay: false,
  },
  {
    id: "blue-3",
    theme: "blue",
    background: { kind: "image", src: "/blue3.jpg", alt: "" },
    words: [
      { id: "blue3-every", text: "every", zone: "top-left" },
      { id: "blue3-insight", text: "insight", zone: "top-right" },
      { id: "blue3-informed", text: "informed", zone: "center-left" },
      { id: "blue3-by", text: "by", zone: "center" },
      { id: "blue3-what", text: "what", zone: "center-right" },
      { id: "blue3-comes", text: "comes", zone: "bottom-left" },
      { id: "blue3-next", text: "next", zone: "bottom-right" },
    ],
    showConnector: true,
    showOverlay: false,
  },
  {
    id: "orange-1",
    theme: "orange",
    background: { kind: "image", src: "/orange1.jpg", alt: "" },
    words: [
      { id: "orange1-insight", text: "INSIGHT", zone: "center", emphasis: "large" },
      { id: "orange1-patterns", text: "patterns", zone: "top-left" },
      { id: "orange1-signals", text: "signals", zone: "top-right" },
      { id: "orange1-your-data", text: "your data", zone: "bottom-center" },
    ],
    showConnector: true,
    showOverlay: true,
  },
  {
    id: "orange-2",
    theme: "orange",
    background: { kind: "image", src: "/orange2.jpg", alt: "" },
    words: [
      { id: "orange2-turning", text: "turning", zone: "top-left" },
      { id: "orange2-noise", text: "noise", zone: "center-right" },
      { id: "orange2-into", text: "into", zone: "bottom-left" },
      { id: "orange2-knowing", text: "knowing", zone: "bottom-right" },
    ],
    showConnector: true,
    showOverlay: false,
  },
  {
    id: "orange-3",
    theme: "orange",
    background: { kind: "image", src: "/orange3.jpg", alt: "" },
    words: [
      { id: "orange3-action", text: "ACTION", zone: "center", emphasis: "large" },
      { id: "orange3-follows", text: "follows", zone: "center-right" },
      { id: "orange3-understanding", text: "understanding", zone: "bottom-center" },
    ],
    showConnector: true,
    // Same as blue1.jpg — orange3.jpg already has the motif baked in.
    showOverlay: false,
  },
  {
    id: "orange-4",
    theme: "orange",
    background: { kind: "image", src: "/orange4.jpg", alt: "" },
    words: [
      {
        id: "orange4-line",
        text: "and the ring stays quiet,\nuntil it matters.",
        zone: "center",
      },
    ],
    showConnector: false,
    showOverlay: true,
  },
];
