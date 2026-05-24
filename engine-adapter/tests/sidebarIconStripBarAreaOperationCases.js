import assert from "node:assert/strict";
import {
  applySceneOperationCommand,
  createSidebarIconStripBarAreaOperation,
  SCENE_OPERATION_TYPES,
  SIDEBAR_ICON_STRIP_BAR_AREA_POINTER_TYPES,
  createSidebarIconStripBarAreaPointerInteraction,
  createSidebarIconStripBarAreaPointerMove
} from "../index.js";
import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_STATES,
  SIDEBAR_VIEWPORT_MODES,
  resolveSidebarIconStripBarAreaPatch,
  resolveSidebarRenderModel
} from "../../sidebar-element/index.js";

assert.deepEqual(
  resolveSidebarIconStripBarAreaPatch({
    absoluteArea: { x: 1, y: 1, w: 12, h: 4 },
    metrics: { columns: 12, rows: 16 }
  }),
  { x: 1, y: 1, w: 12, h: 4 }
);
assert.deepEqual(
  resolveSidebarIconStripBarAreaPatch({
    absoluteArea: { x: 5, y: 1, w: 12, h: 2 },
    metrics: { columns: 12, rows: 16 }
  }),
  { x: 5, y: 1, w: 8, h: 2 }
);
assert.deepEqual(
  resolveSidebarIconStripBarAreaPatch({
    absoluteArea: { x: 99, y: 99, w: 50, h: 50 },
    metrics: { columns: 12, rows: 16 }
  }),
  { x: 12, y: 16, w: 1, h: 1 }
);

assert.deepEqual(
  createSidebarIconStripBarAreaOperation({
    sidebarItemId: " sidebar-a ",
    area: { x: 1, y: 1, w: 12, h: 4 }
  }),
  {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS,
    targetId: "sidebar-a",
    payload: {
      settings: {
        mobileLayout: {
          iconStrip: {
            barArea: { x: 1, y: 1, w: 12, h: 4 }
          }
        }
      }
    }
  }
);

const sidebarItem = {
  id: "sidebar-a",
  x: 1,
  y: 3,
  w: 4,
  h: 10,
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: SIDEBAR_STATES.FIXED,
      expandedArea: { x: 1, y: 3, w: 4, h: 10 },
      mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
      mobileLayout: {
        compactButtonArea: { x: 5, y: 1, w: 2, h: 2 },
        iconStrip: {
          itemsById: {
            "nav-home": { x: 1, y: 1, w: 1, h: 1 }
          }
        }
      },
      content: {
        items: [
          { id: "nav-home", text: "Home", x: 1, y: 1, w: 1, h: 1 }
        ]
      }
    }
  }
};
const metrics = {
  columns: 12,
  rows: 16,
  cellSize: 20,
  debug: {
    mode: "minimum",
    horizontalMode: "min-limit"
  }
};
const command = applySceneOperationCommand({
  items: [sidebarItem],
  operation: createSidebarIconStripBarAreaOperation({
    sidebarItemId: "sidebar-a",
    area: { x: 1, y: 1, w: 12, h: 4 }
  }),
  metrics
});

assert.equal(command.valid, true);
assert.deepEqual(command.items[0].meta.sidebar.mobileLayout.iconStrip.barArea, {
  x: 1,
  y: 1,
  w: 12,
  h: 4
});
assert.deepEqual(command.items[0].meta.sidebar.expandedArea, { x: 1, y: 3, w: 4, h: 10 });
assert.deepEqual(command.items[0].meta.sidebar.mobileLayout.compactButtonArea, { x: 5, y: 1, w: 2, h: 2 });
assert.deepEqual(command.items[0].meta.sidebar.mobileLayout.iconStrip.itemsById, {
  "nav-home": { x: 1, y: 1, w: 1, h: 1 }
});
assert.equal(command.items[0].meta.sidebar.content.items.length, 1);
assert.equal(command.items[0].meta.sidebar.content.items[0].id, "nav-home");
assert.equal(command.items[0].meta.sidebar.content.items[0].text, "Home");
assert.deepEqual(
  pickGeometry(command.items[0].meta.sidebar.content.items[0]),
  { x: 1, y: 1, w: 1, h: 1 }
);
assert.deepEqual(command.items[0], {
  ...sidebarItem,
  x: 1,
  y: 3,
  w: 4,
  h: 10,
  meta: command.items[0].meta
});

const mobileRenderModel = resolveSidebarRenderModel(command.items[0], {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics
});

assert.deepEqual(mobileRenderModel.renderArea, { x: 1, y: 1, w: 12, h: 4 });

const desktopRenderModel = resolveSidebarRenderModel(command.items[0], {
  viewportMode: SIDEBAR_VIEWPORT_MODES.DEFAULT,
  metrics
});

assert.deepEqual(desktopRenderModel.renderArea, { x: 1, y: 3, w: 4, h: 10 });

const pointerInteraction = createSidebarIconStripBarAreaPointerInteraction({
  event: createPointerEvent({
    currentTarget: createPointerTarget(),
    clientX: 5,
    clientY: 5,
    pointerId: 7
  }),
  type: SIDEBAR_ICON_STRIP_BAR_AREA_POINTER_TYPES.MOVE,
  sidebarItem,
  renderInfo: {
    renderArea: { x: 1, y: 1, w: 12, h: 2 }
  },
  sourceItems: [sidebarItem],
  metrics
});

assert.equal(pointerInteraction.pointerId, 7);
assert.deepEqual(
  createSidebarIconStripBarAreaPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(),
      clientX: 85,
      clientY: 5,
      pointerId: 7
    }),
    interaction: pointerInteraction,
    metrics
  })?.barArea,
  { x: 5, y: 1, w: 8, h: 2 }
);

const resizeInteraction = createSidebarIconStripBarAreaPointerInteraction({
  event: createPointerEvent({
    currentTarget: createPointerTarget(),
    clientX: 25,
    clientY: 25,
    pointerId: 8
  }),
  type: SIDEBAR_ICON_STRIP_BAR_AREA_POINTER_TYPES.RESIZE,
  handle: "s",
  sidebarItem,
  renderInfo: {
    renderArea: { x: 1, y: 1, w: 12, h: 2 }
  },
  sourceItems: [sidebarItem],
  metrics
});

assert.deepEqual(
  createSidebarIconStripBarAreaPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(),
      clientX: 25,
      clientY: 65,
      pointerId: 8
    }),
    interaction: resizeInteraction,
    metrics
  })?.barArea,
  { x: 1, y: 1, w: 12, h: 4 }
);

console.log("sidebar icon strip bar area operation tests passed");

function pickGeometry(item) {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}

function createPointerEvent({
  currentTarget,
  clientX,
  clientY,
  pointerId = 1
}) {
  return {
    currentTarget,
    clientX,
    clientY,
    pointerId
  };
}

function createPointerTarget() {
  return {
    closest(selector) {
      return selector === ".layout-canvas" ? createCanvasElement() : null;
    }
  };
}

function createCanvasElement() {
  return {
    getBoundingClientRect() {
      return {
        left: 0,
        top: 0,
        width: 240,
        height: 320
      };
    }
  };
}
