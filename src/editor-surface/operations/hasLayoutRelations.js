export function hasLayoutRelationItems(items = []) {
  if (!Array.isArray(items)) {
    return false;
  }

  return items.some((item) => hasDeclaredLayoutRelations(item));
}

function hasDeclaredLayoutRelations(item) {
  const layoutRelations = item?.meta?.layoutRelations;

  return layoutRelations !== null && layoutRelations !== undefined;
}
