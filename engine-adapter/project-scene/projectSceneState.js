export const PROJECT_SCENE_STORAGE_VERSION = 2;

export const PROJECT_SCENE_OPERATION_SCOPES = {
  SHELL: "shell",
  WORKSPACE: "workspace",
  UNKNOWN: "unknown"
};

export function createProjectSceneState({
  activePageId = null,
  activeWorkspaceId = null,
  shellItems = [],
  workspaceItemsById = {},
  fallbackWorkspaceItems = []
} = {}) {
  const resolvedActiveWorkspaceId = normalizeOptionalId(activeWorkspaceId);
  const resolvedWorkspaceItemsById = normalizeWorkspaceItemsById(workspaceItemsById);

  if (
    resolvedActiveWorkspaceId &&
    !Object.hasOwn(resolvedWorkspaceItemsById, resolvedActiveWorkspaceId) &&
    Array.isArray(fallbackWorkspaceItems)
  ) {
    resolvedWorkspaceItemsById[resolvedActiveWorkspaceId] = normalizeItems(fallbackWorkspaceItems);
  }

  return {
    activePageId: normalizeOptionalId(activePageId),
    activeWorkspaceId: resolvedActiveWorkspaceId,
    shellItems: normalizeItems(shellItems),
    workspaceItemsById: resolvedWorkspaceItemsById
  };
}

export function resolveActiveWorkspaceItems(input = {}) {
  const state = resolveProjectSceneStateInput(input);
  const workspaceItems = state.workspaceItemsById[state.activeWorkspaceId];

  return Array.isArray(workspaceItems) ? workspaceItems : [];
}

export function resolveVisibleProjectSceneItems(input = {}) {
  const state = resolveProjectSceneStateInput(input);

  return [
    ...state.shellItems,
    ...resolveActiveWorkspaceItems({ projectScene: state })
  ];
}

export function resolveWorkspaceItemsFromVisibleProjectSceneItems({
  projectScene,
  visibleItems = [],
  isShellItem = null
} = {}) {
  const state = resolveProjectSceneStateInput({ projectScene });
  const shellIds = new Set(
    state.shellItems
      .map((item) => normalizeOptionalId(item?.id))
      .filter(Boolean)
  );

  return normalizeItems(visibleItems).filter((item) => {
    const id = normalizeOptionalId(item?.id);

    return (
      (!id || !shellIds.has(id)) &&
      !matchesShellItemPolicy(item, isShellItem)
    );
  });
}

export function resolveShellItemsFromVisibleProjectSceneItems({
  projectScene,
  visibleItems = [],
  isShellItem = null
} = {}) {
  const state = resolveProjectSceneStateInput({ projectScene });
  const shellIds = new Set(
    state.shellItems
      .map((item) => normalizeOptionalId(item?.id))
      .filter(Boolean)
  );

  return normalizeItems(visibleItems).filter((item) => {
    const id = normalizeOptionalId(item?.id);

    return (id && shellIds.has(id)) || matchesShellItemPolicy(item, isShellItem);
  });
}

export function resolveProjectSceneWithActiveWorkspaceItems({
  projectScene,
  workspaceItems = []
} = {}) {
  const state = resolveProjectSceneStateInput({ projectScene });

  if (!state.activeWorkspaceId) {
    return state;
  }

  return createProjectSceneState({
    ...state,
    workspaceItemsById: {
      ...state.workspaceItemsById,
      [state.activeWorkspaceId]: normalizeItems(workspaceItems)
    }
  });
}

export function resolveProjectSceneWithVisibleItems({
  projectScene,
  visibleItems = [],
  isShellItem = null
} = {}) {
  const state = resolveProjectSceneStateInput({ projectScene });
  const workspaceItems = resolveWorkspaceItemsFromVisibleProjectSceneItems({
    projectScene: state,
    visibleItems,
    isShellItem
  });
  const shellItems = resolveShellItemsFromVisibleProjectSceneItems({
    projectScene: state,
    visibleItems,
    isShellItem
  });

  return createProjectSceneState({
    ...state,
    shellItems,
    workspaceItemsById: state.activeWorkspaceId
      ? {
          ...state.workspaceItemsById,
          [state.activeWorkspaceId]: workspaceItems
        }
      : state.workspaceItemsById
  });
}

export function resolveProjectSceneWithShellItemPolicy({
  projectScene,
  isShellItem = null
} = {}) {
  const state = resolveProjectSceneStateInput({ projectScene });

  if (typeof isShellItem !== "function") {
    return state;
  }

  const shellItems = [];
  const seenShellIds = new Set();
  const workspaceItemsById = {};

  for (const item of state.shellItems) {
    addUniqueShellItem(shellItems, seenShellIds, item);
  }

  for (const [workspaceId, workspaceItems] of Object.entries(state.workspaceItemsById)) {
    workspaceItemsById[workspaceId] = [];

    for (const item of workspaceItems) {
      if (matchesShellItemPolicy(item, isShellItem)) {
        addUniqueShellItem(shellItems, seenShellIds, item);
        continue;
      }

      workspaceItemsById[workspaceId].push(item);
    }
  }

  return createProjectSceneState({
    ...state,
    shellItems,
    workspaceItemsById
  });
}

