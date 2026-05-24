import { LAYOUT_RELATION_CHILD_ROLES } from "./layoutRelationContracts.js";
import { normalizeLayoutRelations } from "./normalizeLayoutRelations.js";
import { resolveLayoutRelationChildOrder } from "./resolveLayoutRelationChildOrder.js";
import { LAYOUT_RELATION_VIEWPORT_MODES } from "./resolveLayoutRelationViewportMode.js";

const ROLE_RANK_ORDER = [
  LAYOUT_RELATION_CHILD_ROLES.CONTENT,
  LAYOUT_RELATION_CHILD_ROLES.ACTION,
  LAYOUT_RELATION_CHILD_ROLES.CONTROL,
  LAYOUT_RELATION_CHILD_ROLES.WARNING,
  LAYOUT_RELATION_CHILD_ROLES.DETAILS,
  LAYOUT_RELATION_CHILD_ROLES.ASIDE,
  LAYOUT_RELATION_CHILD_ROLES.CHILD
];

const ROLE_RANK_BY_ROLE = new Map(
  ROLE_RANK_ORDER.map((role, index) => [role, index])
);

export function resolveLayoutRelationChildOrderForViewport(children = [], options = {}) {
  if (!Array.isArray(children)) {
    return [];
  }

  const viewportMode = normalizeViewportMode(options.viewportMode);

  if (
    viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.MOBILE ||
    viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.NARROW
  ) {
    return resolveLayoutRelationChildOrder(children, { direction: options.direction });
  }

  return resolveDesktopSafeChildOrder(children);
}

function resolveDesktopSafeChildOrder(children) {
  const entries = normalizeLayoutRelations({ children }).children.map((child, originalIndex) => ({
    child,
    originalIndex
  }));

  entries.sort(compareDesktopSafeEntries);

  return entries.map((entry) => entry.child);
}

function compareDesktopSafeEntries(left, right) {
  if (left.child.order !== right.child.order) {
    return left.child.order - right.child.order;
  }

  if (left.child.priority !== right.child.priority) {
    return right.child.priority - left.child.priority;
  }

  const leftRoleRank =
    ROLE_RANK_BY_ROLE.get(left.child.role) ??
    ROLE_RANK_BY_ROLE.get(LAYOUT_RELATION_CHILD_ROLES.CHILD);
  const rightRoleRank =
    ROLE_RANK_BY_ROLE.get(right.child.role) ??
    ROLE_RANK_BY_ROLE.get(LAYOUT_RELATION_CHILD_ROLES.CHILD);

  if (leftRoleRank !== rightRoleRank) {
    return leftRoleRank - rightRoleRank;
  }

  return left.originalIndex - right.originalIndex;
}

function normalizeViewportMode(value) {
  const viewportMode = String(value ?? "").trim();

  if (viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.MOBILE) {
    return LAYOUT_RELATION_VIEWPORT_MODES.MOBILE;
  }

  if (viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.NARROW) {
    return LAYOUT_RELATION_VIEWPORT_MODES.NARROW;
  }

  return LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT;
}
