import assert from "node:assert/strict";
import {
  LAYOUT_RELATION_CHILD_KINDS,
  LAYOUT_RELATION_VIEWPORT_MODES
} from "../../../engine-adapter/index.js";
import { resolveRelationResetActionState } from "./resolveRelationResetActionState.js";

const desktopMetrics = createMetrics(64, 32);
const narrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });
const mobileMetrics = createMetrics(22, 32, { horizontalMode: "min-limit" });

const relationItems = [
  {
    id: "parent",
    x: 2,
    y: 2,
    w: 18,
    h: 6,
    meta: {
      layoutRelations: {
        children: [
          {
            id: "child-a",
            order: 1,
            manualAreas: {
              narrow: { x: 5, y: 9, w: 10, h: 2 },
              mobile: { x: 3, y: 8, w: 8, h: 2 }
            }
          }
        ]
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
            kind: LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM,
            manualAreas: {
              narrow: { x: 1, y: 1, w: 2, h: 2 }
            }
          }
        ]
      }
    }
  },
  { id: "internal-child", x: 20, y: 1, w: 2, h: 2 }
];

const narrowReset = resolveRelationResetActionState({
  items: relationItems,
  itemId: "child-a",
  metrics: narrowMetrics
});

assert.equal(narrowReset.visible, true);
assert.equal(narrowReset.enabled, true);
assert.equal(narrowReset.parentId, "parent");
assert.equal(narrowReset.childId, "child-a");
assert.equal(narrowReset.viewportMode, LAYOUT_RELATION_VIEWPORT_MODES.NARROW);
assert.equal(narrowReset.label, "Вернуть авто-позицию");
assert.equal(narrowReset.title, "Сбросить позицию для narrow");

const mobileReset = resolveRelationResetActionState({
  items: relationItems,
  itemId: "child-a",
  metrics: mobileMetrics
});

assert.equal(mobileReset.visible, true);
assert.equal(mobileReset.viewportMode, LAYOUT_RELATION_VIEWPORT_MODES.MOBILE);
assert.equal(mobileReset.title, "Сбросить позицию для mobile");

const desktopReset = resolveRelationResetActionState({
  items: relationItems,
  itemId: "child-a",
  metrics: desktopMetrics
});

assert.equal(desktopReset.visible, false);
assert.equal(desktopReset.enabled, false);

const childWithoutManual = resolveRelationResetActionState({
  items: [
    {
      id: "parent",
      meta: {
        layoutRelations: {
          children: [{ id: "child-plain", order: 1 }]
        }
      }
    },
    { id: "child-plain", x: 1, y: 1, w: 4, h: 4 }
  ],
  itemId: "child-plain",
  metrics: narrowMetrics
});

assert.equal(childWithoutManual.visible, false);

const parentReset = resolveRelationResetActionState({
  items: relationItems,
  itemId: "parent",
  metrics: narrowMetrics
});

assert.equal(parentReset.visible, false);

const missingRelationReset = resolveRelationResetActionState({
  items: relationItems,
  itemId: "solo",
  metrics: narrowMetrics
});

assert.equal(missingRelationReset.visible, false);

const internalReset = resolveRelationResetActionState({
  items: relationItems,
  itemId: "internal-child",
  metrics: narrowMetrics
});

assert.equal(internalReset.visible, false);

console.log("relation reset action state tests passed");

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
