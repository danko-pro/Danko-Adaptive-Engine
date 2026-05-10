import { NAVIGATION_ISSUE_CODES } from "./contracts/navigationIssueCodes.js";
import { NAVIGATION_ISSUE_SEVERITY } from "./contracts/navigationIssueSeverity.js";
import { NAVIGATION_RELATION_TYPES } from "./contracts/navigationRelationTypes.js";
import { createNavigationIssue } from "./createNavigationIssue.js";

export function resolveNavigationProjection(context) {
  const pageById = new Map(context.pages.map((page) => [page.id, page]));
  const routeById = new Map(context.routes.map((route) => [route.id, route]));
  const workspaceById = new Map(context.workspaces.map((workspace) => [workspace.id, workspace]));
  const issues = [];
  const relations = [];
  const projections = [];

  for (const item of context.navigation.items) {
    const projection = resolveNavigationItemProjection({
      item,
      pageById,
      routeById,
      workspaceById,
      issues,
      relations
    });

    projections.push(projection);
  }

  const activePage = context.activePageId ? pageById.get(context.activePageId) : null;
  const activeRoute = context.activeRouteId ? routeById.get(context.activeRouteId) : null;
  const activeWorkspace = context.activeWorkspaceId ? workspaceById.get(context.activeWorkspaceId) : null;

  if (context.activePageId && !activePage) {
    issues.push(createNavigationIssue({
      code: NAVIGATION_ISSUE_CODES.ACTIVE_PAGE_NOT_FOUND,
      message: "Активная страница не найдена в реестре страниц.",
      severity: NAVIGATION_ISSUE_SEVERITY.ERROR,
      targetId: context.activePageId
    }));
  }

  if (context.activeWorkspaceId && !activeWorkspace) {
    issues.push(createNavigationIssue({
      code: NAVIGATION_ISSUE_CODES.ACTIVE_WORKSPACE_NOT_FOUND,
      message: "Активный workspace не найден в реестре рабочих областей.",
      severity: NAVIGATION_ISSUE_SEVERITY.ERROR,
      targetId: context.activeWorkspaceId
    }));
  }

  if (activePage?.routeId) {
    relations.push({
      type: NAVIGATION_RELATION_TYPES.SELECTS,
      sourceId: context.navigation.id,
      targetId: activePage.id,
      routeId: activePage.routeId
    });
  }

  if (activeRoute?.workspaceId) {
    relations.push({
      type: NAVIGATION_RELATION_TYPES.MOUNTS,
      sourceId: activeRoute.id,
      targetId: activeRoute.workspaceId
    });
  }

  if (activeWorkspace?.defaultComponentId) {
    relations.push({
      type: NAVIGATION_RELATION_TYPES.FOCUSES,
      sourceId: activeWorkspace.id,
      targetId: activeWorkspace.defaultComponentId
    });
  }

  return {
    activePage,
    activeRoute,
    activeWorkspace,
    projections,
    relations,
    issues,
    proposals: createProjectionProposals({ projections, activePage, activeRoute, activeWorkspace })
  };
}

function resolveNavigationItemProjection({ item, pageById, routeById, workspaceById, issues, relations }) {
  const pageId = item.pageId ?? item.targetPageId ?? null;
  const routeId = item.routeId ?? item.targetRouteId ?? null;
  const workspaceId = item.workspaceId ?? item.targetWorkspaceId ?? null;
  const page = pageId ? pageById.get(String(pageId)) : null;
  const route = routeId ? routeById.get(String(routeId)) : null;
  const workspace = workspaceId ? workspaceById.get(String(workspaceId)) : null;

  if (!page && !route && !workspace) {
    issues.push(createNavigationIssue({
      code: NAVIGATION_ISSUE_CODES.NAVIGATION_ITEM_WITHOUT_TARGET,
      message: "Пункт навигации должен ссылаться на страницу, маршрут или workspace.",
      targetId: item.id
    }));
  }

  if (route && !route.workspaceId) {
    issues.push(createNavigationIssue({
      code: NAVIGATION_ISSUE_CODES.ROUTE_WITHOUT_WORKSPACE,
      message: "Маршрут должен знать, какой workspace он монтирует.",
      targetId: route.id
    }));
  }

  if (page) {
    relations.push({
      type: NAVIGATION_RELATION_TYPES.SELECTS,
      sourceId: item.id,
      targetId: page.id
    });
  }

  if (route) {
    relations.push({
      type: NAVIGATION_RELATION_TYPES.MOUNTS,
      sourceId: route.id,
      targetId: route.workspaceId ?? null
    });
  }

  if (workspace) {
    relations.push({
      type: NAVIGATION_RELATION_TYPES.PROJECTS,
      sourceId: item.id,
      targetId: workspace.id
    });
  }

  return {
    itemId: item.id,
    label: item.label ?? item.title ?? item.id,
    pageId: page?.id ?? null,
    routeId: route?.id ?? page?.routeId ?? null,
    workspaceId: workspace?.id ?? route?.workspaceId ?? page?.workspaceId ?? null
  };
}

function createProjectionProposals({ projections, activePage, activeRoute, activeWorkspace }) {
  const proposals = [];

  if (!activePage && projections.length > 0) {
    proposals.push({
      type: "select-active-page",
      message: "Нужно явно указать активную страницу, чтобы V3 мог связать меню и workspace."
    });
  }

  if (!activeRoute && activePage?.routeId) {
    proposals.push({
      type: "resolve-active-route",
      message: "Активная страница должна приводить к понятному route."
    });
  }

  if (!activeWorkspace && activeRoute?.workspaceId) {
    proposals.push({
      type: "resolve-active-workspace",
      message: "Активный route должен монтировать понятный workspace."
    });
  }

  return proposals;
}
