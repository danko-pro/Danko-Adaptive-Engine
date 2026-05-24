import { applySidebarContentItemCommand } from "../../sidebar-element/index.js";
import { SCENE_OPERATION_TYPES } from "../contracts/sceneOperationTypes.js";
import { formatAdapterErrorSummary } from "../feedback/formatAdapterFeedback.js";

const COMMAND_TYPE = SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM;

export function applySidebarContentItemSceneOperation({
  item,
  contentItemId,
  patch,
  items,
  geometryTarget,
  viewportArea
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const sourceItem = findItemById(sourceItems, item?.id);

  if (!sourceItem) {
    return createCommandError({
      items: sourceItems,
      targetId: item?.id ?? null,
      contentItemId,
      errors: [createError("SIDEBAR_INVALID_ITEM")]
    });
  }

  const safePatch = isRecord(patch) ? patch : {};

  const sidebarCommand = applySidebarContentItemCommand({
    item: sourceItem,
    contentItemId,
    patch: safePatch,
    geometryTarget,
    viewportArea
  });

  if (!sidebarCommand.valid) {
    return createCommandError({
      items: sourceItems,
      targetId: sourceItem.id,
      contentItemId,
      errors: [createError(resolveSidebarContentErrorCode(sidebarCommand.reason), {
        reason: sidebarCommand.reason,
        ...(sidebarCommand.details ?? {})
      })]
    });
  }

  const nextItems = replaceItem(sourceItems, sidebarCommand.item);

  return createCommandSuccess({
    sourceItems,
    items: nextItems,
    targetId: sourceItem.id,
    contentItemId: sidebarCommand.contentItem?.id ?? contentItemId,
    changed: sidebarCommand.changed,
    contentItem: sidebarCommand.contentItem
  });
}

function createCommandSuccess({
  sourceItems,
  items,
  targetId,
  contentItemId,
  changed,
  contentItem
}) {
  return {
    valid: true,
    changed,
    items,
    selection: null,
    contentItem,
    message: changed
      ? "Sidebar content item обновлен."
      : "Sidebar content item уже согласован.",
    result: createResult({
      valid: true,
      sourceItems,
      items,
      targetId,
      contentItemId,
      changed,
      contentItem,
      errors: []
    })
  };
}

function createCommandError({
  items,
  targetId,
  contentItemId,
  errors
}) {
  const result = createResult({
    valid: false,
    sourceItems: items,
    items,
    targetId,
    contentItemId,
    changed: false,
    contentItem: null,
    errors
  });

  return {
    valid: false,
    changed: false,
    items,
    selection: null,
    contentItem: null,
    message: formatAdapterErrorSummary(errors),
    result
  };
}

function createResult({
  valid,
  sourceItems,
  items,
  targetId,
  contentItemId,
  changed,
  contentItem,
  errors
}) {
  const normalizedErrors = Array.isArray(errors) ? errors : [];
  const rejection = valid ? null : {
    code: normalizedErrors[0]?.type ?? "SIDEBAR_CONTENT_ITEM_INVALID",
    source: "engine-adapter",
    targetId,
    details: {
      contentItemId,
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
      contentItemId,
      contentItem
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
      contentItemId,
      contentItem
    }
  };
}

function resolveSidebarContentErrorCode(reason) {
  if (reason === "content-item-not-found" || reason === "invalid-content-item") {
    return "SIDEBAR_CONTENT_ITEM_NOT_FOUND";
  }

  if (reason === "content-item-overlap") {
    return "SIDEBAR_CONTENT_ITEM_COLLISION";
  }

  return "SIDEBAR_INVALID_ITEM";
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

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function countErrorsByType(errors) {
  return errors.reduce((accumulator, error) => {
    const type = error.type ?? "SIDEBAR_CONTENT_ITEM_INVALID";
    accumulator[type] = (accumulator[type] ?? 0) + 1;

    return accumulator;
  }, {});
}
