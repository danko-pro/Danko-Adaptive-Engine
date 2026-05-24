import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import { createAdapterResult } from "../contracts/createAdapterResult.js";
import { LAYOUT_RELATION_CHILD_KINDS } from "./layoutRelationContracts.js";
import { normalizeLayoutRelations } from "./normalizeLayoutRelations.js";

const SUPPORTED_VIEWPORT_MODES = new Set(["narrow", "mobile"]);

export function applyLayoutRelationClearManualAreaCommand({
  items = [],
  parentId,
  childId,
  viewportMode
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const resolvedParentId = String(parentId ?? "").trim();
  const resolvedChildId = String(childId ?? "").trim();
  const resolvedViewportMode = String(viewportMode ?? "").trim();

  if (!SUPPORTED_VIEWPORT_MODES.has(resolvedViewportMode)) {
    return createErrorResult({
      sourceItems,
      message: "Manual area clear supports only narrow or mobile viewport modes."
    });
  }

  if (!resolvedParentId || !resolvedChildId) {
    return createErrorResult({
      sourceItems,
      message: "Parent and child ids are required."
    });
  }

  const parentIndex = sourceItems.findIndex(
    (item) => String(item?.id ?? "").trim() === resolvedParentId
  );

  if (parentIndex < 0) {
    return createErrorResult({
      sourceItems,
      message: `Parent block "${resolvedParentId}" was not found.`
    });
  }

  const childExists = sourceItems.some(
    (item) => String(item?.id ?? "").trim() === resolvedChildId
  );

  if (!childExists) {
    return createErrorResult({
      sourceItems,
      message: `Child block "${resolvedChildId}" was not found.`
    });
  }

  const parentItem = sourceItems[parentIndex];
  const relations = normalizeLayoutRelations(parentItem?.meta?.layoutRelations);
  const childIndex = relations.children.findIndex((child) => child.id === resolvedChildId);

  if (childIndex < 0) {
    return createErrorResult({
      sourceItems,
      message: `Relation child "${resolvedChildId}" was not found.`
    });
  }

  const relationChild = relations.children[childIndex];

  if (relationChild.kind === LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM) {
    return createErrorResult({
      sourceItems,
      message: "Internal content relations cannot be patched through this command."
    });
  }

  const nextItems = sourceItems.map((item, index) => {
    if (index !== parentIndex) {
      return cloneItem(item);
    }

    return patchParentClearManualArea({
      item,
      childIndex,
      viewportMode: resolvedViewportMode
    });
  });

  return createAdapterResult({
    status: ADAPTER_STATUS.OK,
    message: `Manual ${resolvedViewportMode} area cleared for relation child "${resolvedChildId}".`,
    data: {
      items: nextItems,
      changed: true,
      parentId: resolvedParentId,
      childId: resolvedChildId,
      viewportMode: resolvedViewportMode,
      area: null
    }
  });
}

function patchParentClearManualArea({ item, childIndex, viewportMode }) {
  const relations = normalizeLayoutRelations(item?.meta?.layoutRelations);
  const nextChildren = relations.children.map((child, index) => {
    if (index !== childIndex) {
      return {
        ...child,
        manualAreas: cloneManualAreas(child.manualAreas)
      };
    }

    return {
      ...child,
      manualAreas: {
        ...cloneManualAreas(child.manualAreas),
        [viewportMode]: null
      }
    };
  });

  return cloneItem(item, {
    layoutRelations: {
      ...relations,
      children: nextChildren
    }
  });
}

function cloneManualAreas(value) {
  const manualAreas = value && typeof value === "object" ? value : {};

  return {
    narrow: manualAreas.narrow ? { ...manualAreas.narrow } : null,
    mobile: manualAreas.mobile ? { ...manualAreas.mobile } : null
  };
}

function cloneItem(item, metaPatch = null) {
  if (!item || typeof item !== "object") {
    return item;
  }

  const meta = item.meta && typeof item.meta === "object" ? { ...item.meta } : {};

  if (metaPatch?.layoutRelations) {
    meta.layoutRelations = metaPatch.layoutRelations;
  } else if (meta.layoutRelations) {
    meta.layoutRelations = normalizeLayoutRelations(meta.layoutRelations);
  }

  if (Array.isArray(item.meta?.dependencies)) {
    meta.dependencies = [...item.meta.dependencies];
  }

  if (Array.isArray(item.meta?.dependsOn)) {
    meta.dependsOn = [...item.meta.dependsOn];
  }

  if (Array.isArray(item.meta?.linkedTo)) {
    meta.linkedTo = [...item.meta.linkedTo];
  }

  return {
    ...item,
    meta
  };
}

function createErrorResult({ sourceItems, message }) {
  return createAdapterResult({
    status: ADAPTER_STATUS.ERROR,
    message,
    data: {
      items: sourceItems,
      changed: false
    }
  });
}