export function resolveProjectSceneOperationScope({
  projectScene,
  targetId = null,
  operation = null,
  fallbackScope = PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE
} = {}) {
  const explicitScope = resolveProjectSceneScope(
    operation?.scope ??
    operation?.sceneScope ??
    operation?.payload?.scope ??
    operation?.payload?.sceneScope ??
    operation?.meta?.scope ??
    operation?.meta?.sceneScope
  );

  if (explicitScope !== PROJECT_SCENE_OPERATION_SCOPES.UNKNOWN) {
    return createOperationScopeResult({
      scope: explicitScope,
      reason: "explicit-scope",
      targetId
    });
  }

  const state = resolveProjectSceneStateInput({ projectScene });
  const resolvedTargetId = normalizeOptionalId(targetId ?? operation?.targetId);

  if (!resolvedTargetId) {
    return createOperationScopeResult({
      scope: resolveProjectSceneScope(fallbackScope, PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE),
      reason: "fallback-scope",
      targetId: null
    });
  }

  const inShell = hasItemId(state.shellItems, resolvedTargetId);
  const inWorkspace = hasItemId(resolveActiveWorkspaceItems({ projectScene: state }), resolvedTargetId);

  if (inShell && inWorkspace) {
    return createOperationScopeResult({
      scope: PROJECT_SCENE_OPERATION_SCOPES.UNKNOWN,
      reason: "ambiguous-target",
      targetId: resolvedTargetId
    });
  }

  if (inShell) {
    return createOperationScopeResult({
      scope: PROJECT_SCENE_OPERATION_SCOPES.SHELL,
      reason: "target-in-shell",
      targetId: resolvedTargetId
    });
  }

  if (inWorkspace) {
    return createOperationScopeResult({
      scope: PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE,
      reason: "target-in-active-workspace",
      targetId: resolvedTargetId
    });
  }

  return createOperationScopeResult({
    scope: resolveProjectSceneScope(fallbackScope, PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE),
    reason: "fallback-scope",
    targetId: resolvedTargetId
  });
}

export function resolveProjectSceneItemConflicts(input = {}) {
  const state = resolveProjectSceneStateInput(input);
  const occurrencesById = new Map();

  addItemOccurrences(occurrencesById, state.shellItems, PROJECT_SCENE_OPERATION_SCOPES.SHELL);
  addItemOccurrences(
    occurrencesById,
    resolveActiveWorkspaceItems({ projectScene: state }),
    PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE
  );

  return [...occurrencesById.entries()]
    .filter(([, occurrences]) => occurrences.length > 1)
    .map(([id, occurrences]) => ({
      id,
      occurrences
    }));
}

export function createProjectSceneStorageSnapshot(input = {}) {
  const state = resolveProjectSceneStateInput(input);

  return {
    version: PROJECT_SCENE_STORAGE_VERSION,
    activePageId: state.activePageId,
    activeWorkspaceId: state.activeWorkspaceId,
    shellItems: state.shellItems,
    workspaceItemsById: state.workspaceItemsById
  };
}

export function resolveProjectSceneStorageSnapshot(value, {
  fallbackState = {},
  activeWorkspaceId = null
} = {}) {
  if (Array.isArray(value)) {
    const fallback = createProjectSceneState(fallbackState);
    const workspaceId = normalizeOptionalId(activeWorkspaceId) ??
      fallback.activeWorkspaceId ??
      "layout-workspace";

    return createProjectSceneStorageSnapshot({
      ...fallback,
      activeWorkspaceId: workspaceId,
      workspaceItemsById: {
        ...fallback.workspaceItemsById,
        [workspaceId]: value
      }
    });
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return createProjectSceneStorageSnapshot({
      ...createProjectSceneState(fallbackState),
      ...value
    });
  }

  return createProjectSceneStorageSnapshot(fallbackState);
}

function resolveProjectSceneStateInput(input) {
  return createProjectSceneState(input?.projectScene ?? input);
}

function resolveProjectSceneScope(value, fallback = PROJECT_SCENE_OPERATION_SCOPES.UNKNOWN) {
  return Object.values(PROJECT_SCENE_OPERATION_SCOPES).includes(value)
    ? value
    : fallback;
}

function createOperationScopeResult({ scope, reason, targetId }) {
  return {
    scope,
    reason,
    targetId: normalizeOptionalId(targetId)
  };
}

function normalizeWorkspaceItemsById(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((accumulator, [workspaceId, items]) => {
    const resolvedWorkspaceId = normalizeOptionalId(workspaceId);

    if (!resolvedWorkspaceId) {
      return accumulator;
    }

    accumulator[resolvedWorkspaceId] = normalizeItems(items);
    return accumulator;
  }, {});
}

function normalizeItems(items) {
  return Array.isArray(items) ? items : [];
}

function hasItemId(items, targetId) {
  return items.some((item) => normalizeOptionalId(item?.id) === targetId);
}

function addItemOccurrences(occurrencesById, items, scope) {
  for (const item of items) {
    const id = normalizeOptionalId(item?.id);

    if (!id) {
      continue;
    }

    const occurrences = occurrencesById.get(id) ?? [];
    occurrences.push({ scope, item });
    occurrencesById.set(id, occurrences);
  }
}

function addUniqueShellItem(shellItems, seenShellIds, item) {
  const id = normalizeOptionalId(item?.id);

  if (id && seenShellIds.has(id)) {
    return;
  }

  if (id) {
    seenShellIds.add(id);
  }

  shellItems.push(item);
}

function matchesShellItemPolicy(item, isShellItem) {
  return typeof isShellItem === "function" && Boolean(isShellItem(item));
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
