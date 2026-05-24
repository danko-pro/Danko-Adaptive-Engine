import assert from "node:assert/strict";
import {
  applySceneOperationCommand,
  createSidebarCompactBarAreaOperation,
  createSidebarMobileButtonAreaOperation,
  SCENE_OPERATION_TYPES,
  SIDEBAR_COMPACT_BAR_AREA_POINTER_TYPES,
  SIDEBAR_MOBILE_BUTTON_POINTER_TYPES,
  createSidebarCompactBarAreaPointerInteraction,
  createSidebarCompactBarAreaPointerMove,
  createSidebarMobileButtonPointerInteraction,
  createSidebarMobileButtonPointerMove
} from "../index.js";
import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_STATES,
  SIDEBAR_VIEWPORT_MODES,
  resolveSidebarMobileButtonAbsoluteArea,
  resolveSidebarMobileButtonRelativeArea,
  resolveSidebarRenderModel
} from "../../sidebar-element/index.js";

const renderArea = { x: 10, y: 3, w: 12, h: 2 };

assert.deepEqual(
  resolveSidebarMobileButtonRelativeArea({
    absoluteArea: { x: 15, y: 3, w: 2, h: 2 },
    renderArea
  }),
  { x: 6, y: 1, w: 2, h: 2 }
);
assert.deepEqual(
  resolveSidebarMobileButtonRelativeArea({
    absoluteArea: { x: 99, y: 99, w: 2, h: 2 },
    renderArea
  }),
  { x: 11, y: 1, w: 2, h: 2 }
);
assert.deepEqual(
  resolveSidebarMobileButtonRelativeArea({
    absoluteArea: { x: 15, y: 3, w: 50, h: 50 },
    renderArea
  }),
  { x: 1, y: 1, w: 12, h: 2 }
);
assert.deepEqual(
  resolveSidebarMobileButtonAbsoluteArea({
    relativeArea: { x: 6, y: 1, w: 2, h: 2 },
    renderArea
  }),
  { x: 15, y: 3, w: 2, h: 2 }
);

assert.deepEqual(
  createSidebarMobileButtonAreaOperation({
    sidebarItemId: " sidebar-a ",
    area: { x: 6, y: 1, w: 2, h: 2 }
  }),
  {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS,
    targetId: "sidebar-a",
    payload: {
      settings: {
        mobileLayout: {
          compactButtonArea: { x: 6, y: 1, w: 2, h: 2 }
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
      mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
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
  operation: createSidebarMobileButtonAreaOperation({
    sidebarItemId: "sidebar-a",
    area: { x: 5, y: 1, w: 2, h: 2 }
  }),
  metrics
});

assert.equal(command.valid, true);
assert.deepEqual(command.items[0].meta.sidebar.mobileLayout.compactButtonArea, {
  x: 5,
  y: 1,
  w: 2,
  h: 2
});

const renderModel = resolveSidebarRenderModel(command.items[0], {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics
});

assert.deepEqual(renderModel.renderArea, { x: 1, y: 1, w: 12, h: 2 });
assert.deepEqual(renderModel.mobilePresentation.buttonArea, { x: 5, y: 1, w: 2, h: 2 });

const pointerInteraction = createSidebarMobileButtonPointerInteraction({
  event: createPointerEvent({
    currentTarget: createPointerTarget(),
    clientX: 5,
    clientY: 5,
    pointerId: 7
  }),
  type: SIDEBAR_MOBILE_BUTTON_POINTER_TYPES.MOVE,
  sidebarItem,
  renderInfo: {
    renderArea: { x: 1, y: 1, w: 12, h: 2 },
    mobilePresentation: {
      buttonArea: { x: 1, y: 1, w: 2, h: 2 }
    }
  },
  sourceItems: [sidebarItem],
  metrics
});

assert.equal(pointerInteraction.pointerId, 7);
assert.deepEqual(
  createSidebarMobileButtonPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(),
      clientX: 85,
      clientY: 5,
      pointerId: 7
    }),
    interaction: pointerInteraction,
    metrics
  })?.relativeArea,
  { x: 5, y: 1, w: 2, h: 2 }
);

