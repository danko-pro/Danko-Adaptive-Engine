const NAVIGATION_PROBE_MODEL_KEY = "adaptive-engine:navigation-probe-model:v1";

export function loadStoredNavigationProbeModel(fallbackModel) {
  if (!canUseLocalStorage()) {
    return normalizeNavigationProbeModel(fallbackModel);
  }

  try {
    const rawModel = window.localStorage.getItem(NAVIGATION_PROBE_MODEL_KEY);

    if (!rawModel) {
      return normalizeNavigationProbeModel(fallbackModel);
    }

    return normalizeNavigationProbeModel(JSON.parse(rawModel), fallbackModel);
  } catch {
    return normalizeNavigationProbeModel(fallbackModel);
  }
}

export function saveStoredNavigationProbeModel(model) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      NAVIGATION_PROBE_MODEL_KEY,
      JSON.stringify(normalizeNavigationProbeModel(model))
    );
  } catch {
    // localStorage can be unavailable in private mode or when storage quota is exceeded.
  }
}

function normalizeNavigationProbeModel(value, fallbackModel = {}) {
  const fallback = normalizeNavigationProbeModelShallow(fallbackModel);
  const model = normalizeNavigationProbeModelShallow(value);

  return {
    pages: model.pages.length > 0 ? model.pages : fallback.pages,
    routes: model.routes.length > 0 ? model.routes : fallback.routes,
    workspaces: model.workspaces.length > 0 ? model.workspaces : fallback.workspaces
  };
}

function normalizeNavigationProbeModelShallow(value) {
  return {
    pages: normalizeEntityList(value?.pages),
    routes: normalizeEntityList(value?.routes),
    workspaces: normalizeEntityList(value?.workspaces)
  };
}

function normalizeEntityList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && item.id !== undefined && item.id !== null)
    .map((item) => ({
      ...item,
      id: String(item.id)
    }));
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}
