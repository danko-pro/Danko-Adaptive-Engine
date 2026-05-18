import { OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import {
  SIDEBAR_LAYERS,
  SIDEBAR_STATES,
  createSidebarSceneProjection,
  resolveSidebarLayer
} from "../../sidebar-element/index.js";
import { BLOCK_CONTENT_TYPES } from "../contracts/blockContentTypes.js";

export function resolveSceneOperationScope({ sourceItems, operation }) {
  if (!operation?.type) {
    return null;
  }

  const projection = createSidebarSceneProjection(sourceItems);
  const layer = operation.type === OPERATION_TYPES.CREATE_AREA
    ? resolveCreateOperationLayer(operation)
    : resolveTargetOperationLayer(sourceItems, operation);

  if (!layer) {
    return null;
  }

  return {
    layer,
    items: layer === SIDEBAR_LAYERS.OVERLAY
      ? projection.overlayItems
      : projection.layoutItems
  };
}

function resolveCreateOperationLayer(operation) {
  if (!isSidebarCreateOperation(operation)) {
    return SIDEBAR_LAYERS.LAYOUT;
  }

  const state = String(operation?.meta?.sidebar?.state ?? SIDEBAR_STATES.OVERLAY).trim();
  return state === SIDEBAR_STATES.FIXED ? SIDEBAR_LAYERS.LAYOUT : SIDEBAR_LAYERS.OVERLAY;
}

function resolveTargetOperationLayer(items, operation) {
  const target = items.find((item) => String(item.id) === String(operation?.targetId));

  if (!target) {
    return null;
  }

  return resolveSidebarLayer(target);
}

function isSidebarCreateOperation(operation) {
  if (operation?.type !== OPERATION_TYPES.CREATE_AREA) {
    return false;
  }

  return String(operation?.meta?.blockType ?? "").trim() === BLOCK_CONTENT_TYPES.SIDEBAR;
}
