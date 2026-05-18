import assert from "node:assert/strict";
import {
  OPERATION_TYPES,
  createPointerInteraction,
  createPointerOperation
} from "../index.js";

const metrics = {
  columns: 10,
  rows: 10,
  cellSize: 10
};

const canvas = {
  getBoundingClientRect() {
    return {
      left: 0,
      top: 0
    };
  }
};

const pointerCaptureElement = {
  closest(selector) {
    return selector === ".layout-canvas" ? canvas : null;
  }
};

const item = {
  id: "resizable",
  x: 2,
  y: 2,
  w: 3,
  h: 3
};

const southeast = createResizeOperation({
  handle: "se",
  currentCell: { x: 6, y: 7 },
  currentTarget: {}
});

assert.equal(southeast.type, OPERATION_TYPES.SET_AREA);
assert.deepEqual(southeast.payload, {
  x: 2,
  y: 2,
  w: 5,
  h: 6
});

const eastCrossedWest = createResizeOperation({
  handle: "e",
  currentCell: { x: 1, y: 3 },
  currentTarget: {}
});

assert.deepEqual(eastCrossedWest.payload, {
  x: 2,
  y: 2,
  w: 1,
  h: 3
});

const westCrossedEast = createResizeOperation({
  handle: "w",
  currentCell: { x: 8, y: 3 },
  currentTarget: {}
});

assert.deepEqual(westCrossedEast.payload, {
  x: 4,
  y: 2,
  w: 1,
  h: 3
});

const northCrossedSouth = createResizeOperation({
  handle: "n",
  currentCell: { x: 3, y: 8 },
  currentTarget: {}
});

assert.deepEqual(northCrossedSouth.payload, {
  x: 2,
  y: 4,
  w: 3,
  h: 1
});

const southCrossedNorth = createResizeOperation({
  handle: "s",
  currentCell: { x: 3, y: 1 },
  currentTarget: {}
});

assert.deepEqual(southCrossedNorth.payload, {
  x: 2,
  y: 2,
  w: 3,
  h: 1
});

console.log("adapter pointer operation tests passed");

function createResizeOperation({ handle, currentCell, currentTarget = pointerCaptureElement }) {
  const interaction = createPointerInteraction({
    event: createPointerEvent({ cell: { x: 4, y: 4 }, currentTarget: pointerCaptureElement }),
    type: "resize",
    handle,
    item,
    sourceItems: [item],
    metrics
  });

  // Во время document-level drag currentTarget уже может быть document,
  // поэтому операция обязана брать canvas из interaction.
  return createPointerOperation({
    event: createPointerEvent({ cell: currentCell, currentTarget }),
    interaction,
    metrics
  });
}

function createPointerEvent({ cell, currentTarget }) {
  return {
    pointerId: 1,
    buttons: 1,
    clientX: (cell.x - 1) * metrics.cellSize + 1,
    clientY: (cell.y - 1) * metrics.cellSize + 1,
    currentTarget
  };
}
