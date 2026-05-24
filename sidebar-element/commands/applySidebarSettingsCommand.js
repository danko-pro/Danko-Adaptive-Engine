import { SIDEBAR_DOCKS } from "../contracts/sidebarDock.js";
import { SIDEBAR_STATES } from "../contracts/sidebarState.js";
import {
  areSidebarElementContractsEqual,
  normalizeSidebarElementContract
} from "../contracts/sidebarElementContract.js";

const SIDEBAR_BLOCK_TYPE = "sidebar";

export function applySidebarSettingsCommand({
  item,
  settings = {}
} = {}) {
  if (!item || typeof item !== "object") {
    return createResult({
      valid: false,
      changed: false,
      item,
      reason: "invalid-item"
    });
  }

  if (!isSidebarItem(item)) {
    return createResult({
      valid: false,
      changed: false,
      item,
      reason: "item-is-not-sidebar"
    });
  }

  const previousSidebar = isRecord(item?.meta?.sidebar) ? item.meta.sidebar : {};
  const safeSettings = normalizeSettings(settings);
  const nextSidebar = normalizeSidebarElementContract({
    item,
    sidebar: mergeSidebarSettings(previousSidebar, safeSettings),
    defaultState: previousSidebar.state ?? SIDEBAR_STATES.OVERLAY,
    defaultDock: previousSidebar.dock ?? SIDEBAR_DOCKS.LEFT,
    createdFromArea: Boolean(previousSidebar.createdFromArea),
    syncExpandedArea: false,
    protectExpandedAreaFromContent: Object.prototype.hasOwnProperty.call(safeSettings, "content")
  });
  const nextItem = {
    ...item,
    ...nextSidebar.expandedArea,
    meta: {
      ...(isRecord(item.meta) ? item.meta : {}),
      blockType: SIDEBAR_BLOCK_TYPE,
      sidebar: nextSidebar
    }
  };

  return createResult({
    valid: true,
    changed: !areSidebarElementContractsEqual(previousSidebar, nextSidebar),
    item: nextItem,
    reason: null
  });
}

function mergeSidebarSettings(previousSidebar, settings) {
  return {
    ...previousSidebar,
    ...settings,
    responsive: {
      ...(isRecord(previousSidebar.responsive) ? previousSidebar.responsive : {}),
      ...(isRecord(settings.responsive) ? settings.responsive : {})
    },
    mobileLayout: mergeSidebarMobileLayoutSettings(
      previousSidebar.mobileLayout,
      settings.mobileLayout
    )
  };
}

function mergeSidebarMobileLayoutSettings(previousMobileLayout, nextMobileLayout) {
  if (!isRecord(nextMobileLayout)) {
    return previousMobileLayout;
  }

  const safePrevious = isRecord(previousMobileLayout) ? previousMobileLayout : {};

  return {
    ...safePrevious,
    ...nextMobileLayout,
    iconStrip: isRecord(nextMobileLayout.iconStrip)
      ? {
        ...(isRecord(safePrevious.iconStrip) ? safePrevious.iconStrip : {}),
        ...nextMobileLayout.iconStrip
      }
      : safePrevious.iconStrip
  };
}

function createResult({ valid, changed, item, reason }) {
  return {
    valid,
    changed,
    item,
    sidebar: item?.meta?.sidebar ?? null,
    reason
  };
}

function normalizeSettings(settings) {
  if (!isRecord(settings)) {
    return {};
  }

  return settings;
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === SIDEBAR_BLOCK_TYPE ||
    isRecord(item?.meta?.sidebar)
  );
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
