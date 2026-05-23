import { applyOperation, OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import {
  createSidebarElementFromAreaCommand,
  resolveSidebarReservedArea
} from "../../sidebar-element/index.js";
import { BLOCK_CONTENT_TYPES } from "../contracts/blockContentTypes.js";
import { SCENE_OPERATION_ERRORS } from "../contracts/sceneOperationErrors.js";
import { validateItemsAgainstReservedArea } from "../fitting/reservedAreaGeometry.js";
import { resolveSelectionAfterOperation } from "../selection/resolveSelectionAfterOperation.js";
import { mergeScopedSceneItems } from "./mergeScopedSceneItems.js";
import {
  resolveSceneLayoutOccupancyItems,
  restoreSidebarSourceAreas
} from "./resolveSceneLayoutEngineInput.js";
import { resolveSceneOperationScope } from "./resolveSceneOperationScope.js";

export function applyEngineSceneOperation({
  items,
  operation,
  metrics,
  fallbackItems = items
}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const scoped = resolveSceneOperationScope({
    sourceItems,
    operation
  });
  const scopedItems = scoped?.items ?? sourceItems;
  const occupancyItems = resolveSceneLayoutOccupancyItems(scopedItems, metrics);
  const result = applyOperation(occupancyItems, operation, metrics);

  if (!result.valid) {
    return {
      valid: false,
      items: fallbackItems,
      selection: null,
      result
    };
  }

  const scopedResultItems = restoreSidebarSourceAreas({
    sourceItems: scopedItems,
    nextItems: enrichSceneItemsAfterEngineOperation({
      sourceItems: scopedItems,
      items: result.items,
      operation,
      metrics
    }),
    metrics
  });
  const nextItems = scoped
    ? mergeScopedSceneItems({
        sourceItems,
        scopedSourceItems: scopedItems,
        scopedResultItems
      })
    : scopedResultItems;
  const reservedValidation = validateSceneReservedArea({
    sourceItems: nextItems,
    scopedItems: scoped ? scopedResultItems : nextItems,
    operation,
    metrics
  });

  if (!reservedValidation.valid) {
    return {
      valid: false,
      changed: false,
      items: fallbackItems,
      selection: null,
      message: "Зона fixed sidebar недоступна для layout-блоков.",
      result: createReservedAreaRejectionResult({
        result,
        operation,
        items: fallbackItems,
        errors: reservedValidation.errors
      })
    };
  }

  return {
    valid: true,
    items: nextItems,
    selection: resolveSelectionAfterOperation(operation, nextItems, metrics),
    result: patchOperationResultItems(result, nextItems)
  };
}

function validateSceneReservedArea({ sourceItems, scopedItems, operation, metrics }) {
  if (isSidebarCreateOperation(operation)) {
    return {
      valid: true,
      errors: []
    };
  }

  const { reservedArea, participants } = resolveSidebarReservedArea({
    items: sourceItems,
    metrics
  });

  return validateItemsAgainstReservedArea({
    items: scopedItems,
    metrics,
    reservedArea,
    reservedItemIds: participants.map((participant) => participant.id)
  });
}

function enrichSceneItemsAfterEngineOperation({ sourceItems, items, operation, metrics }) {
  const targetItem = findItemById(items, operation?.targetId);

  if (!targetItem || !shouldNormalizeSidebarTarget({ item: targetItem, operation })) {
    return items;
  }

  const sourceItem = findItemById(sourceItems, operation?.targetId);
  const sidebarItem = mergeSidebarMetadata({
    sourceItem,
    resultItem: targetItem
  });

  const sidebarCommand = createSidebarElementFromAreaCommand({
    item: sidebarItem,
    metrics,
    syncDockFromArea: !isSidebarCreateOperation(operation)
  });

  if (!sidebarCommand.valid || !shouldReplaceSidebarTarget({
    sourceItem: targetItem,
    normalizedItem: sidebarCommand.item,
    contractChanged: sidebarCommand.changed
  })) {
    return items;
  }

  return items.map((item) => (
    String(item.id) === String(targetItem.id)
      ? sidebarCommand.item
      : item
  ));
}

function shouldNormalizeSidebarTarget({ item, operation }) {
  return isSidebarCreateOperation(operation) || isSidebarItem(item);
}

function isSidebarCreateOperation(operation) {
  if (operation?.type !== OPERATION_TYPES.CREATE_AREA) {
    return false;
  }

  return String(operation?.meta?.blockType ?? "").trim() === BLOCK_CONTENT_TYPES.SIDEBAR;
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === BLOCK_CONTENT_TYPES.SIDEBAR ||
    Boolean(item?.meta?.sidebar && typeof item.meta.sidebar === "object")
  );
}

function shouldReplaceSidebarTarget({ sourceItem, normalizedItem, contractChanged }) {
  return contractChanged || !areAreasEqual(sourceItem, normalizedItem);
}

function areAreasEqual(left, right) {
  return (
    Number(left?.x) === Number(right?.x) &&
    Number(left?.y) === Number(right?.y) &&
    Number(left?.w) === Number(right?.w) &&
    Number(left?.h) === Number(right?.h)
  );
}

function mergeSidebarMetadata({ sourceItem, resultItem }) {
  const sourceSidebar = normalizeRecord(sourceItem?.meta?.sidebar);
  const resultSidebar = normalizeRecord(resultItem?.meta?.sidebar);

  return {
    ...resultItem,
    meta: {
      ...(resultItem?.meta ?? {}),
      sidebar: {
        ...sourceSidebar,
        ...resultSidebar
      }
    }
  };
}

function findItemById(items, itemId) {
  if (itemId === undefined || itemId === null) {
    return null;
  }

  return items.find((item) => String(item?.id) === String(itemId)) ?? null;
}

function normalizeRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function patchOperationResultItems(result, nextItems) {
  return {
    ...result,
    items: nextItems,
    data: {
      ...(result.data ?? {}),
      items: nextItems
    }
  };
}

function createReservedAreaRejectionResult({ result, operation, items, errors }) {
  const normalizedErrors = Array.isArray(errors) && errors.length > 0
    ? errors
    : [{ type: SCENE_OPERATION_ERRORS.NO_SPACE_AFTER_FIXED_SIDEBAR }];
  const rejectionCode = normalizedErrors[0]?.type ?? SCENE_OPERATION_ERRORS.NO_SPACE_AFTER_FIXED_SIDEBAR;

  return {
    ...result,
    valid: false,
    rejected: true,
    items,
    data: {
      ...(result?.data ?? {}),
      items
    },
    errors: normalizedErrors,
    rejection: {
      code: rejectionCode,
      source: "engine-adapter",
      targetId: operation?.targetId ?? null,
      details: {
        operationType: operation?.type ?? null,
        errors: normalizedErrors
      }
    },
    report: {
      ...(result?.report ?? {}),
      valid: false,
      type: operation?.type ?? result?.report?.type ?? "scene-operation",
      targetId: operation?.targetId ?? result?.report?.targetId ?? null,
      rejected: true,
      rejectionCode,
      canSuggest: false,
      changed: false,
      beforeCount: items.length,
      afterCount: items.length,
      errors: normalizedErrors,
      errorsByType: countErrorsByType(normalizedErrors)
    }
  };
}

function countErrorsByType(errors) {
  return errors.reduce((accumulator, error) => {
    const type = error.type ?? SCENE_OPERATION_ERRORS.NO_SPACE_AFTER_FIXED_SIDEBAR;
    accumulator[type] = (accumulator[type] ?? 0) + 1;

    return accumulator;
  }, {});
}
