import { SIDEBAR_LAYERS } from "../contracts/sidebarLayer.js";
import { SIDEBAR_STATES } from "../contracts/sidebarState.js";
import { resolveSidebarStatePolicy } from "../contracts/sidebarStatePolicy.js";

const SIDEBAR_BLOCK_TYPE = "sidebar";

export function createSidebarSceneProjection(items = []) {
  const sourceItems = Array.isArray(items) ? items : [];
  const layoutItems = [];
  const overlayItems = [];
  const hiddenItems = [];
  const renderItems = [];
  const sidebarItems = [];
  const nonSidebarItems = [];
  const policyById = new Map();

  for (const item of sourceItems) {
    if (!isSidebarItem(item)) {
      nonSidebarItems.push(item);
      layoutItems.push(item);
      renderItems.push(item);
      continue;
    }

    const policy = resolveSidebarStatePolicy(
      item,
      hasExplicitSidebarState(item) ? SIDEBAR_STATES.OVERLAY : SIDEBAR_STATES.FIXED
    );

    sidebarItems.push(item);
    policyById.set(String(item.id), policy);

    if (policy.layer === SIDEBAR_LAYERS.LAYOUT) {
      layoutItems.push(item);
    } else {
      overlayItems.push(item);
    }

    renderItems.push(item);
  }

  return {
    items: sourceItems,
    layoutItems,
    overlayItems,
    hiddenItems,
    renderItems,
    sidebarItems,
    nonSidebarItems,
    policyById
  };
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === SIDEBAR_BLOCK_TYPE ||
    (item?.meta?.sidebar && typeof item.meta.sidebar === "object")
  );
}

function hasExplicitSidebarState(item) {
  return typeof item?.state === "string" || typeof item?.meta?.sidebar?.state === "string";
}
