import { initialOperationProbeItems } from "../operations/operationProbeData.js";

export const navigationProbePages = [
  {
    id: "layout-page",
    title: "Раскладка",
    routeId: "layout-route",
    workspaceId: "layout-workspace"
  },
  {
    id: "content-page",
    title: "Контент",
    routeId: "content-route",
    workspaceId: "content-workspace"
  },
  {
    id: "checks-page",
    title: "Проверки",
    routeId: "checks-route",
    workspaceId: "checks-workspace"
  }
];

export const navigationProbeRoutes = [
  {
    id: "layout-route",
    path: "/layout",
    workspaceId: "layout-workspace"
  },
  {
    id: "content-route",
    path: "/content",
    workspaceId: "content-workspace"
  },
  {
    id: "checks-route",
    path: "/checks",
    workspaceId: "checks-workspace"
  }
];

export const navigationProbeWorkspaces = [
  {
    id: "layout-workspace",
    defaultComponentId: "probe-a"
  },
  {
    id: "content-workspace",
    defaultComponentId: "content-a"
  },
  {
    id: "checks-workspace",
    defaultComponentId: "warning-a"
  }
];

export const initialNavigationProbeItemsByWorkspace = {
  "layout-workspace": initialOperationProbeItems,
  "content-workspace": [
    { id: "content-a", x: 4, y: 4, w: 10, h: 6, meta: { value: "Контент", blockType: "content" } },
    { id: "sidebar-a", x: 18, y: 4, w: 5, h: 8, meta: { value: "Сайдбар", blockType: "sidebar" } }
  ],
  "checks-workspace": [
    { id: "warning-a", x: 5, y: 5, w: 8, h: 5, meta: { value: "Опасность", blockType: "warning" } },
    { id: "control-a", x: 16, y: 5, w: 6, h: 5, meta: { value: "Контроль", blockType: "control" } }
  ]
};

export const navigationProbeConfig = {
  id: "bottom-page-tabs",
  state: "hidden",
  placement: "bottom",
  scope: "global"
};

export function getInitialNavigationProbePageId() {
  return navigationProbePages[0].id;
}

export function getWorkspaceIdByPageId(pageId) {
  return navigationProbePages.find((page) => page.id === pageId)?.workspaceId
    ?? navigationProbePages[0].workspaceId;
}
