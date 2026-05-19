import { SCENE_OPERATION_TYPES } from "../../../engine-adapter/index.js";

const AREA_FIELDS = ["x", "y", "w", "h"];

export function createSidebarMobileButtonAreaOperation({
  sidebarItemId,
  area
} = {}) {
  return {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS,
    targetId: normalizeOptionalId(sidebarItemId),
    payload: {
      settings: {
        mobileLayout: {
          compactButtonArea: normalizeAreaPatch(area)
        }
      }
    }
  };
}

function normalizeAreaPatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const area = AREA_FIELDS.reduce((patch, field) => {
    if (value[field] !== undefined) {
      patch[field] = value[field];
    }

    return patch;
  }, {});

  return AREA_FIELDS.every((field) => area[field] !== undefined) ? area : null;
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
