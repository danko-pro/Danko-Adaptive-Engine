import { SCENE_OPERATION_TYPES } from "../contracts/sceneOperationTypes.js";
import { SIDEBAR_CONTENT_GEOMETRY_TARGETS } from "../../sidebar-element/index.js";

const GEOMETRY_FIELDS = ["x", "y", "w", "h"];

export function createSidebarContentItemGeometryOperation({
  sidebarItemId,
  contentItemId,
  area,
  geometryTarget = SIDEBAR_CONTENT_GEOMETRY_TARGETS.DESKTOP,
  viewportArea = null
} = {}) {
  return {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: normalizeOptionalId(sidebarItemId),
    payload: {
      contentItemId: normalizeOptionalId(contentItemId),
      patch: normalizeGeometryPatch(area),
      geometryTarget,
      viewportArea: normalizeViewportArea(viewportArea)
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

function normalizeViewportArea(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return {
    x: normalizeGridNumber(value.x, 1),
    y: normalizeGridNumber(value.y, 1),
    w: normalizeGridSize(value.w, 1),
    h: normalizeGridSize(value.h, 1)
  };
}

function normalizeGridNumber(value, fallback) {
  const number = Math.round(Number(value));

  return Number.isFinite(number) ? number : fallback;
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
