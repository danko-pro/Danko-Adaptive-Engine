import { SCENE_OPERATION_TYPES } from "../contracts/sceneOperationTypes.js";

const GEOMETRY_FIELDS = ["x", "y", "w", "h"];

export function createSidebarContentItemGeometryOperation({
  sidebarItemId,
  contentItemId,
  area
} = {}) {
  return {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: normalizeOptionalId(sidebarItemId),
    payload: {
      contentItemId: normalizeOptionalId(contentItemId),
      patch: normalizeGeometryPatch(area)
    }
  };
}

function normalizeGeometryPatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return GEOMETRY_FIELDS.reduce((patch, field) => {
    if (value[field] !== undefined) {
      patch[field] = value[field];
    }

    return patch;
  }, {});
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
