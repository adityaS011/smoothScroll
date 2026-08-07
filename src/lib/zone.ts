import type { WordZone } from "./types";

const VERTICAL: Record<string, string> = {
  top: "self-start",
  center: "self-center",
  bottom: "self-end",
};

const HORIZONTAL: Record<string, string> = {
  left: "justify-self-start",
  center: "justify-self-center",
  right: "justify-self-end",
};

export function zoneClasses(zone: WordZone): string {
  const [vertical, horizontal] =
    zone === "center" ? ["center", "center"] : zone.split("-");
  return `${VERTICAL[vertical]} ${HORIZONTAL[horizontal]}`;
}
