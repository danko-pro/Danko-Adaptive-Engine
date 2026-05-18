export const SCENE_ITEM_UPDATE_ORIGINS = {
  SOURCE: "source",
  PROJECTION: "projection"
};

export function resolveSceneItemsUpdate({
  nextItems,
  currentItems = [],
  options = {}
} = {}) {
  const visibleItems = resolveVisibleSceneItems(nextItems, currentItems);
  const origin = resolveSceneItemUpdateOrigin(options);

  return {
    visibleItems,
    origin,
    shouldCommitSource: origin === SCENE_ITEM_UPDATE_ORIGINS.SOURCE
  };
}

export function resolveVisibleSceneItems(nextItems, currentItems = []) {
  const resolvedItems = typeof nextItems === "function"
    ? nextItems(currentItems)
    : nextItems;

  return Array.isArray(resolvedItems) ? resolvedItems : currentItems;
}

export function shouldCommitSceneSourceUpdate(options = {}) {
  return resolveSceneItemUpdateOrigin(options) === SCENE_ITEM_UPDATE_ORIGINS.SOURCE;
}

export function resolveStoredSceneSourceItems({
  itemsByWorkspaceId,
  activeWorkspaceId,
  fallbackItems = []
} = {}) {
  const storedItems = itemsByWorkspaceId?.[activeWorkspaceId];

  return Array.isArray(storedItems) ? storedItems : fallbackItems;
}

function resolveSceneItemUpdateOrigin({ origin, projected = false } = {}) {
  if (projected) {
    return SCENE_ITEM_UPDATE_ORIGINS.PROJECTION;
  }

  return Object.values(SCENE_ITEM_UPDATE_ORIGINS).includes(origin)
    ? origin
    : SCENE_ITEM_UPDATE_ORIGINS.SOURCE;
}
