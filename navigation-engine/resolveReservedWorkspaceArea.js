import { NAVIGATION_PLACEMENTS } from "./contracts/navigationPlacements.js";
import { NAVIGATION_STATES } from "./contracts/navigationStates.js";
import { NAVIGATION_ISSUE_CODES } from "./contracts/navigationIssueCodes.js";
import { NAVIGATION_ISSUE_SEVERITY } from "./contracts/navigationIssueSeverity.js";
import { createNavigationIssue } from "./createNavigationIssue.js";

export function resolveReservedWorkspaceArea(context) {
  const reservedArea = shouldReserveArea(context.navigation.state)
    ? context.shell.reservedArea
    : createEmptyReservedArea();
  const usableWorkspace = createUsableWorkspace(context.metrics, reservedArea);
  const issues = [];

  if (usableWorkspace.columns < 1 || usableWorkspace.rows < 1) {
    issues.push(createNavigationIssue({
      code: NAVIGATION_ISSUE_CODES.RESERVED_AREA_OUT_OF_WORKSPACE,
      message: "Зарезервированная область больше доступного workspace.",
      severity: NAVIGATION_ISSUE_SEVERITY.ERROR,
      details: { reservedArea, metrics: context.metrics }
    }));
  }

  const hostUsableWorkspaceIssue = createHostUsableWorkspaceIssue({
    hostUsableWorkspace: context.usableWorkspace,
    resolvedUsableWorkspace: usableWorkspace
  });

  if (hostUsableWorkspaceIssue) {
    issues.push(hostUsableWorkspaceIssue);
  }

  return {
    navigationState: context.navigation.state,
    navigationPlacement: context.navigation.placement,
    reservedArea,
    usableWorkspace,
    issues,
    proposals: createReservedAreaProposals(context, reservedArea)
  };
}

function shouldReserveArea(state) {
  return state === NAVIGATION_STATES.PINNED || state === NAVIGATION_STATES.COLLAPSED;
}

function createEmptyReservedArea() {
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
}

function createUsableWorkspace(metrics, reservedArea) {
  const columns = Math.max(0, metrics.columns - reservedArea.left - reservedArea.right);
  const rows = Math.max(0, metrics.rows - reservedArea.top - reservedArea.bottom);

  return {
    x: reservedArea.left + 1,
    y: reservedArea.top + 1,
    columns,
    rows
  };
}

function createHostUsableWorkspaceIssue({ hostUsableWorkspace, resolvedUsableWorkspace }) {
  if (!hostUsableWorkspace) {
    return null;
  }

  const fields = ["x", "y", "columns", "rows"];
  const mismatchFields = fields.filter((field) => (
    hostUsableWorkspace[field] !== resolvedUsableWorkspace[field]
  ));

  if (mismatchFields.length === 0) {
    return null;
  }

  return createNavigationIssue({
    code: NAVIGATION_ISSUE_CODES.HOST_USABLE_WORKSPACE_MISMATCH,
    message: "Host передал usableWorkspace, который не совпадает с расчетом navigation-engine.",
    severity: NAVIGATION_ISSUE_SEVERITY.WARNING,
    details: {
      mismatchFields,
      hostUsableWorkspace,
      resolvedUsableWorkspace
    }
  });
}

function createReservedAreaProposals(context, reservedArea) {
  const proposals = [];

  if (context.navigation.state === NAVIGATION_STATES.OVERLAY) {
    proposals.push({
      type: "overlay-navigation-does-not-reserve-workspace",
      message: "Overlay-меню не должно уменьшать рабочую область, оно живет поверх нее."
    });
  }

  if (
    context.navigation.state === NAVIGATION_STATES.PINNED &&
    context.navigation.placement === NAVIGATION_PLACEMENTS.LEFT &&
    reservedArea.left === 0
  ) {
    proposals.push({
      type: "missing-left-navigation-reserve",
      message: "Закрепленное левое меню должно явно сообщить ширину зарезервированной области."
    });
  }

  return proposals;
}
