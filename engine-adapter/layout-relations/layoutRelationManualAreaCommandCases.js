import assert from "node:assert/strict";
import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import { LAYOUT_RELATION_CHILD_KINDS } from "./layoutRelationContracts.js";
import { applyLayoutRelationManualAreaCommand } from "./applyLayoutRelationManualAreaCommand.js";
import { applyLayoutRelationProjectionCommand } from "./applyLayoutRelationProjectionCommand.js";

const desktopMetrics = createMetrics(64, 32);
const narrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });
const mobileMetrics = createMetrics(22, 32, { horizontalMode: "min-limit" });

const baseItems = [
  {
    id: "parent",
    x: 2,
    y: 2,
    w: 18,
    h: 6,
    meta: {
      dependencies: ["legacy-target"],
      layoutRelations: {
        children: [{ id: "child-a", order: 1 }]
      }
    }
  },
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 }
];
const internalRelationItems = [
  {
    id: "parent-internal",
    x: 10,
    y: 10,
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
  }
];
const baseItemsBefore = structuredClone(baseItems);

const narrowPatch = applyLayoutRelationManualAreaCommand({
  items: baseItems,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "narrow",
  area: { x: 5, y: 9, w: 10, h: 2 }
});

assert.equal(narrowPatch.status, ADAPTER_STATUS.OK);
assert.equal(narrowPatch.data.changed, true);
assert.notEqual(narrowPatch.data.items, baseItems);
assert.deepEqual(
  narrowPatch.data.items.find((item) => item.id === "parent").meta.layoutRelations.children[0]
    .manualAreas.narrow,
  { x: 5, y: 9, w: 10, h: 2 }
);
assert.equal(
  narrowPatch.data.items.find((item) => item.id === "parent").meta.layoutRelations.children[0]
    .manualAreas.mobile,
  null
);
assert.deepEqual(pickGeometry(narrowPatch.data.items.find((item) => item.id === "parent")), {
  x: 2,
  y: 2,
  w: 18,
  h: 6
});
assert.deepEqual(pickGeometry(narrowPatch.data.items.find((item) => item.id === "child-a")), {
  x: 30,
  y: 12,
  w: 18,
  h: 4
});
assert.deepEqual(
  narrowPatch.data.items.find((item) => item.id === "parent").meta.dependencies,
  ["legacy-target"]
);

const mobilePatch = applyLayoutRelationManualAreaCommand({
  items: narrowPatch.data.items,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "mobile",
  area: { x: 3, y: 8, w: 8, h: 2 }
});

assert.equal(mobilePatch.status, ADAPTER_STATUS.OK);
assert.deepEqual(
  mobilePatch.data.items.find((item) => item.id === "parent").meta.layoutRelations.children[0]
    .manualAreas.mobile,
  { x: 3, y: 8, w: 8, h: 2 }
);

const narrowProjection = applyLayoutRelationProjectionCommand({
  items: mobilePatch.data.items,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(narrowProjection.ok, true);
assert.deepEqual(pickGeometry(findItem(narrowProjection.data.items, "child-a")), {
  x: 5,
  y: 9,
  w: 10,
  h: 2
});

const mobileProjection = applyLayoutRelationProjectionCommand({
  items: mobilePatch.data.items,
  metrics: mobileMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(mobileProjection.ok, true);
assert.deepEqual(pickGeometry(findItem(mobileProjection.data.items, "child-a")), {
  x: 3,
  y: 8,
  w: 8,
  h: 2
});

const desktopProjection = applyLayoutRelationProjectionCommand({
  items: mobilePatch.data.items,
  metrics: desktopMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(desktopProjection.ok, true);
assert.equal(desktopProjection.data.changed, false);
assert.deepEqual(
  pickGeometry(findItem(desktopProjection.data.items, "child-a")),
  pickGeometry(findItem(baseItems, "child-a"))
);

assert.equal(
  applyLayoutRelationManualAreaCommand({
    items: baseItems,
    parentId: "parent",
    childId: "child-a",
    viewportMode: "default",
    area: { x: 1, y: 1, w: 1, h: 1 }
  }).status,
  ADAPTER_STATUS.ERROR
);

assert.equal(
  applyLayoutRelationManualAreaCommand({
    items: baseItems,
    parentId: "parent",
    childId: "child-a",
    viewportMode: "narrow",
    area: { x: 0, y: 1, w: 1, h: 1 }
  }).status,
  ADAPTER_STATUS.ERROR
);

assert.equal(
  applyLayoutRelationManualAreaCommand({
    items: baseItems,
    parentId: "missing-parent",
    childId: "child-a",
    viewportMode: "narrow",
    area: { x: 1, y: 1, w: 1, h: 1 }
  }).status,
  ADAPTER_STATUS.ERROR
);

assert.equal(
  applyLayoutRelationManualAreaCommand({
    items: baseItems,
    parentId: "parent",
    childId: "missing-child",
    viewportMode: "narrow",
    area: { x: 1, y: 1, w: 1, h: 1 }
  }).status,
  ADAPTER_STATUS.ERROR
);

const missingChildItem = applyLayoutRelationManualAreaCommand({
  items: [
    {
      id: "parent",
      x: 1,
      y: 1,
      w: 4,
      h: 4,
      meta: {
        layoutRelations: {
          children: [{ id: "ghost-child" }]
        }
      }
    }
  ],
  parentId: "parent",
  childId: "ghost-child",
  viewportMode: "narrow",
  area: { x: 1, y: 1, w: 1, h: 1 }
});

assert.equal(missingChildItem.status, ADAPTER_STATUS.ERROR);
assert.equal(missingChildItem.data.changed, false);

const internalPatch = applyLayoutRelationManualAreaCommand({
  items: internalRelationItems,
  parentId: "parent-internal",
  childId: "internal-child",
  viewportMode: "mobile",
  area: { x: 1, y: 1, w: 1, h: 1 }
});

assert.equal(internalPatch.status, ADAPTER_STATUS.ERROR);
assert.equal(internalPatch.data.items, internalRelationItems);
assert.equal(internalPatch.data.changed, false);
assert.deepEqual(baseItems, baseItemsBefore);

console.log("layout relation manual area command tests passed");

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
