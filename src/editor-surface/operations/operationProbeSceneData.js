export { createContentSchemasFromItems } from "../../../engine-adapter/index.js";

export function createDependenciesFromItems(items) {
  return Object.fromEntries(
    items
      .map((item) => [item.id, normalizeItemDependencies(item)])
      .filter(([, dependencies]) => dependencies.length > 0)
  );
}

export function areSameItems(leftItems, rightItems) {
  return createItemsSignature(leftItems) === createItemsSignature(rightItems);
}

export function createItemsSignature(items) {
  if (!Array.isArray(items)) {
    return "invalid";
  }

  return items
    .map((item) => [
      String(item.id),
      Number(item.x),
      Number(item.y),
      Number(item.w),
      Number(item.h)
    ].join(":"))
    .join("|");
}

function normalizeItemDependencies(item) {
  const value = item?.meta?.dependencies ?? item?.meta?.dependsOn ?? item?.meta?.linkedTo;

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((dependency) => String(dependency))
    .filter(Boolean);
}
