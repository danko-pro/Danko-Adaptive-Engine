import assert from "node:assert/strict";
import {
  NAVIGATION_ISSUE_CODES,
  NAVIGATION_PLACEMENTS,
  NAVIGATION_RELATION_TYPES,
  NAVIGATION_STATES,
  NAVIGATION_STATUS,
  resolveNavigationPlan
} from "../index.js";

const baseInput = {
  metrics: { columns: 80, rows: 30 },
  activePageId: "calculator",
  activeRouteId: "calculator-route",
  activeWorkspaceId: "calculator-workspace",
  pages: [
    {
      id: "calculator",
      title: "Калькулятор",
      routeId: "calculator-route",
      workspaceId: "calculator-workspace"
    }
  ],
  routes: [
    {
      id: "calculator-route",
      path: "/calculator",
      workspaceId: "calculator-workspace"
    }
  ],
  workspaces: [
    {
      id: "calculator-workspace",
      defaultComponentId: "summary"
    }
  ],
  navigation: {
    id: "main-menu",
    state: NAVIGATION_STATES.PINNED,
    placement: NAVIGATION_PLACEMENTS.LEFT,
    items: [
      {
        id: "menu-calculator",
        label: "Калькулятор",
        pageId: "calculator",
        routeId: "calculator-route"
      }
    ]
  },
  shell: {
    reservedArea: {
      left: 8,
      right: 0,
      top: 0,
      bottom: 0
    }
  },
  usableWorkspace: {
    x: 9,
    y: 1,
    columns: 72,
    rows: 30
  }
};

const pinnedPlan = resolveNavigationPlan(baseInput);

assert.equal(pinnedPlan.engine, "navigation-engine");
assert.equal(pinnedPlan.valid, true);
assert.equal(pinnedPlan.status, NAVIGATION_STATUS.READY);
assert.equal(pinnedPlan.reservedArea.left, 8);
assert.equal(pinnedPlan.usableWorkspace.columns, 72);
assert.equal(pinnedPlan.usableWorkspace.x, 9);
assert.equal(pinnedPlan.summary.navigationItems, 1);
assert.equal(
  pinnedPlan.issues.some((issue) => issue.code === NAVIGATION_ISSUE_CODES.HOST_USABLE_WORKSPACE_MISMATCH),
  false
);
assert.equal(
  pinnedPlan.relations.some((relation) => relation.type === NAVIGATION_RELATION_TYPES.SELECTS),
  true
);
assert.equal(
  pinnedPlan.relations.some((relation) => relation.type === NAVIGATION_RELATION_TYPES.MOUNTS),
  true
);
assert.equal(
  pinnedPlan.relations.some((relation) => relation.type === NAVIGATION_RELATION_TYPES.FOCUSES),
  true
);

const overlayPlan = resolveNavigationPlan({
  ...baseInput,
  usableWorkspace: {
    x: 1,
    y: 1,
    columns: 80,
    rows: 30
  },
  navigation: {
    ...baseInput.navigation,
    state: NAVIGATION_STATES.OVERLAY
  }
});

assert.equal(overlayPlan.valid, true);
assert.equal(overlayPlan.reservedArea.left, 0);
assert.equal(overlayPlan.usableWorkspace.columns, 80);
assert.equal(
  overlayPlan.proposals.some((proposal) => proposal.type === "overlay-navigation-does-not-reserve-workspace"),
  true
);

const mismatchPlan = resolveNavigationPlan({
  ...baseInput,
  usableWorkspace: {
    x: 1,
    y: 1,
    columns: 80,
    rows: 30
  }
});

assert.equal(mismatchPlan.valid, true);
assert.equal(mismatchPlan.status, NAVIGATION_STATUS.WARNING);
assert.equal(
  mismatchPlan.issues.some((issue) => issue.code === NAVIGATION_ISSUE_CODES.HOST_USABLE_WORKSPACE_MISMATCH),
  true
);

const invalidPagePlan = resolveNavigationPlan({
  ...baseInput,
  activePageId: "missing-page"
});

assert.equal(invalidPagePlan.valid, false);
assert.equal(invalidPagePlan.status, NAVIGATION_STATUS.ERROR);
assert.equal(
  invalidPagePlan.issues.some((issue) => issue.code === NAVIGATION_ISSUE_CODES.ACTIVE_PAGE_NOT_FOUND),
  true
);

const emptyTargetPlan = resolveNavigationPlan({
  ...baseInput,
  navigation: {
    ...baseInput.navigation,
    items: [{ id: "empty" }]
  }
});

assert.equal(emptyTargetPlan.valid, true);
assert.equal(emptyTargetPlan.status, NAVIGATION_STATUS.WARNING);
assert.equal(
  emptyTargetPlan.issues.some((issue) => issue.code === NAVIGATION_ISSUE_CODES.NAVIGATION_ITEM_WITHOUT_TARGET),
  true
);

console.log("navigation plan tests passed");
