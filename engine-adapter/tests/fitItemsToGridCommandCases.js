import assert from "node:assert/strict";
import { detectAreaCollision } from "../../adaptive-engine/core/index.js";
import { SIDEBAR_DOCKS, SIDEBAR_STATES } from "../../sidebar-element/index.js";
import { fitItemsToGridCommand } from "../commands/fitItemsToGridCommand.js";

const sourceMetrics = createMetrics(75, 30);

const sourceItems = [
  { id: "full-width", x: 1, y: 1, w: 75, h: 2 },
  { id: "right-edge", x: 68, y: 8, w: 8, h: 5 },
  { id: "middle", x: 10, y: 6, w: 4, h: 4 }
];

const narrowResult = fitItemsToGridCommand({
  items: sourceItems,
  metrics: createMetrics(60, 30),
  sourceMetrics
});

assert.equal(narrowResult.valid, true);
assert.equal(narrowResult.changed, true);
assert.deepEqual(findItem(narrowResult.items, "full-width"), {
  id: "full-width",
  x: 1,
  y: 1,
  w: 60,
  h: 2
});
assert.deepEqual(findItem(narrowResult.items, "right-edge"), {
  id: "right-edge",
  x: 53,
  y: 8,
  w: 8,
  h: 5
});
assert.deepEqual(findItem(narrowResult.items, "middle"), {
  id: "middle",
  x: 10,
  y: 6,
  w: 4,
  h: 4
});

const wideResult = fitItemsToGridCommand({
  items: sourceItems,
  metrics: createMetrics(80, 30),
  sourceMetrics
});

assert.equal(wideResult.valid, true);
assert.equal(wideResult.changed, true);
assert.deepEqual(findItem(wideResult.items, "full-width"), {
  id: "full-width",
  x: 1,
  y: 1,
  w: 80,
  h: 2
});
assert.deepEqual(findItem(wideResult.items, "right-edge"), {
  id: "right-edge",
  x: 73,
  y: 8,
  w: 8,
  h: 5
});

assert.deepEqual(sourceItems, [
  { id: "full-width", x: 1, y: 1, w: 75, h: 2 },
  { id: "right-edge", x: 68, y: 8, w: 8, h: 5 },
  { id: "middle", x: 10, y: 6, w: 4, h: 4 }
]);

const restoredFromSourceResult = fitItemsToGridCommand({
  items: sourceItems,
  metrics: sourceMetrics,
  sourceMetrics
});

assert.equal(restoredFromSourceResult.valid, true);
assert.equal(restoredFromSourceResult.changed, false);
assert.deepEqual(restoredFromSourceResult.items, sourceItems);

const crowdedResult = fitItemsToGridCommand({
  items: [
    { id: "full-width", x: 1, y: 1, w: 75, h: 2 },
    { id: "middle-wide", x: 13, y: 4, w: 13, h: 8 },
    { id: "right-edge", x: 68, y: 4, w: 8, h: 5 }
  ],
  metrics: createMetrics(25, 30),
  sourceMetrics
});

assert.equal(crowdedResult.valid, true);
assert.equal(hasCollisions(crowdedResult.items), false);
assert.deepEqual(findItem(crowdedResult.items, "full-width"), {
  id: "full-width",
  x: 1,
  y: 1,
  w: 25,
  h: 2
});
assert.deepEqual(findItem(crowdedResult.items, "middle-wide"), {
  id: "middle-wide",
  x: 13,
  y: 4,
  w: 13,
  h: 8
});

const overlaySidebar = {
  id: "overlay-sidebar",
  x: 1,
  y: 1,
  w: 5,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: SIDEBAR_STATES.OVERLAY
    }
  }
};
const contentUnderOverlay = {
  id: "content-under-overlay",
  x: 2,
  y: 2,
  w: 3,
  h: 3,
  meta: {
    blockType: "content"
  }
};
const overlayResult = fitItemsToGridCommand({
  items: [overlaySidebar, contentUnderOverlay],
  metrics: createMetrics(24, 16),
  sourceMetrics: createMetrics(24, 16)
});

assert.equal(overlayResult.valid, true);
assert.equal(overlayResult.changed, false);
assert.equal(
  detectAreaCollision(
    findItem(overlayResult.items, "overlay-sidebar"),
    findItem(overlayResult.items, "content-under-overlay")
  ),
  true
);

const fixedSidebar = {
  ...overlaySidebar,
  id: "fixed-sidebar",
  meta: {
    ...overlaySidebar.meta,
    sidebar: {
      state: SIDEBAR_STATES.FIXED
    }
  }
};
const contentUnderFixed = {
  ...contentUnderOverlay,
  id: "content-under-fixed"
};
const fixedResult = fitItemsToGridCommand({
  items: [fixedSidebar, contentUnderFixed],
  metrics: createMetrics(24, 16),
  sourceMetrics: createMetrics(24, 16)
});
const fixedContent = findItem(fixedResult.items, "content-under-fixed");

