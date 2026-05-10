import {
  NAVIGATION_PLACEMENTS,
  NAVIGATION_STATES,
  resolveNavigationPlan
} from "../../navigation-engine/index.js";
import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import { createAdapterResult } from "../contracts/createAdapterResult.js";

export function createNavigationHostState({
  metrics,
  activePageId,
  pages = [],
  routes = [],
  workspaces = [],
  navigation = {},
  shell = {},
  usableWorkspace = null
} = {}) {
  const resolvedPageId = resolveActivePageId({ activePageId, pages });
  const activePage = pages.find((page) => page.id === resolvedPageId) ?? null;
  const activeRouteId = activePage?.routeId ?? navigation.activeRouteId ?? null;
  const activeRoute = routes.find((route) => route.id === activeRouteId) ?? null;
  const activeWorkspaceId = activePage?.workspaceId ?? activeRoute?.workspaceId ?? null;
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;
  const navigationInput = {
    metrics,
    activePageId: resolvedPageId,
    activeRouteId,
    activeWorkspaceId,
    pages,
    routes,
    workspaces,
    navigation: {
      id: navigation.id ?? "main-navigation",
      state: navigation.state ?? NAVIGATION_STATES.HIDDEN,
      placement: navigation.placement ?? NAVIGATION_PLACEMENTS.BOTTOM,
      scope: navigation.scope ?? "global",
      items: navigation.items ?? createNavigationItemsFromPages(pages)
    },
    shell,
    usableWorkspace
  };
  const plan = resolveNavigationPlan(navigationInput);

  return createAdapterResult({
    status: plan.valid ? ADAPTER_STATUS.OK : ADAPTER_STATUS.ERROR,
    message: plan.valid
      ? `V3 готов: активная страница ${resolvedPageId ?? "не выбрана"}`
      : "V3 нашел ошибку в навигационном состоянии.",
    data: {
      activePage,
      activeRoute,
      activeWorkspace,
      activePageId: resolvedPageId,
      activeRouteId,
      activeWorkspaceId,
      plan
    },
    engineResult: plan
  });
}

function resolveActivePageId({ activePageId, pages }) {
  if (activePageId && pages.some((page) => page.id === activePageId)) {
    return activePageId;
  }

  return pages[0]?.id ?? null;
}

function createNavigationItemsFromPages(pages) {
  return pages.map((page) => ({
    id: `nav-${page.id}`,
    label: page.title ?? page.id,
    pageId: page.id,
    routeId: page.routeId,
    workspaceId: page.workspaceId
  }));
}
