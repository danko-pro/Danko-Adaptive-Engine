import {
  COMPOSITION_SIDEBAR_MODES
} from "../../composition-engine/index.js";
import {
  SIDEBAR_STATES,
  resolveSidebarState
} from "../../sidebar-element/index.js";
import { resolveBlockContentType } from "../contracts/blockContentTypes.js";

const SIDEBAR_BLOCK_TYPE = "sidebar";

export function createContentSchemasFromItems(items = []) {
  return Object.fromEntries(
    normalizeItems(items)
      .filter((item) => {
        const hasValue = item?.meta?.value !== undefined && item.meta.value !== null && item.meta.value !== "";
        const hasType = item?.meta?.blockType !== undefined && item.meta.blockType !== null && item.meta.blockType !== "";

        return hasValue || hasType;
      })
      .map((item) => [
        item.id,
        createContentSchemaFromItem(item)
      ])
  );
}

export function mapSidebarToCompositionBehavior(item, options = {}) {
  if (!isSidebarItem(item)) {
    return null;
  }

  const state = resolveSidebarState(
    item?.meta?.sidebar?.state,
    options.defaultState ?? SIDEBAR_STATES.OVERLAY
  );

  return {
    sidebar: {
      defaultMode: mapSidebarStateToCompositionMode(state)
    }
  };
}

export function mapSidebarStateToCompositionMode(state) {
  const resolvedState = resolveSidebarState(state);

  if (resolvedState === SIDEBAR_STATES.FIXED) {
    return COMPOSITION_SIDEBAR_MODES.STATIC;
  }

  if (resolvedState === SIDEBAR_STATES.COLLAPSED) {
    return COMPOSITION_SIDEBAR_MODES.COLLAPSIBLE;
  }

  if (resolvedState === SIDEBAR_STATES.HIDDEN) {
    return COMPOSITION_SIDEBAR_MODES.TRIGGER;
  }

  return COMPOSITION_SIDEBAR_MODES.OVERLAY;
}

function createContentSchemaFromItem(item) {
  const behavior = mapSidebarToCompositionBehavior(item);

  return {
    type: resolveBlockContentType(item.meta.blockType),
    value: item.meta.value ?? "",
    ...(behavior ? { behavior } : {})
  };
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === SIDEBAR_BLOCK_TYPE ||
    (item?.meta?.sidebar && typeof item.meta.sidebar === "object")
  );
}

function normalizeItems(items) {
  return Array.isArray(items) ? items : [];
}
