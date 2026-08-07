"use client";

import { useTelemetryTicker } from "@/hooks/useTelemetryTicker";

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function TelemetryPill() {
  const { city, lat, lon } = useTelemetryTicker();

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 font-mono text-[11px] tracking-wider text-white/90 backdrop-blur">
      <span className="text-blue-400">
        <PinIcon />
      </span>
      <span className="tabular-nums">
        {city} • {lat.toFixed(3)}° N&nbsp;&nbsp;{lon.toFixed(3)}° E
      </span>
    </div>
  );
}
