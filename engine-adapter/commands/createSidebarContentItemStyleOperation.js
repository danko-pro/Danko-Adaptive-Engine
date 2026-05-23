import { SCENE_OPERATION_TYPES } from "../contracts/sceneOperationTypes.js";

export function createSidebarContentItemStyleOperation({
  sidebarItemId,
  contentItemId,
  style
} = {}) {
  return {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: normalizeOptionalId(sidebarItemId),
    payload: {
      contentItemId: normalizeOptionalId(contentItemId),
      patch: {
        style: normalizeStylePatch(style)
      }
    }
  };
}

function normalizeStylePatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((style, [key, nextValue]) => {
    if (nextValue !== undefined) {
      style[key] = nextValue;
    }

    return style;
  }, {});
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
