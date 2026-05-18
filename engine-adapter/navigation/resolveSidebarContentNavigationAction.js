import { SIDEBAR_CONTENT_ACTION_TYPES } from "../../sidebar-element/index.js";

export const SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES = {
  NO_ACTION: "sidebar-content-navigation-no-action",
  MISSING_PAGE: "sidebar-content-navigation-missing-page",
  MISSING_WORKSPACE: "sidebar-content-navigation-missing-workspace",
  READY: "sidebar-content-navigation-ready"
};

export function resolveSidebarContentNavigationAction({
  contentItem = null,
  pages = [],
  routes = [],
  workspaces = []
} = {}) {
  const action = contentItem?.action;

  if (action?.type !== SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE) {
    return createResult({
      valid: false,
      code: SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.NO_ACTION
    });
  }

  const pageId = normalizeOptionalId(action.pageId ?? contentItem?.navigation?.pageId);
  const page = findById(pages, pageId);

  if (!pageId || !page) {
    return createResult({
      valid: false,
      code: SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.MISSING_PAGE,
      pageId
    });
  }

  const routeId = normalizeOptionalId(action.routeId ?? page.routeId ?? contentItem?.navigation?.routeId);
  const route = findById(routes, routeId);
  const workspaceId = normalizeOptionalId(
    action.workspaceId ??
    page.workspaceId ??
    route?.workspaceId ??
    contentItem?.navigation?.workspaceId
  );
  const workspace = findById(workspaces, workspaceId);

  if (!workspaceId || !workspace) {
    return createResult({
      valid: false,
      code: SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.MISSING_WORKSPACE,
      pageId,
      routeId,
      workspaceId
    });
  }

  return createResult({
    valid: true,
    code: SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.READY,
    pageId,
    routeId,
    workspaceId,
    page,
    route,
    workspace
  });
}

function createResult({
  valid,
  code,
  pageId = null,
  routeId = null,
  workspaceId = null,
  page = null,
  route = null,
  workspace = null
}) {
  return {
    valid,
    code,
    pageId: normalizeOptionalId(pageId),
    routeId: normalizeOptionalId(routeId),
    workspaceId: normalizeOptionalId(workspaceId),
    page,
    route,
    workspace
  };
}

function findById(items, id) {
  const resolvedId = normalizeOptionalId(id);

  if (!resolvedId || !Array.isArray(items)) {
    return null;
  }

  return items.find((item) => normalizeOptionalId(item?.id) === resolvedId) ?? null;
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
