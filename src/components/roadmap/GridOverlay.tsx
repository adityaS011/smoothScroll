type GridOverlayProps = {
  variant: "light" | "dark";
};

const CORNERS = [
  { x: 8, y: 8 },
  { x: 92, y: 8 },
  { x: 8, y: 92 },
  { x: 92, y: 92 },
];

export function GridOverlay({ variant }: GridOverlayProps) {
  const stroke = variant === "light" ? "white" : "black";

  return (
    <>
      {/* Straight lines tolerate the section's non-square aspect ratio fine. */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1={8}
          y1={8}
          x2={8}
          y2={92}
          stroke={stroke}
          strokeOpacity={0.25}
          strokeWidth={0.15}
          strokeDasharray="1.5 1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={92}
          y1={8}
          x2={92}
          y2={92}
          stroke={stroke}
          strokeOpacity={0.25}
          strokeWidth={0.15}
          strokeDasharray="1.5 1.5"
          vectorEffect="non-scaling-stroke"
        />
        {CORNERS.map((corner) => (
          <g key={`${corner.x}-${corner.y}`} stroke={stroke} strokeOpacity={0.5} strokeWidth={0.2}>
            <line x1={corner.x - 1.2} y1={corner.y} x2={corner.x + 1.2} y2={corner.y} vectorEffect="non-scaling-stroke" />
            <line x1={corner.x} y1={corner.y - 1.2} x2={corner.x} y2={corner.y + 1.2} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      {/* The circle needs a real 1:1 aspect ratio, so it's a separate element
          rather than sharing the stretched viewBox above (which would turn
          it into an ellipse on non-square sections). */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "min(64dvh, 90vw)",
          aspectRatio: "1 / 1",
          border: `1px solid ${stroke}`,
          opacity: 0.35,
        }}
        aria-hidden="true"
      />
    </>
  );
}
