import {
  createProjectSceneStorageSnapshot,
  resolveProjectSceneStorageSnapshot
} from "../../../engine-adapter/index.js";

const OPERATION_PROBE_ITEMS_KEY = "adaptive-engine:operation-probe-items:v1";
const OPERATION_PROBE_PROJECT_SCENE_KEY = "adaptive-engine:operation-probe-project-scene:v2";

export function loadStoredOperationProbeProjectScene(fallbackState) {
  if (!canUseLocalStorage()) {
    return createProjectSceneStorageSnapshot(fallbackState);
  }

  try {
    const rawSnapshot = window.localStorage.getItem(OPERATION_PROBE_PROJECT_SCENE_KEY);

    if (rawSnapshot) {
      return resolveProjectSceneStorageSnapshot(JSON.parse(rawSnapshot), {
        fallbackState
      });
    }

    const rawLegacyItems = window.localStorage.getItem(OPERATION_PROBE_ITEMS_KEY);

    if (rawLegacyItems) {
      return resolveProjectSceneStorageSnapshot(JSON.parse(rawLegacyItems), {
        fallbackState,
        activeWorkspaceId: fallbackState?.activeWorkspaceId
      });
    }
  } catch {
    return createProjectSceneStorageSnapshot(fallbackState);
  }

  return createProjectSceneStorageSnapshot(fallbackState);
}

export function saveStoredOperationProbeProjectScene(projectScene) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      OPERATION_PROBE_PROJECT_SCENE_KEY,
      JSON.stringify(createProjectSceneStorageSnapshot(projectScene))
    );
  } catch {
    // localStorage может быть недоступен в приватном режиме или при лимите хранилища.
  }
}

export function loadStoredOperationProbeItems(fallbackItems) {
  if (!canUseLocalStorage()) {
    return fallbackItems;
  }

  try {
    const rawItems = window.localStorage.getItem(OPERATION_PROBE_ITEMS_KEY);

    if (!rawItems) {
      return fallbackItems;
    }

    const items = JSON.parse(rawItems);

    return isValidOperationProbeItems(items) ? items : fallbackItems;
  } catch {
    return fallbackItems;
  }
}

export function saveStoredOperationProbeItems(items) {
  if (!canUseLocalStorage() || !isValidOperationProbeItems(items)) {
    return;
  }

  try {
    window.localStorage.setItem(OPERATION_PROBE_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // localStorage может быть недоступен в приватном режиме или при лимите хранилища.
  }
}

export function isValidOperationProbeItems(items) {
  return (
    Array.isArray(items) &&
    items.every(isValidOperationProbeItem) &&
    hasUniqueItemIds(items) &&
    !hasItemCollisions(items)
  );
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isValidOperationProbeItem(item) {
  return (
    item &&
    item.id !== undefined &&
    item.id !== null &&
    String(item.id).trim() !== "" &&
    isPositiveGridNumber(item.x) &&
    isPositiveGridNumber(item.y) &&
    isPositiveGridNumber(item.w) &&
    isPositiveGridNumber(item.h)
  );
}

function isPositiveGridNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 1;
}

function hasUniqueItemIds(items) {
  const ids = new Set();

  for (const item of items) {
    const id = String(item.id);

    if (ids.has(id)) {
      return false;
    }

    ids.add(id);
  }

  return true;
}

function hasItemCollisions(items) {
  for (let firstIndex = 0; firstIndex < items.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < items.length; secondIndex += 1) {
      if (detectItemCollision(items[firstIndex], items[secondIndex])) {
        return true;
      }
    }
  }

  return false;
}

function detectItemCollision(firstItem, secondItem) {
  const firstRight = Number(firstItem.x) + Number(firstItem.w) - 1;
  const firstBottom = Number(firstItem.y) + Number(firstItem.h) - 1;
  const secondRight = Number(secondItem.x) + Number(secondItem.w) - 1;
  const secondBottom = Number(secondItem.y) + Number(secondItem.h) - 1;

  return !(
    firstRight < Number(secondItem.x) ||
    secondRight < Number(firstItem.x) ||
    firstBottom < Number(secondItem.y) ||
    secondBottom < Number(firstItem.y)
  );
}
