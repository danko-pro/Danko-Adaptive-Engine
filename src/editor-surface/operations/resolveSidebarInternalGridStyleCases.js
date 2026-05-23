import assert from "node:assert/strict";
import {
  SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS,
  resolveSidebarInternalGrid,
  resolveSidebarInternalGridContent,
  resolveSidebarInternalGridStyle
} from "./resolveSidebarInternalGridStyle.js";

assert.deepEqual(
  resolveSidebarInternalGridStyle({
    columns: 4,
    rows: 20
  }),
  {
    width: `calc(4 * ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    height: `calc(20 * ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    gridTemplateColumns: `repeat(4, ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    gridTemplateRows: `repeat(20, ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`
  }
);

assert.deepEqual(
  resolveSidebarInternalGrid({
    columns: 4,
    rows: 20
  }, {
    w: 8,
    h: 6
  }),
  {
    columns: 8,
    rows: 20
  }
);

assert.deepEqual(
  resolveSidebarInternalGrid({
    columns: 10,
    rows: 20
  }, {
    w: 8,
    h: 20
  }),
  {
    columns: 10,
    rows: 20
  }
);

assert.deepEqual(
  resolveSidebarInternalGrid({
    columns: 4,
    rows: 20
  }, {
    w: 8,
    h: 30
  }),
  {
    columns: 8,
    rows: 30
  }
);

assert.deepEqual(
  resolveSidebarInternalGrid({
    columns: "bad",
    rows: 0
  }, {
    w: -8,
    h: "bad"
  }),
  {
    columns: 1,
    rows: 1
  }
);

assert.deepEqual(
  resolveSidebarInternalGridContent({
    grid: {
      columns: 4,
      rows: 20
    },
    items: [
      { id: "nav-layout" }
    ]
  }, {
    w: 8,
    h: 6
  }),
  {
    grid: {
      columns: 8,
      rows: 20
    },
    items: [
      { id: "nav-layout" }
    ]
  }
);

assert.deepEqual(
  resolveSidebarInternalGridContent({
    grid: {
      columns: 4,
      rows: 20
    },
    items: [
      { id: "nav-checks", x: 4, y: 2, w: 1, h: 1, text: "Checks" }
    ]
  }, {
    w: 8,
    h: 20
  }, {
    grid: {
      columns: 8,
      rows: 20
    },
    items: [
      { id: "nav-checks", x: 8, y: 2, w: 1, h: 1 }
    ]
  }),
  {
    grid: {
      columns: 8,
      rows: 20
    },
    items: [
      { id: "nav-checks", x: 8, y: 2, w: 1, h: 1, text: "Checks" }
    ]
  }
);

assert.deepEqual(
  resolveSidebarInternalGridStyle({
    columns: 0,
    rows: "bad"
  }),
  {
    width: `calc(1 * ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    height: `calc(1 * ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    gridTemplateColumns: `repeat(1, ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    gridTemplateRows: `repeat(1, ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`
  }
);

console.log("sidebar internal grid style tests passed");
