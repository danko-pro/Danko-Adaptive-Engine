import { NAVIGATION_ISSUE_SEVERITY } from "./contracts/navigationIssueSeverity.js";
import { NAVIGATION_STATUS } from "./contracts/navigationStatus.js";
import { createNavigationContext } from "./createNavigationContext.js";
import { resolveNavigationProjection } from "./resolveNavigationProjection.js";
import { resolveReservedWorkspaceArea } from "./resolveReservedWorkspaceArea.js";

export function resolveNavigationPlan(input = {}) {
  const context = createNavigationContext(input);

  if (!context.enabled) {
    return createPlan({
      context,
      status: NAVIGATION_STATUS.DISABLED,
      valid: true,
      reserved: null,
      projection: null,
      issues: [],
      relations: [],
      proposals: []
    });
  }

  const reserved = resolveReservedWorkspaceArea(context);
  const projection = resolveNavigationProjection(context);
  const relations = [
    ...projection.relations,
    ...createShellRelations({ context, reserved })
  ];
  const issues = [
    ...reserved.issues,
    ...projection.issues
  ];
  const proposals = [
    ...reserved.proposals,
    ...projection.proposals
  ];
  const valid = !issues.some((issue) => issue.severity === NAVIGATION_ISSUE_SEVERITY.ERROR);
  const status = valid
    ? issues.length > 0 ? NAVIGATION_STATUS.WARNING : NAVIGATION_STATUS.READY
    : NAVIGATION_STATUS.ERROR;

  return createPlan({
    context,
    status,
    valid,
    reserved,
    projection,
    issues,
    relations,
    proposals
  });
}

function createShellRelations({ context, reserved }) {
  return [{
    type: "constrains",
    sourceId: context.navigation.id,
    targetId: context.activeWorkspaceId,
    reservedArea: reserved.reservedArea,
    usableWorkspace: reserved.usableWorkspace
  }];
}

function createPlan({ context, status, valid, reserved, projection, issues, relations, proposals }) {
  return {
    engine: "navigation-engine",
    version: "0.1.0",
    enabled: context.enabled,
    valid,
    status,
    summary: {
      pages: context.pages.length,
      routes: context.routes.length,
      workspaces: context.workspaces.length,
      navigationItems: context.navigation.items.length,
      relations: relations.length,
      issues: issues.length,
      proposals: proposals.length
    },
    active: {
      pageId: context.activePageId,
      routeId: context.activeRouteId,
      workspaceId: context.activeWorkspaceId
    },
    navigation: context.navigation,
    reservedArea: reserved?.reservedArea ?? null,
    usableWorkspace: reserved?.usableWorkspace ?? null,
    projection,
    relations,
    issues,
    proposals
  };
}
