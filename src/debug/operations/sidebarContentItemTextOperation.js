import { SCENE_OPERATION_TYPES } from "../../../engine-adapter/index.js";

export function createSidebarContentItemTextOperation({
  sidebarItemId,
  contentItemId,
  text
} = {}) {
  return {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: normalizeOptionalId(sidebarItemId),
    payload: {
      contentItemId: normalizeOptionalId(contentItemId),
      patch: {
        text: normalizeText(text)
      }
    }
  };
}

function normalizeText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
