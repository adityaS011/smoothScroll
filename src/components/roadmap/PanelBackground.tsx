import { forwardRef } from "react";
import Image from "next/image";
import type { RoadmapPanel } from "@/lib/types";

type PanelBackgroundProps = {
  panel: RoadmapPanel;
  priority?: boolean;
  /** Static layouts keep every panel fully opaque; the animated layout
   *  drives opacity imperatively via the forwarded ref. */
  visible?: boolean;
};

export const PanelBackground = forwardRef<HTMLDivElement, PanelBackgroundProps>(
  function PanelBackground({ panel, priority = false, visible = false }, ref) {
    return (
      <div
        ref={ref}
        className="absolute inset-0"
        style={{ opacity: visible ? 1 : 0, willChange: "opacity" }}
      >
        {panel.background ? (
          <Image
            src={panel.background}
            alt=""
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: panel.focalPoint }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#f4f1ea]" />
        )}
        {panel.overlay && <div className={`absolute inset-0 ${panel.overlay}`} />}
      </div>
    );
  },
);
