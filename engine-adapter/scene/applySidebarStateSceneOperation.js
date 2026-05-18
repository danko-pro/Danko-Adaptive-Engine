import {
  SIDEBAR_LAYERS,
  SIDEBAR_STATES,
  applySidebarSettingsCommand,
  resolveSidebarLayer,
  resolveSidebarState
} from "../../sidebar-element/index.js";
import { formatAdapterErrorSummary } from "../feedback/formatAdapterFeedback.js";
import { resolveSelectionAfterOperation } from "../selection/resolveSelectionAfterOperation.js";
import { fitSceneItemsToGrid } from "./fitSceneItemsToGrid.js";

const COMMAND_TYPE = "set-sidebar-state";

export function applySidebarStateSceneOperation({
  item,
  state,
  items,
  metrics,
  sourceMetrics = metrics,
  contentSchemas = {},
  settings = null
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const sourceItem = findItemById(sourceItems, item?.id);

  if (!sourceItem) {
    return createCommandError({
      items: sourceItems,
      targetId: item?.id ?? null,
      state,
      errors: [createError("SIDEBAR_INVALID_ITEM")]
    });
  }

  const nextSettings = {
    ...(settings && typeof settings === "object" && !Array.isArray(settings) ? settings : {}),
    ...(state !== undefined ? { state } : {})
  };
  const sidebarCommand = applySidebarSettingsCommand({
    item: sourceItem,
    settings: nextSettings
  });

  if (!sidebarCommand.valid) {
    return createCommandError({
      items: sourceItems,
      targetId: sourceItem.id,
      state,
      errors: [createError("SIDEBAR_INVALID_ITEM", { reason: sidebarCommand.reason })]
    });
  }

  const requestedState = resolveSidebarState(
    sidebarCommand.item.meta?.sidebar?.state ?? state,
    SIDEBAR_STATES.OVERLAY
  );
  const stateItems = replaceItem(sourceItems, sidebarCommand.item);
  const previousLayer = resolveSidebarLayer(sourceItem);
  const nextLayer = resolveSidebarLayer(sidebarCommand.item);

  if (nextLayer !== SIDEBAR_LAYERS.LAYOUT || previousLayer === SIDEBAR_LAYERS.LAYOUT) {
    return createCommandSuccess({
      sourceItems,
      items: stateItems,
      targetId: sourceItem.id,
      state: requestedState,
      changed: sidebarCommand.changed,
      projection: null,
      metrics,
      message: `Sidebar: ${requestedState}. Overlay layer не меняет layout блоков.`
    });
  }

  const projection = fitSceneItemsToGrid({
    items: stateItems,
    metrics,
    sourceMetrics,
    contentSchemas
  });

  if (!projection.valid) {
    return createCommandError({
      items: sourceItems,
      targetId: sourceItem.id,
      state: requestedState,
      errors: [
        createError("SIDEBAR_RECONCILE_FAILED", {
          reason: projection.reason,
          errors: projection.errors ?? []
        })
      ],
      projection
    });
  }

  const changed = sidebarCommand.changed || projection.changed || !areSameItems(sourceItems, projection.items);

  return createCommandSuccess({
    sourceItems,
    items: projection.items,
    targetId: sourceItem.id,
    state: requestedState,
    changed,
    projection,
    metrics,
    message: projection.changed
      ? "Sidebar закреплен: layout блоки перестроены."
      : "Sidebar закреплен: layout уже согласован."
  });
}

function createCommandSuccess({
  sourceItems,
  items,
  targetId,
  state,
  changed,
  projection,
  metrics,
  message
}) {
  const operation = {
    type: COMMAND_TYPE,
    targetId
  };

  return {
    valid: true,
    changed,
    items,
    selection: resolveSelectionAfterOperation(operation, items, metrics),
    sidebar: findItemById(items, targetId)?.meta?.sidebar ?? null,
    projection,
    message,
    result: createResult({
      valid: true,
      sourceItems,
      items,
      targetId,
      state,
      changed,
      errors: [],
      projection
    })
  };
}

function createCommandError({
  items,
  targetId,
  state,
  errors,
  projection = null
}) {
  const result = createResult({
    valid: false,
    sourceItems: items,
    items,
    targetId,
    state,
    changed: false,
    errors,
    projection
  });

  return {
    valid: false,
    changed: false,
    items,
    selection: null,
    sidebar: null,
    projection,
    message: formatAdapterErrorSummary(errors),
    result
  };
}

function createResult({
  valid,
  sourceItems,
  items,
  targetId,
  state,
  changed,
  errors,
  projection
}) {
  const normalizedErrors = Array.isArray(errors) ? errors : [];
  const rejection = valid ? null : {
    code: normalizedErrors[0]?.type ?? "SIDEBAR_STATE_INVALID",
    source: "engine-adapter",
    targetId,
    details: {
      state,
      errors: normalizedErrors
    }
  };

  return {
    valid,
    rejected: Boolean(rejection),
    action: COMMAND_TYPE,
    items,
    data: {
      items,
      targetId,
      state
    },
    errors: normalizedErrors,
    rejection,
    report: {
      valid,
      type: COMMAND_TYPE,
      targetId,
      rejected: Boolean(rejection),
      rejectionCode: rejection?.code ?? null,
      canSuggest: false,
      changed,
      beforeCount: sourceItems.length,
      afterCount: items.length,
      errors: normalizedErrors,
      errorsByType: countErrorsByType(normalizedErrors)
    },
    meta: {
      errors: normalizedErrors.length,
      received: sourceItems.length
    },
    details: {
      projection
    }
  };
}

function replaceItem(items, nextItem) {
  return items.map((item) => (
    String(item.id) === String(nextItem.id)
      ? nextItem
      : item
  ));
}

function findItemById(items, itemId) {
  if (itemId === undefined || itemId === null) {
    return null;
  }

  return items.find((item) => String(item.id) === String(itemId)) ?? null;
}

function createError(type, details = {}) {
  return {
    type,
    details
  };
}

function countErrorsByType(errors) {
  return errors.reduce((accumulator, error) => {
    const type = error.type ?? "SIDEBAR_STATE_INVALID";
    accumulator[type] = (accumulator[type] ?? 0) + 1;

    return accumulator;
  }, {});
}

function areSameItems(leftItems, rightItems) {
  return JSON.stringify(leftItems) === JSON.stringify(rightItems);
}
