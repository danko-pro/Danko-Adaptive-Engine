import { SCENE_OPERATION_TYPES } from "../../../engine-adapter/index.js";

const PATCH_FIELDS = ["variant", "disabled", "active"];

export function createSidebarContentItemPatchOperation({
  sidebarItemId,
  contentItemId,
  patch
} = {}) {
  return {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: normalizeOptionalId(sidebarItemId),
    payload: {
      contentItemId: normalizeOptionalId(contentItemId),
      patch: normalizeContentItemPatch(patch)
    }
  };
}

function normalizeContentItemPatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return PATCH_FIELDS.reduce((patch, field) => {
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
