import assert from "node:assert/strict";
import { SELECTION_TYPES } from "../../adaptive-engine/core/index.js";
import { SIDEBAR_DOCKS, SIDEBAR_STATES } from "../../sidebar-element/index.js";
import { createAreaFromCellCommand } from "../commands/createAreaFromCellCommand.js";
import { evaluateCompositionPlanCommand } from "../composition/evaluateCompositionPlanCommand.js";
import { resolveAdapterSelection } from "../selection/resolveAdapterSelection.js";
import { resolveSelectionAfterOperation } from "../selection/resolveSelectionAfterOperation.js";

const mobileMetrics = createMetrics(12, 16, {
  mode: "minimum",
  horizontalMode: "min-limit"
});
const fixedLeftSidebar = {
  id: "fixed-left-mobile",
  x: 1,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      dock: SIDEBAR_DOCKS.LEFT,
      state: SIDEBAR_STATES.FIXED
    }
  }
};

const ghostZoneSelection = resolveAdapterSelection({
  cell: { x: 3, y: 4 },
  items: [fixedLeftSidebar],
  metrics: mobileMetrics
});

assert.equal(ghostZoneSelection.type, SELECTION_TYPES.CELL);
assert.equal(ghostZoneSelection.itemId, null);

const topBarSelection = resolveAdapterSelection({
  cell: { x: 3, y: 1 },
  items: [fixedLeftSidebar],
  metrics: mobileMetrics
});

assert.equal(topBarSelection.type, SELECTION_TYPES.AREA);
assert.equal(topBarSelection.itemId, "fixed-left-mobile");

const createInFormerStrip = createAreaFromCellCommand({
  cell: { x: 3, y: 6 },
  size: { w: 2, h: 2 },
  value: "content-a",
  blockType: "content",
  items: [fixedLeftSidebar],
  metrics: mobileMetrics
});

assert.equal(createInFormerStrip.valid, true);
assert.equal(createInFormerStrip.items.length, 2);

const compositionAfterCreate = evaluateCompositionPlanCommand({
  items: createInFormerStrip.items,
  metrics: mobileMetrics,
  sourceMetrics: mobileMetrics,
  contentSchemas: {
    "fixed-left-mobile": { type: "sidebar" },
    "content-a": { type: "content", value: "content-a" }
  },
  dependencies: {},
  policy: {
    spacing: {
      minGap: 1,
      preferredGap: 1
    }
  }
});

assert.equal(compositionAfterCreate.valid, true, "V2 must not treat desktop sidebar strip as occupied on mobile");

const createdContent = createInFormerStrip.items.find((item) => item.id !== "fixed-left-mobile");
const selectionAfterCreate = resolveSelectionAfterOperation(
  {
    type: "create-area",
    targetId: createdContent.id
  },
  createInFormerStrip.items,
  mobileMetrics
);

assert.equal(selectionAfterCreate.type, SELECTION_TYPES.AREA);
assert.equal(selectionAfterCreate.itemId, createdContent.id);

assert.deepEqual(
  {
    x: fixedLeftSidebar.x,
    y: fixedLeftSidebar.y,
    w: fixedLeftSidebar.w,
    h: fixedLeftSidebar.h
  },
  {
    x: 1,
    y: 1,
    w: 4,
    h: 8
  }
);

console.log("scene layout occupancy tests passed");

function createMetrics(columns, rows, debug = null) {
  return {
    columns,
    rows,
    cellSize: 20,
    gridWidth: columns * 20,
    gridHeight: rows * 20,
    ...(debug ? { debug } : {})
  };
}
