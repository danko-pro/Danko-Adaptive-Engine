import assert from "node:assert/strict";
import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import {
  LAYOUT_RELATION_CHILD_ROLES,
  LAYOUT_RELATION_PROJECTION_STRATEGIES
} from "./layoutRelationContracts.js";
import { applyLayoutRelationClearManualAreaCommand } from "./applyLayoutRelationClearManualAreaCommand.js";
import { applyLayoutRelationManualAreaCommand } from "./applyLayoutRelationManualAreaCommand.js";
import { applyLayoutRelationProjectionCommand } from "./applyLayoutRelationProjectionCommand.js";

const desktopMetrics = createMetrics(64, 32);
const narrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });
const mobileMetrics = createMetrics(22, 32, { horizontalMode: "min-limit" });

const dualManualItems = [
  {
    id: "parent",
    x: 2,
    y: 2,
    w: 18,
    h: 6,
    meta: {
      layoutRelations: {
        strategy: LAYOUT_RELATION_PROJECTION_STRATEGIES.STACK,
        children: [
          {
            id: "child-a",
            role: LAYOUT_RELATION_CHILD_ROLES.CONTENT,
            order: 1,
            priority: 12,
            manualAreas: {
              narrow: { x: 5, y: 9, w: 10, h: 2 },
              mobile: { x: 3, y: 8, w: 8, h: 2 }
            }
          }
        ]
      }
    }
  },
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 }
];
const dualManualItemsBefore = structuredClone(dualManualItems);

const clearNarrow = applyLayoutRelationClearManualAreaCommand({
  items: dualManualItems,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "narrow"
});

assert.equal(clearNarrow.status, ADAPTER_STATUS.OK);
assert.equal(clearNarrow.data.changed, true);
assert.notEqual(clearNarrow.data.items, dualManualItems);
const clearedRelationChild = clearNarrow.data.items.find((item) => item.id === "parent").meta
  .layoutRelations.children[0];

assert.equal(clearedRelationChild.manualAreas.narrow, null);
assert.deepEqual(clearedRelationChild.manualAreas.mobile, { x: 3, y: 8, w: 8, h: 2 });
assert.equal(clearedRelationChild.role, LAYOUT_RELATION_CHILD_ROLES.CONTENT);
assert.equal(clearedRelationChild.order, 1);
assert.equal(clearedRelationChild.priority, 12);
assert.equal(
  clearNarrow.data.items.find((item) => item.id === "parent").meta.layoutRelations.strategy,
  LAYOUT_RELATION_PROJECTION_STRATEGIES.STACK
);

const clearMobile = applyLayoutRelationClearManualAreaCommand({
  items: dualManualItems,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "mobile"
});

assert.equal(clearMobile.status, ADAPTER_STATUS.OK);
const mobileClearedChild = clearMobile.data.items.find((item) => item.id === "parent").meta
  .layoutRelations.children[0];

assert.equal(mobileClearedChild.manualAreas.mobile, null);
assert.deepEqual(mobileClearedChild.manualAreas.narrow, { x: 5, y: 9, w: 10, h: 2 });

assert.equal(
  applyLayoutRelationClearManualAreaCommand({
    items: dualManualItems,
    parentId: "parent",
    childId: "child-a",
    viewportMode: "default"
  }).status,
  ADAPTER_STATUS.ERROR
);

assert.equal(
  applyLayoutRelationClearManualAreaCommand({
    items: dualManualItems,
    parentId: "missing-parent",
    childId: "child-a",
    viewportMode: "narrow"
  }).status,
  ADAPTER_STATUS.ERROR
);

assert.equal(
  applyLayoutRelationClearManualAreaCommand({
    items: dualManualItems,
    parentId: "parent",
    childId: "missing-child",
    viewportMode: "narrow"
  }).status,
  ADAPTER_STATUS.ERROR
);

assert.deepEqual(dualManualItems, dualManualItemsBefore);

const stackItems = [
  {
    id: "parent",
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
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 }
];

const manualPatch = applyLayoutRelationManualAreaCommand({
  items: stackItems,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "narrow",
  area: { x: 5, y: 9, w: 10, h: 2 }
});

const manualProjection = applyLayoutRelationProjectionCommand({
  items: manualPatch.data.items,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(findItem(manualProjection.data.items, "child-a")), {
  x: 5,
  y: 9,
  w: 10,
  h: 2
});

const clearForStack = applyLayoutRelationClearManualAreaCommand({
  items: manualPatch.data.items,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "narrow"
});

const autoProjection = applyLayoutRelationProjectionCommand({
  items: clearForStack.data.items,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(findItem(autoProjection.data.items, "child-a")), {
  x: 2,
  y: 9,
  w: 18,
  h: 4
});

console.log("layout relation clear manual area command tests passed");

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

function pickGeometry(item) {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}

function findItem(items, id) {
  return items.find((item) => item.id === id);
}
