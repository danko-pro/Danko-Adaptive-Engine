import { SIDEBAR_LAYERS } from "../contracts/sidebarLayer.js";
import { resolveSidebarStatePolicy } from "../contracts/sidebarStatePolicy.js";

export { SIDEBAR_LAYERS };

export function resolveSidebarLayer(value) {
  const rawState = readSidebarState(value);

  if (!rawState) {
    return SIDEBAR_LAYERS.LAYOUT;
  }

  return resolveSidebarStatePolicy(rawState).layer;
}

function readSidebarState(value) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  if (typeof value.state === "string") {
    return value.state;
  }

  return value.meta?.sidebar?.state ?? null;
}
