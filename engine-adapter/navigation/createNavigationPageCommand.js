export function createNavigationPageCommand({
  pages = [],
  routes = [],
  workspaces = [],
  title = null,
  pageTitlePrefix = "Page"
} = {}) {
  const normalizedPages = normalizeEntityList(pages);
  const normalizedRoutes = normalizeEntityList(routes);
  const normalizedWorkspaces = normalizeEntityList(workspaces);
  const nextIndex = resolveNextPageIndex(normalizedPages);
  const pageTitle = normalizeText(title) ?? `${pageTitlePrefix} ${nextIndex}`;
  const pageId = createUniqueId({
    prefix: "page",
    suffix: "page",
    preferredIndex: nextIndex,
    usedIds: new Set(normalizedPages.map((page) => page.id))
  });
  const routeId = createUniqueId({
    prefix: "route",
    suffix: "route",
    preferredIndex: nextIndex,
    usedIds: new Set(normalizedRoutes.map((route) => route.id))
  });
  const workspaceId = createUniqueId({
    prefix: "workspace",
    suffix: "workspace",
    preferredIndex: nextIndex,
    usedIds: new Set(normalizedWorkspaces.map((workspace) => workspace.id))
  });
  const page = {
    id: pageId,
    title: pageTitle,
    routeId,
    workspaceId
  };
  const route = {
    id: routeId,
    path: `/${pageId}`,
    workspaceId
  };
  const workspace = {
    id: workspaceId
  };

  return {
    valid: true,
    changed: true,
    page,
    route,
    workspace,
    pages: [...normalizedPages, page],
    routes: [...normalizedRoutes, route],
    workspaces: [...normalizedWorkspaces, workspace],
    activePageId: pageId,
    activeRouteId: routeId,
    activeWorkspaceId: workspaceId
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

function resolveNextPageIndex(pages) {
  const numericSuffixes = pages
    .map((page) => {
      const match = String(page.id).match(/(\d+)(?:-[a-z]+)?$/);

      return match ? Number(match[1]) : null;
    })
    .filter((value) => Number.isFinite(value));

  return Math.max(pages.length + 1, 1, ...numericSuffixes.map((value) => value + 1));
}

function createUniqueId({ prefix, suffix, preferredIndex, usedIds }) {
  let index = Math.max(1, Math.round(Number(preferredIndex) || 1));
  let id = `${prefix}-${index}-${suffix}`;

  while (usedIds.has(id)) {
    index += 1;
    id = `${prefix}-${index}-${suffix}`;
  }

  usedIds.add(id);
  return id;
}

function normalizeText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