assert.equal(fixedResult.valid, true);
assert.equal(fixedResult.changed, true);
assert.equal(detectAreaCollision(findItem(fixedResult.items, "fixed-sidebar"), fixedContent), false);
assert.notDeepEqual(
  {
    x: fixedContent.x,
    y: fixedContent.y
  },
  {
    x: 2,
    y: 2
  }
);

const contentInFixedReservedStrip = {
  id: "content-in-fixed-strip",
  x: 2,
  y: 10,
  w: 3,
  h: 3,
  meta: {
    blockType: "content"
  }
};
const fixedReservedStripResult = fitItemsToGridCommand({
  items: [fixedSidebar, contentInFixedReservedStrip],
  metrics: createMetrics(24, 16),
  sourceMetrics: createMetrics(24, 16)
});
const fixedReservedStripContent = findItem(fixedReservedStripResult.items, "content-in-fixed-strip");

assert.equal(fixedReservedStripResult.valid, true);
assert.equal(fixedReservedStripResult.changed, true);
assert.equal(fixedReservedStripContent.x > fixedSidebar.w, true);

const overlayReservedStripResult = fitItemsToGridCommand({
  items: [overlaySidebar, contentInFixedReservedStrip],
  metrics: createMetrics(24, 16),
  sourceMetrics: createMetrics(24, 16)
});

assert.equal(overlayReservedStripResult.valid, true);
assert.equal(overlayReservedStripResult.changed, false);
assert.deepEqual(
  findItem(overlayReservedStripResult.items, "content-in-fixed-strip"),
  contentInFixedReservedStrip
);

const reservedDockCases = [
  {
    dock: SIDEBAR_DOCKS.LEFT,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.LEFT, { x: 1, y: 1, w: 4, h: 8 }),
    content: createContentInReservedDock(SIDEBAR_DOCKS.LEFT),
    assertOutside: (item) => item.x > 4
  },
  {
    dock: SIDEBAR_DOCKS.RIGHT,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.RIGHT, { x: 21, y: 1, w: 4, h: 8 }),
    content: createContentInReservedDock(SIDEBAR_DOCKS.RIGHT),
    assertOutside: (item) => item.x + item.w - 1 < 21
  },
  {
    dock: SIDEBAR_DOCKS.TOP,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.TOP, { x: 1, y: 1, w: 8, h: 3 }),
    content: createContentInReservedDock(SIDEBAR_DOCKS.TOP),
    assertOutside: (item) => item.y > 3
  },
  {
    dock: SIDEBAR_DOCKS.BOTTOM,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.BOTTOM, { x: 1, y: 14, w: 8, h: 3 }),
    content: createContentInReservedDock(SIDEBAR_DOCKS.BOTTOM),
    assertOutside: (item) => item.y + item.h - 1 < 14
  }
];

for (const dockCase of reservedDockCases) {
  const result = fitItemsToGridCommand({
    items: [dockCase.sidebar, dockCase.content],
    metrics: createMetrics(24, 16),
    sourceMetrics: createMetrics(24, 16)
  });
  const contentItem = findItem(result.items, dockCase.content.id);

  assert.equal(result.valid, true, `${dockCase.dock}: valid`);
  assert.equal(result.changed, true, `${dockCase.dock}: changed`);
  assert.equal(dockCase.assertOutside(contentItem), true, `${dockCase.dock}: content outside reserved strip`);
}

console.log("adapter fit-items tests passed");

function createMetrics(columns, rows) {
  return {
    columns,
    rows,
    cellSize: 20,
    gridWidth: columns * 20,
    gridHeight: rows * 20
  };
}

function findItem(items, id) {
  return items.find((item) => item.id === id);
}

function createFixedSidebarForDock(dock, area) {
  return {
    id: `fixed-${dock}-reserved-test`,
    ...area,
    meta: {
      blockType: "sidebar",
      sidebar: {
        dock,
        state: SIDEBAR_STATES.FIXED
      }
    }
  };
}

function createContentInReservedDock(dock) {
  const areas = {
    [SIDEBAR_DOCKS.LEFT]: { x: 2, y: 10, w: 2, h: 3 },
    [SIDEBAR_DOCKS.RIGHT]: { x: 22, y: 10, w: 2, h: 3 },
    [SIDEBAR_DOCKS.TOP]: { x: 10, y: 2, w: 3, h: 2 },
    [SIDEBAR_DOCKS.BOTTOM]: { x: 10, y: 15, w: 3, h: 2 }
  };

  return {
    id: `content-in-${dock}-reserved-test`,
    ...areas[dock],
    meta: {
      blockType: "content"
    }
  };
}

function hasCollisions(items) {
  return items.some((item, index) =>
    items.slice(index + 1).some((nextItem) => detectAreaCollision(item, nextItem))
  );
}