const resizeInteraction = createSidebarMobileButtonPointerInteraction({
  event: createPointerEvent({
    currentTarget: createPointerTarget(),
    clientX: 25,
    clientY: 25,
    pointerId: 8
  }),
  type: SIDEBAR_MOBILE_BUTTON_POINTER_TYPES.RESIZE,
  handle: "e",
  sidebarItem,
  renderInfo: {
    renderArea: { x: 1, y: 1, w: 12, h: 2 },
    mobilePresentation: {
      buttonArea: { x: 1, y: 1, w: 2, h: 2 }
    }
  },
  sourceItems: [sidebarItem],
  metrics
});

assert.deepEqual(
  createSidebarMobileButtonPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(),
      clientX: 65,
      clientY: 25,
      pointerId: 8
    }),
    interaction: resizeInteraction,
    metrics
  })?.relativeArea,
  { x: 1, y: 1, w: 4, h: 2 }
);

assert.deepEqual(
  createSidebarCompactBarAreaOperation({
    sidebarItemId: " sidebar-b ",
    area: { x: 1, y: 1, w: 12, h: 4 }
  }),
  {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS,
    targetId: "sidebar-b",
    payload: {
      settings: {
        mobileLayout: {
          compactBarArea: { x: 1, y: 1, w: 12, h: 4 }
        }
      }
    }
  }
);

const compactHostSidebar = {
  id: "sidebar-b",
  x: 1,
  y: 3,
  w: 4,
  h: 10,
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: SIDEBAR_STATES.FIXED,
      expandedArea: { x: 1, y: 3, w: 4, h: 10 },
      mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
      mobileLayout: {
        compactButtonArea: { x: 1, y: 1, w: 2, h: 2 },
        iconStrip: {
          barArea: { x: 5, y: 1, w: 10, h: 3 },
          itemsById: {
            "nav-home": { x: 1, y: 1, w: 1, h: 1 }
          }
        }
      }
    }
  }
};
const compactBarCommand = applySceneOperationCommand({
  items: [compactHostSidebar],
  operation: createSidebarCompactBarAreaOperation({
    sidebarItemId: "sidebar-b",
    area: { x: 1, y: 1, w: 12, h: 4 }
  }),
  metrics
});

assert.equal(compactBarCommand.valid, true);
assert.deepEqual(compactBarCommand.items[0].meta.sidebar.mobileLayout.compactBarArea, {
  x: 1,
  y: 1,
  w: 12,
  h: 4
});
assert.deepEqual(compactBarCommand.items[0].meta.sidebar.mobileLayout.compactButtonArea, {
  x: 1,
  y: 1,
  w: 2,
  h: 2
});
assert.deepEqual(compactBarCommand.items[0].meta.sidebar.mobileLayout.iconStrip, {
  barArea: { x: 5, y: 1, w: 10, h: 3 },
  itemsById: {
    "nav-home": { x: 1, y: 1, w: 1, h: 1 }
  }
});
assert.deepEqual(compactBarCommand.items[0].meta.sidebar.expandedArea, {
  x: 1,
  y: 3,
  w: 4,
  h: 10
});

const compactBarRenderModel = resolveSidebarRenderModel(compactBarCommand.items[0], {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics
});

assert.deepEqual(compactBarRenderModel.renderArea, { x: 1, y: 1, w: 12, h: 4 });
assert.deepEqual(compactBarRenderModel.mobilePresentation.buttonArea, { x: 1, y: 1, w: 2, h: 2 });

const compactBarResizeInteraction = createSidebarCompactBarAreaPointerInteraction({
  event: createPointerEvent({
    currentTarget: createPointerTarget(),
    clientX: 25,
    clientY: 25,
    pointerId: 9
  }),
  type: SIDEBAR_COMPACT_BAR_AREA_POINTER_TYPES.RESIZE,
  handle: "s",
  sidebarItem: compactHostSidebar,
  renderInfo: {
    renderArea: { x: 1, y: 1, w: 12, h: 2 }
  },
  sourceItems: [compactHostSidebar],
  metrics
});

assert.deepEqual(
  createSidebarCompactBarAreaPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(),
      clientX: 25,
      clientY: 65,
      pointerId: 9
    }),
    interaction: compactBarResizeInteraction,
    metrics
  })?.compactBarArea,
  { x: 1, y: 1, w: 12, h: 4 }
);

console.log("sidebar mobile button area operation tests passed");

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
