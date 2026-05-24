import { LAYOUT_RELATION_CHILD_KINDS } from "./layoutRelationContracts.js";
import { normalizeArea } from "./normalizeLayoutRelations.js";
import { resolveLayoutRelationChildOrderForViewport } from "./resolveLayoutRelationChildOrderForViewport.js";
import { resolveLayoutRelationTree } from "./resolveLayoutRelationTree.js";
import {
  LAYOUT_RELATION_VIEWPORT_MODES,
  resolveLayoutRelationViewportMode
} from "./resolveLayoutRelationViewportMode.js";

const STACK_GAP = 1;

export function resolveLayoutRelationProjection({
  items = [],
  metrics = {},
  sourceMetrics = metrics
} = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const viewportMode = resolveLayoutRelationViewportMode(metrics);
  const projectedItems = safeItems.map(cloneItem);

  void sourceMetrics;

  const sourceItemsById = new Map(
    safeItems.map((item) => [String(item?.id ?? "").trim(), item])
  );
  const projectedItemsById = new Map(
    projectedItems.map((item) => [String(item?.id ?? "").trim(), item])
  );
  const { parents, childToParent } = resolveLayoutRelationTree(safeItems);

  for (const parentEntry of parents) {
    const parentItem = projectedItemsById.get(parentEntry.parentId);

    if (!parentItem) {
      continue;
    }

    attachOrderedChildrenMetadata({
      parentItem,
      parentEntry,
      childToParent,
      viewportMode
    });
  }

  if (viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT) {
    return projectedItems;
  }

  for (const parentEntry of parents) {
    const parentItem = projectedItemsById.get(parentEntry.parentId);

    if (!parentItem) {
      continue;
    }

    const stackEntries = buildStackEntries({
      parentEntry,
      childToParent,
      sourceItemsById,
      projectedItemsById,
      viewportMode
    });

    if (stackEntries.length === 0) {
      continue;
    }

    let cursorY = Number(parentItem.y) + Number(parentItem.h) + STACK_GAP;

    for (const entry of stackEntries) {
      const nextArea = resolveChildArea({
        entry,
        parentItem,
        cursorY,
        metrics,
        viewportMode
      });

      applyAreaToItem(entry.item, nextArea, metrics);
      cursorY = nextArea.y + nextArea.h + STACK_GAP;
    }
  }

  return projectedItems;
}

function attachOrderedChildrenMetadata({ parentItem, parentEntry, childToParent, viewportMode }) {
  const relationChildren = collectRelationChildren({
    parentEntry,
    childToParent
  });
  const orderedChildren = resolveLayoutRelationChildOrderForViewport(relationChildren, {
    viewportMode
  }).map(toOrderedChildMetadata);

  parentItem.meta = isRecord(parentItem.meta) ? { ...parentItem.meta } : {};
  parentItem.meta.layoutRelationProjection = {
    viewportMode,
    orderedChildren
  };
}

function collectRelationChildren({ parentEntry, childToParent }) {
  const relationChildren = [];

  for (const relation of parentEntry.relations.children) {
    if (relation.kind === LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM) {
      continue;
    }

    if (String(relation.id) === String(parentEntry.parentId)) {
      continue;
    }

    if (childToParent?.[relation.id] !== parentEntry.parentId) {
      continue;
    }

    relationChildren.push(relation);
  }

  return relationChildren;
}

function toOrderedChildMetadata(relation) {
  return {
    id: relation.id,
    kind: relation.kind,
    role: relation.role,
    priority: relation.priority,
    order: relation.order,
    stack: relation.stack
  };
}

