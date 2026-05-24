import { normalizeLayoutRelations } from "./normalizeLayoutRelations.js";

export function resolveLayoutRelationTree(items = []) {
  const safeItems = Array.isArray(items) ? items : [];
  const itemsById = new Map(
    safeItems.map((item) => [String(item?.id ?? "").trim(), item])
  );
  const parents = [];
  const childToParent = {};

  for (const parentItem of safeItems) {
    if (!hasDeclaredLayoutRelations(parentItem)) {
      continue;
    }

    const parentId = String(parentItem.id ?? "").trim();
    const relations = normalizeLayoutRelations(parentItem.meta.layoutRelations);
    const resolvedChildren = [];
    const unresolvedChildren = [];

    for (const relation of relations.children) {
      const childItem = itemsById.get(relation.id);

      if (childItem) {
        resolvedChildren.push(childItem);
      } else {
        unresolvedChildren.push(relation);
      }

      if (!Object.hasOwn(childToParent, relation.id)) {
        childToParent[relation.id] = parentId;
      }
    }

    parents.push({
      parentId,
      parentItem,
      relations,
      resolvedChildren,
      unresolvedChildren
    });
  }

  return {
    parents,
    childToParent
  };
}

function hasDeclaredLayoutRelations(item) {
  const layoutRelations = item?.meta?.layoutRelations;

  return layoutRelations !== null && layoutRelations !== undefined;
}
