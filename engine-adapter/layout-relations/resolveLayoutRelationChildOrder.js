import { LAYOUT_RELATION_CHILD_ROLES } from "./layoutRelationContracts.js";
import { normalizeLayoutRelations } from "./normalizeLayoutRelations.js";

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
const MAX_ROLE_RANK = ROLE_RANK_ORDER.length - 1;

export function resolveLayoutRelationChildOrder(children = [], options = {}) {
  if (!Array.isArray(children)) {
    return [];
  }

  const direction = normalizeDirection(options.direction);
  const entries = normalizeLayoutRelations({ children }).children.map((child, originalIndex) => ({
    child,
    originalIndex
  }));

  entries.sort((left, right) => compareEntries(left, right, direction));

  return entries.map((entry) => entry.child);
}

function compareEntries(left, right, direction) {
  const leftRoleRank = resolveRoleRank(left.child.role, direction);
  const rightRoleRank = resolveRoleRank(right.child.role, direction);

  if (leftRoleRank !== rightRoleRank) {
    return leftRoleRank - rightRoleRank;
  }

  if (left.child.priority !== right.child.priority) {
    return right.child.priority - left.child.priority;
  }

  if (left.child.order !== right.child.order) {
    return left.child.order - right.child.order;
  }

  return left.originalIndex - right.originalIndex;
}

function resolveRoleRank(role, direction) {
  const defaultRank = ROLE_RANK_BY_ROLE.get(role) ?? ROLE_RANK_BY_ROLE.get(LAYOUT_RELATION_CHILD_ROLES.CHILD);

  if (direction === "reverse") {
    return MAX_ROLE_RANK - defaultRank;
  }

  return defaultRank;
}

function normalizeDirection(value) {
  const direction = String(value ?? "").trim();

  if (direction === "reverse") {
    return "reverse";
  }

  return "default";
}
