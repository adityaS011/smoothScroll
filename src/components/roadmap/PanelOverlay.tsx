const HAIRLINE = "rgba(255,255,255,0.25)";
const CIRCLE = "rgba(255,255,255,0.35)";

function Crosshair({ className }: { className: string }) {
  return (
    <svg
      className={`absolute ${className}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke={HAIRLINE}
      strokeWidth="1"
      aria-hidden="true"
    >
      <line x1="6" y1="0" x2="6" y2="12" />
      <line x1="0" y1="6" x2="12" y2="6" />
    </svg>
  );
}

/** Persistent, static instrument overlay — same geometry in every panel,
 *  computed from the viewport so it never overflows or changes size. */
export function PanelOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {/* Vertical rails, inset 6%, 85% tall. */}
      <div className="absolute top-[7.5%] bottom-[7.5%] left-[6%] w-px" style={{ background: HAIRLINE }} />
      <div className="absolute top-[7.5%] right-[6%] bottom-[7.5%] w-px" style={{ background: HAIRLINE }} />

      {/* Central circle, locked to min(65vh, 65vw) so it always fits. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "min(65vh, 65vw)",
          aspectRatio: "1 / 1",
          border: `1px solid ${CIRCLE}`,
        }}
      />

      {/* Corner crosshairs at 5% inset. */}
      <Crosshair className="top-[5%] left-[5%]" />
      <Crosshair className="top-[5%] right-[5%]" />
      <Crosshair className="bottom-[5%] left-[5%]" />
      <Crosshair className="bottom-[5%] right-[5%]" />
    </div>
  );
}
