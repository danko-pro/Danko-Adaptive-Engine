import assert from "node:assert/strict";
import { LAYOUT_RELATION_CHILD_KINDS } from "./layoutRelationContracts.js";
import {
  LAYOUT_RELATION_VIEWPORT_MODES,
  resolveLayoutRelationViewportMode
} from "./resolveLayoutRelationViewportMode.js";
import { resolveLayoutRelationManualTarget } from "./resolveLayoutRelationManualTarget.js";

const desktopMetrics = createMetrics(64, 32);
const narrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });
const mobileMetrics = createMetrics(22, 32, { horizontalMode: "min-limit" });

const relationItems = [
  {
    id: "parent-a",
    x: 2,
    y: 2,
    w: 18,
    h: 6,
    meta: {
      layoutRelations: {
        children: [{ id: "child-a", order: 1 }]
      }
    }
  },
  {
    id: "parent-b",
    x: 20,
    y: 2,
    w: 10,
    h: 4,
    meta: {
      layoutRelations: {
        children: [{ id: "child-a", order: 1 }]
      }
    }
  },
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 },
  {
    id: "parent-internal",
    x: 1,
    y: 20,
    w: 8,
    h: 4,
    meta: {
      layoutRelations: {
        children: [
          {
            id: "internal-child",
            kind: LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM
          }
        ]
      }
    }
  },
  { id: "internal-child", x: 20, y: 1, w: 2, h: 2 },
  { id: "solo", x: 1, y: 26, w: 8, h: 4, meta: { dependencies: ["other"] } }
];
const relationItemsBefore = structuredClone(relationItems);

assert.equal(resolveLayoutRelationViewportMode(desktopMetrics), LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT);
assert.equal(resolveLayoutRelationViewportMode(narrowMetrics), LAYOUT_RELATION_VIEWPORT_MODES.NARROW);
assert.equal(
  resolveLayoutRelationViewportMode(createMetrics(40, 32, { mode: "compact-width" })),
  LAYOUT_RELATION_VIEWPORT_MODES.NARROW
);
assert.equal(
  resolveLayoutRelationViewportMode(createMetrics(40, 32, { mode: "compact" })),
  LAYOUT_RELATION_VIEWPORT_MODES.NARROW
);
assert.equal(resolveLayoutRelationViewportMode(mobileMetrics), LAYOUT_RELATION_VIEWPORT_MODES.MOBILE);

assert.deepEqual(
  resolveLayoutRelationManualTarget({
    items: relationItems,
    itemId: "child-a",
    metrics: desktopMetrics
  }),
  {
    shouldUseManualOverride: false,
    parentId: null,
    childId: null,
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT
  }
);

assert.deepEqual(
  resolveLayoutRelationManualTarget({
    items: relationItems,
    itemId: "child-a",
    metrics: narrowMetrics
  }),
  {
    shouldUseManualOverride: true,
    parentId: "parent-a",
    childId: "child-a",
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.NARROW
  }
);

assert.deepEqual(
  resolveLayoutRelationManualTarget({
    items: relationItems,
    itemId: "child-a",
    metrics: mobileMetrics
  }),
  {
    shouldUseManualOverride: true,
    parentId: "parent-a",
    childId: "child-a",
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.MOBILE
  }
);

assert.deepEqual(
  resolveLayoutRelationManualTarget({
    items: relationItems,
    itemId: "solo",
    metrics: narrowMetrics
  }),
  {
    shouldUseManualOverride: false,
    parentId: null,
    childId: null,
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.NARROW
  }
);

assert.deepEqual(
  resolveLayoutRelationManualTarget({
    items: relationItems,
    itemId: "missing-item",
    metrics: narrowMetrics
  }),
  {
    shouldUseManualOverride: false,
    parentId: null,
    childId: null,
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.NARROW
  }
);

assert.deepEqual(
  resolveLayoutRelationManualTarget({
    items: relationItems,
    itemId: "  ",
    metrics: narrowMetrics
  }),
  {
    shouldUseManualOverride: false,
    parentId: null,
    childId: null,
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.NARROW
  }
);

assert.deepEqual(
  resolveLayoutRelationManualTarget({
    items: relationItems,
    itemId: "internal-child",
    metrics: mobileMetrics
  }),
  {
    shouldUseManualOverride: false,
    parentId: null,
    childId: null,
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.MOBILE
  }
);

assert.deepEqual(relationItems, relationItemsBefore);

console.log("layout relation manual target tests passed");

function createMetrics(columns, rows, debug = {}) {
  return {
    columns,
    rows,
    cellSize: 20,
    gridWidth: columns * 20,
    gridHeight: rows * 20,
    debug
  };
}
