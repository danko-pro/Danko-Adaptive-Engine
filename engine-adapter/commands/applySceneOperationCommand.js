import { OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import { formatAdapterErrorSummary } from "../feedback/formatAdapterFeedback.js";
import { SCENE_OPERATION_ERRORS } from "../contracts/sceneOperationErrors.js";
import { SCENE_OPERATION_TYPES } from "../contracts/sceneOperationTypes.js";
import { applyEngineSceneOperation as applyEngineSceneHandler } from "../scene/applyEngineSceneOperation.js";
import { applySidebarContentItemSceneOperation as applySidebarContentItemSceneHandler } from "../scene/applySidebarContentItemSceneOperation.js";
import { applySidebarStateSceneOperation as applySidebarStateSceneHandler } from "../scene/applySidebarStateSceneOperation.js";

const ENGINE_OPERATION_TYPES = new Set(Object.values(OPERATION_TYPES));

const SCENE_OPERATION_HANDLERS = [
  {
    accepts: (operation) => (
      operation.type === SCENE_OPERATION_TYPES.SET_SIDEBAR_STATE ||
      operation.type === SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS
    ),
    apply: applySidebarStateSceneOperation
  },
  {
    accepts: (operation) => operation.type === SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    apply: applySidebarContentItemSceneOperation
  },
  {
    accepts: (operation) => ENGINE_OPERATION_TYPES.has(operation.type),
    apply: applyEngineSceneOperation
  }
];

export function applySceneOperationCommand({
  items,
  operation,
  metrics,
  fallbackItems = items,
  sourceMetrics = metrics,
  contentSchemas = {}
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];

  if (!operation?.type) {
    return createSceneOperationError({
      items: sourceItems,
      operation,
      code: SCENE_OPERATION_ERRORS.INVALID_SCENE_OPERATION
    });
  }

  const handler = resolveSceneOperationHandler(operation);

  if (handler) {
    return handler({
      sourceItems,
      operation,
      metrics,
      fallbackItems,
      sourceMetrics,
      contentSchemas
    });
  }

  return createSceneOperationError({
    items: sourceItems,
    operation,
    code: SCENE_OPERATION_ERRORS.UNKNOWN_SCENE_OPERATION
  });
}

function resolveSceneOperationHandler(operation) {
  return SCENE_OPERATION_HANDLERS.find((handler) => handler.accepts(operation))?.apply ?? null;
}

function applySidebarStateSceneOperation({
  sourceItems,
  operation,
  metrics,
  sourceMetrics,
  contentSchemas
}) {
  return applySidebarStateSceneHandler({
    item: findItemById(sourceItems, operation.targetId),
    state: operation.state ?? operation.payload?.state ?? operation.meta?.sidebar?.state,
    settings: operation.settings ?? operation.payload?.settings ?? operation.meta?.sidebar ?? operation.payload ?? {},
    items: sourceItems,
    metrics,
    sourceMetrics,
    contentSchemas
  });
}

function applySidebarContentItemSceneOperation({
  sourceItems,
  operation
}) {
  return applySidebarContentItemSceneHandler({
    item: findItemById(sourceItems, operation.targetId),
    contentItemId: operation.contentItemId ?? operation.payload?.contentItemId,
    patch: operation.patch ?? operation.payload?.patch ?? operation.payload?.contentItem ?? {},
    items: sourceItems
  });
}

function applyEngineSceneOperation({
  sourceItems,
  operation,
  metrics,
  fallbackItems
}) {
  return applyEngineSceneHandler({
    items: sourceItems,
    operation,
    metrics,
    fallbackItems
  });
}

function createSceneOperationError({ items, operation, code }) {
  const errors = [{ type: code }];
  const result = {
    valid: false,
    rejected: true,
    action: operation?.type ?? "scene-operation",
    items,
    data: {
      items,
      operation
    },
    errors,
    rejection: {
      code,
      source: "engine-adapter",
      targetId: operation?.targetId ?? null,
      details: {
        operationType: operation?.type ?? null
      }
    },
    report: {
      valid: false,
      type: operation?.type ?? "scene-operation",
      targetId: operation?.targetId ?? null,
      rejected: true,
      rejectionCode: code,
      canSuggest: false,
      changed: false,
      beforeCount: items.length,
      afterCount: items.length,
      errors,
      errorsByType: {
        [code]: 1
      }
    },
    meta: {
      errors: errors.length,
      received: items.length
    },
    details: {}
  };

  return {
    valid: false,
    changed: false,
    items,
    selection: null,
    message: formatAdapterErrorSummary(errors),
    result
  };
}

function findItemById(items, itemId) {
  if (itemId === undefined || itemId === null) {
    return null;
  }

  return items.find((item) => String(item.id) === String(itemId)) ?? null;
}
