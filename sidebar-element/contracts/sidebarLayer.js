export const SIDEBAR_LAYERS = {
  LAYOUT: "layout",
  OVERLAY: "overlay"
};

export function isSidebarLayer(value) {
  return Object.values(SIDEBAR_LAYERS).includes(value);
}
