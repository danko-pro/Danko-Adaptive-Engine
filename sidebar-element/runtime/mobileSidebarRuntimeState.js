const DEFAULT_VIEWPORT_MODE = "default";
const UNKNOWN_SIDEBAR_ID = "__unknown-sidebar";

export function createMobileSidebarRuntimeState() {
  return {
    openByKey: {}
  };
}

export function resolveMobileSidebarRuntimeKey({
  sidebarItemId,
  viewportMode
} = {}) {
  return `${normalizeKeyPart(sidebarItemId, UNKNOWN_SIDEBAR_ID)}:${normalizeKeyPart(
    viewportMode,
    DEFAULT_VIEWPORT_MODE
  )}`;
}

export function isMobileSidebarMenuOpen(state, options = {}) {
  const key = resolveMobileSidebarRuntimeKey(options);
  const openByKey = normalizeOpenByKey(state);

  return openByKey[key] === true;
}

export function setMobileSidebarMenuOpen(state, options = {}) {
  const key = resolveMobileSidebarRuntimeKey(options);
  const open = Boolean(options.open);
  const openByKey = normalizeOpenByKey(state);

  if (!open) {
    const { [key]: _closed, ...nextOpenByKey } = openByKey;

    return {
      openByKey: nextOpenByKey
    };
  }

  return {
    openByKey: {
      ...openByKey,
      [key]: true
    }
  };
}

export function toggleMobileSidebarMenuOpen(state, options = {}) {
  return setMobileSidebarMenuOpen(state, {
    ...options,
    open: !isMobileSidebarMenuOpen(state, options)
  });
}

export function closeMobileSidebarMenu(state, options = {}) {
  return setMobileSidebarMenuOpen(state, {
    ...options,
    open: false
  });
}

export function closeAllMobileSidebarMenus() {
  return createMobileSidebarRuntimeState();
}

function normalizeOpenByKey(state) {
  if (!isRecord(state?.openByKey)) {
    return {};
  }

  return Object.entries(state.openByKey).reduce((result, [key, value]) => {
    if (value === true) {
      result[key] = true;
    }

    return result;
  }, {});
}

function normalizeKeyPart(value, fallback) {
  const text = String(value ?? "").trim();

  return text || fallback;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
