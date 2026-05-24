import assert from "node:assert/strict";
import {
  ADAPTER_STATUS,
  LAYOUT_RELATION_CHILD_ROLES,
  LAYOUT_RELATION_PROJECTION_STRATEGIES
} from "../../../engine-adapter/index.js";
import { hasLayoutRelationItems } from "./hasLayoutRelations.js";
import { resolveOperationRelationProjection } from "./resolveOperationRelationProjection.js";

const desktopMetrics = createMetrics(64, 32);
const narrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });

const relationItems = [
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
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 },
  { id: "solo", x: 1, y: 26, w: 8, h: 4 }
];
const relationItemsBefore = structuredClone(relationItems);

assert.equal(hasLayoutRelationItems(relationItems), true);
assert.equal(hasLayoutRelationItems([{ id: "solo", meta: { dependencies: ["other"] } }]), false);

const desktopBridge = resolveOperationRelationProjection({
  items: relationItems,
  metrics: desktopMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(desktopBridge.shouldProject, false);
assert.equal(desktopBridge.items, relationItems);
assert.equal(desktopBridge.command.status, ADAPTER_STATUS.OK);
assert.equal(desktopBridge.command.data.changed, false);

const narrowBridge = resolveOperationRelationProjection({
  items: relationItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(narrowBridge.shouldProject, true);
assert.notEqual(narrowBridge.items, relationItems);
assert.deepEqual(pickGeometry(findItem(narrowBridge.items, "child-a")), {
  x: 2,
  y: 9,
  w: 18,
  h: 4
});

const narrowParentProjection = findItem(narrowBridge.items, "parent").meta.layoutRelationProjection;

assert.equal(narrowParentProjection.viewportMode, "narrow");
assert.equal(narrowParentProjection.strategy, LAYOUT_RELATION_PROJECTION_STRATEGIES.STACK);
assert.deepEqual(
  narrowParentProjection.orderedChildren.map((child) => child.id),
  ["child-a"]
);
assert.equal(narrowParentProjection.orderedChildren[0].order, 1);

const roleFirstBridgeItems = [
  {
    id: "parent",
    x: 2,
    y: 2,
    w: 18,
    h: 6,
    meta: {
      layoutRelations: {
        children: [
          { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE, order: 1 },
          { id: "action-item", role: LAYOUT_RELATION_CHILD_ROLES.ACTION, order: 2 },
          { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 3 }
        ]
      }
    }
  },
  { id: "aside-item", x: 10, y: 12, w: 8, h: 3 },
  { id: "action-item", x: 12, y: 16, w: 10, h: 3 },
  { id: "content-item", x: 14, y: 20, w: 12, h: 4 }
];

const roleFirstBridge = resolveOperationRelationProjection({
  items: roleFirstBridgeItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});
const roleFirstParent = findItem(roleFirstBridge.items, "parent").meta.layoutRelationProjection;
const roleFirstById = Object.fromEntries(
  roleFirstBridge.items
    .filter((item) => item.id.endsWith("-item"))
    .map((item) => [item.id, item])
);

assert.equal(roleFirstParent.strategy, LAYOUT_RELATION_PROJECTION_STRATEGIES.STACK);
assert.deepEqual(
  roleFirstParent.orderedChildren.map((child) => child.id),
  ["content-item", "action-item", "aside-item"]
);
assert.ok(roleFirstById["content-item"].y < roleFirstById["action-item"].y);
assert.ok(roleFirstById["action-item"].y < roleFirstById["aside-item"].y);

const noRelationsBridge = resolveOperationRelationProjection({
  items: [{ id: "solo", x: 1, y: 1, w: 4, h: 4 }],
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(noRelationsBridge.shouldProject, false);
assert.equal(noRelationsBridge.command, null);

assert.deepEqual(relationItems, relationItemsBefore);

console.log("operation relation projection bridge tests passed");

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
