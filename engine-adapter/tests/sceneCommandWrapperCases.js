import assert from "node:assert/strict";
import {
  BLOCK_CONTENT_TYPES,
  copyAreaCommand,
  createAreaFromCellCommand,
  renameAreaCommand
} from "../index.js";
import { SIDEBAR_STATES } from "../../sidebar-element/index.js";

const metrics = {
  columns: 24,
  rows: 16,
  cellSize: 20,
  gridWidth: 480,
  gridHeight: 320
};

const createdContent = createAreaFromCellCommand({
  cell: { x: 2, y: 2 },
  size: { w: 3, h: 3 },
  value: "Content",
  blockType: BLOCK_CONTENT_TYPES.CONTENT,
  items: [],
  metrics
});

assert.equal(createdContent.valid, true);
assert.equal(createdContent.items[0].id, "cell-2-2");
assert.equal(createdContent.items[0].meta.blockType, BLOCK_CONTENT_TYPES.CONTENT);

const renamedContent = renameAreaCommand({
  item: createdContent.items[0],
  value: "Renamed",
  items: createdContent.items,
  metrics
});

assert.equal(renamedContent.valid, true);
assert.equal(renamedContent.items.find((item) => item.id === "cell-2-2")?.meta.value, "Renamed");

const copiedContent = copyAreaCommand({
  item: renamedContent.items[0],
  items: renamedContent.items,
  metrics
});

assert.equal(copiedContent.valid, true);
assert.equal(copiedContent.items.some((item) => item.id === "cell-2-2-copy"), true);

const createdSidebar = createAreaFromCellCommand({
  cell: { x: 1, y: 1 },
  size: { w: 4, h: 8 },
  value: "Sidebar",
  blockType: BLOCK_CONTENT_TYPES.SIDEBAR,
  items: renamedContent.items,
  metrics
});

assert.equal(createdSidebar.valid, true);

const sidebar = createdSidebar.items.find((item) => item.id === "cell-1-1");

assert.equal(sidebar.meta.blockType, BLOCK_CONTENT_TYPES.SIDEBAR);
assert.equal(sidebar.meta.sidebar.state, SIDEBAR_STATES.OVERLAY);
assert.equal(sidebar.meta.sidebar.createdFromArea, true);
assert.deepEqual(sidebar.meta.sidebar.expandedArea, { x: 1, y: 1, w: 4, h: 8 });

const linkedWarning = createAreaFromCellCommand({
  cell: { x: 10, y: 2 },
  size: { w: 3, h: 2 },
  value: "Warning",
  blockType: BLOCK_CONTENT_TYPES.WARNING,
  items: createdSidebar.items,
  metrics,
  meta: {
    dependencies: ["cell-2-2"]
  }
});

assert.equal(linkedWarning.valid, true);

const warning = linkedWarning.items.find((item) => item.id === "cell-10-2");

assert.equal(warning.meta.blockType, BLOCK_CONTENT_TYPES.WARNING);
assert.deepEqual(warning.meta.dependencies, ["cell-2-2"]);

console.log("adapter scene command wrapper tests passed");
