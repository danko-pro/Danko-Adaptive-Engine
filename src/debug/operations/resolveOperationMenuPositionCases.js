import assert from "node:assert/strict";
import {
  resolveDraggedOperationMenuPosition,
  resolveOperationMenuBounds,
  resolveOperationMenuPosition
} from "./resolveOperationMenuPosition.js";

const viewportRect = {
  left: 0,
  top: 0,
  right: 800,
  bottom: 600
};
const workspaceRect = {
  left: 100,
  top: 50,
  right: 500,
  bottom: 450
};
const menuSize = {
  width: 180,
  height: 120
};

assert.deepEqual(
  resolveOperationMenuBounds({ viewportRect, workspaceRect }),
  {
    left: 108,
    top: 58,
    right: 492,
    bottom: 442
  }
);

assert.deepEqual(
  resolveOperationMenuPosition({
    anchor: {
      centerX: 110,
      top: 70,
      bottom: 110
    },
    menuSize,
    viewportRect,
    workspaceRect
  }),
  {
    left: 108,
    top: 118
  }
);

assert.deepEqual(
  resolveOperationMenuPosition({
    anchor: {
      centerX: 480,
      top: 430,
      bottom: 460
    },
    menuSize,
    viewportRect,
    workspaceRect
  }),
  {
    left: 312,
    top: 302
  }
);

assert.deepEqual(
  resolveDraggedOperationMenuPosition({
    position: {
      left: 300,
      top: 300
    },
    delta: {
      x: 500,
      y: 500
    },
    menuSize,
    viewportRect,
    workspaceRect
  }),
  {
    left: 312,
    top: 322
  }
);

assert.deepEqual(
  resolveDraggedOperationMenuPosition({
    position: {
      left: 300,
      top: 300
    },
    delta: {
      x: -500,
      y: -500
    },
    menuSize,
    viewportRect,
    workspaceRect
  }),
  {
    left: 108,
    top: 58
  }
);

console.log("operation menu position tests passed");
