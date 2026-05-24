import { clampIconStripBarAreaToMetrics } from "../contracts/iconStripLayout.js";

export function resolveSidebarCompactBarAreaPatch({ absoluteArea, metrics } = {}) {
  return clampIconStripBarAreaToMetrics(absoluteArea, metrics);
}
