import { LAYOUT_RELATION_CHILD_KINDS } from "./layoutRelationContracts.js";
import { normalizeLayoutRelations } from "./normalizeLayoutRelations.js";
import { resolveLayoutRelationTree } from "./resolveLayoutRelationTree.js";
import {
  LAYOUT_RELATION_VIEWPORT_MODES,
  resolveLayoutRelationViewportMode
} from "./resolveLayoutRelationViewportMode.js";

export function resolveLayoutRelationManualTarget({
  items = [],
  itemId,
  metrics
} = {}) {
  const viewportMode = resolveLayoutRelationViewportMode(metrics);
  const inactiveResult = createInactiveResult(viewportMode);
  const resolvedItemId = String(itemId ?? "").trim();

  if (viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT) {
    return inactiveResult;
  }

  if (!resolvedItemId) {
    return inactiveResult;
  }

  const safeItems = Array.isArray(items) ? items : [];
  const item = safeItems.find((entry) => String(entry?.id ?? "").trim() === resolvedItemId);

  if (!item) {
    return inactiveResult;
  }

  const { childToParent } = resolveLayoutRelationTree(safeItems);
  const parentId = childToParent[resolvedItemId];

  if (!parentId) {
    return inactiveResult;
  }

  const parentItem = safeItems.find((entry) => String(entry?.id ?? "").trim() === parentId);

  if (!parentItem) {
    return inactiveResult;
  }

  const relations = normalizeLayoutRelations(parentItem.meta?.layoutRelations);
  const relation = relations.children.find((child) => child.id === resolvedItemId);

  if (!relation) {
    return inactiveResult;
  }

  if (relation.kind === LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM) {
    return inactiveResult;
  }

  return {
    shouldUseManualOverride: true,
    parentId,
    childId: resolvedItemId,
    viewportMode
  };
}

function createInactiveResult(viewportMode) {
  return {
    shouldUseManualOverride: false,
    parentId: null,
    childId: null,
    viewportMode
  };
}