function buildStackEntries({ parentEntry, childToParent, sourceItemsById, projectedItemsById, viewportMode }) {
  const entries = [];

  for (const relation of parentEntry.relations.children) {
    if (relation.kind === LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM) {
      continue;
    }

    if (String(relation.id) === String(parentEntry.parentId)) {
      continue;
    }

    if (childToParent?.[relation.id] !== parentEntry.parentId) {
      continue;
    }

    const sourceItem = sourceItemsById.get(relation.id);
    const projectedItem = projectedItemsById.get(relation.id);

    if (!sourceItem || !projectedItem) {
      continue;
    }

    entries.push({
      relation,
      sourceItem,
      item: projectedItem,
      manualArea: relation.manualAreas?.[viewportMode] ?? null
    });
  }

  const orderedChildIndexById = createOrderedChildIndexById({
    parentEntry,
    childToParent,
    viewportMode
  });

  if (orderedChildIndexById) {
    entries.sort((left, right) =>
      compareStackEntriesByOrderedChildren(left, right, orderedChildIndexById)
    );
  } else {
    entries.sort(compareStackEntries);
  }

  return entries;
}

function createOrderedChildIndexById({ parentEntry, childToParent, viewportMode }) {
  if (viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT) {
    return null;
  }

  const relationChildren = collectRelationChildren({
    parentEntry,
    childToParent
  });
  const orderedChildren = resolveLayoutRelationChildOrderForViewport(relationChildren, {
    viewportMode
  });

  return new Map(orderedChildren.map((child, index) => [child.id, index]));
}

function compareStackEntriesByOrderedChildren(left, right, orderedChildIndexById) {
  const leftIndex = orderedChildIndexById.get(left.relation.id);
  const rightIndex = orderedChildIndexById.get(right.relation.id);

  if (leftIndex !== undefined && rightIndex !== undefined && leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  return compareStackEntries(left, right);
}

function compareStackEntries(left, right) {
  if (left.relation.order !== right.relation.order) {
    return left.relation.order - right.relation.order;
  }

  if (left.relation.priority !== right.relation.priority) {
    return right.relation.priority - left.relation.priority;
  }

  const leftY = Number(left.sourceItem.y);
  const rightY = Number(right.sourceItem.y);

  if (leftY !== rightY) {
    return leftY - rightY;
  }

  const leftX = Number(left.sourceItem.x);
  const rightX = Number(right.sourceItem.x);

  if (leftX !== rightX) {
    return leftX - rightX;
  }

  return left.relation.id.localeCompare(right.relation.id);
}

function resolveChildArea({ entry, parentItem, cursorY, metrics, viewportMode }) {
  const manualArea = normalizeArea(entry.manualArea);

  if (manualArea) {
    return clampAreaToMetrics(manualArea, metrics);
  }

  const parentX = Number(parentItem.x);
  const sourceWidth = Number(entry.sourceItem.w);

  return clampAreaToMetrics(
    {
      x: parentX,
      y: cursorY,
      w: sourceWidth,
      h: Number(entry.sourceItem.h)
    },
    metrics
  );
}

function clampAreaToMetrics(area, metrics) {
  const columns = Math.max(1, Number(metrics?.columns) || 1);
  const rows = Math.max(1, Number(metrics?.rows) || 1);
  const x = clampInteger(area.x, 1, columns);
  const y = clampInteger(area.y, 1, rows);
  const maxWidth = Math.max(1, columns - x + 1);
  const w = clampInteger(area.w, 1, maxWidth);
  const maxHeight = Math.max(1, rows - y + 1);
  const h = clampInteger(area.h, 1, maxHeight);

  return { x, y, w, h };
}

function applyAreaToItem(item, area, metrics) {
  const nextArea = clampAreaToMetrics(area, metrics);

  item.x = nextArea.x;
  item.y = nextArea.y;
  item.w = nextArea.w;
  item.h = nextArea.h;
}

function cloneItem(item) {
  if (!item || typeof item !== "object") {
    return item;
  }

  return {
    ...item,
    meta: isRecord(item.meta) ? { ...item.meta } : item.meta
  };
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampInteger(value, min, max) {
  const number = Math.round(Number(value));

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
}
