import assert from "node:assert/strict";
import { detectAreaCollision, OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import {
  SCENE_OPERATION_ERRORS,
  SCENE_OPERATION_TYPES,
  applySceneOperationCommand
} from "../index.js";
import {
  SIDEBAR_ANIMATIONS,
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_FONT_FAMILIES,
  SIDEBAR_CONTENT_ITEM_TYPES,
  SIDEBAR_CONTENT_TEXT_ALIGNS,
  SIDEBAR_DOCKS,
  SIDEBAR_STATES,
  SIDEBAR_TEXT_FIT_MODES,
  SIDEBAR_TRIGGERS
} from "../../sidebar-element/index.js";

const metrics = {
  columns: 24,
  rows: 16,
  cellSize: 20,
  gridWidth: 480,
  gridHeight: 320
};

const overlaySidebar = {
  id: "sidebar-overlay",
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

const fixedSidebar = {
  ...overlaySidebar,
  id: "sidebar-fixed",
  meta: {
    ...overlaySidebar.meta,
    sidebar: {
      state: SIDEBAR_STATES.FIXED
    }
  }
};

const content = {
  id: "content-main",
  x: 10,
  y: 4,
  w: 5,
  h: 5,
  meta: {
    blockType: "content"
  }
};

const createUnderOverlay = applySceneOperationCommand({
  items: [overlaySidebar],
  operation: {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "content-under-overlay",
    payload: {
      x: 2,
      y: 2,
      w: 3,
      h: 3
    },
    meta: {
      blockType: "content"
    }
  },
  metrics
});

assert.equal(createUnderOverlay.valid, true);
assert.equal(createUnderOverlay.items.some((item) => item.id === "content-under-overlay"), true);

const createSidebarThroughGateway = applySceneOperationCommand({
  items: [],
  operation: {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "sidebar-created-through-gateway",
    payload: {
      x: 1,
      y: 1,
      w: 4,
      h: 8
    },
    meta: {
      blockType: "sidebar",
      sidebar: {
        state: SIDEBAR_STATES.OVERLAY
      }
    }
  },
  metrics
});

const sidebarCreatedThroughGateway = createSidebarThroughGateway.items.find((item) => (
  item.id === "sidebar-created-through-gateway"
));

assert.equal(createSidebarThroughGateway.valid, true);
assert.equal(sidebarCreatedThroughGateway?.meta?.sidebar?.createdFromArea, true);
assert.equal(sidebarCreatedThroughGateway?.meta?.sidebar?.dock, SIDEBAR_DOCKS.LEFT);
assert.deepEqual(sidebarCreatedThroughGateway?.meta?.sidebar?.expandedArea, { x: 1, y: 1, w: 4, h: 8 });

const moveSidebarThroughGateway = applySceneOperationCommand({
  items: [sidebarCreatedThroughGateway],
  operation: {
    type: OPERATION_TYPES.MOVE_AREA,
    targetId: sidebarCreatedThroughGateway.id,
    payload: {
      x: 21,
      y: 4
    }
  },
  metrics
});

const movedSidebarThroughGateway = moveSidebarThroughGateway.items.find((item) => (
  item.id === sidebarCreatedThroughGateway.id
));

assert.equal(moveSidebarThroughGateway.valid, true);
assert.equal(movedSidebarThroughGateway?.meta?.sidebar?.dock, SIDEBAR_DOCKS.RIGHT);
assert.deepEqual(movedSidebarThroughGateway?.meta?.sidebar?.expandedArea, { x: 21, y: 4, w: 4, h: 8 });

const configureSidebarThroughGateway = applySceneOperationCommand({
  items: [sidebarCreatedThroughGateway],
  operation: {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS,
    targetId: sidebarCreatedThroughGateway.id,
    payload: {
      settings: {
        trigger: SIDEBAR_TRIGGERS.HOVER,
        animation: SIDEBAR_ANIMATIONS.FADE,
        responsive: {
          narrow: SIDEBAR_STATES.OVERLAY,
          mobile: SIDEBAR_STATES.COLLAPSED
        }
      }
    }
  },
  metrics
});

const configuredSidebarThroughGateway = configureSidebarThroughGateway.items.find((item) => (
  item.id === sidebarCreatedThroughGateway.id
));

assert.equal(configureSidebarThroughGateway.valid, true);
assert.equal(configuredSidebarThroughGateway?.meta?.sidebar?.trigger, SIDEBAR_TRIGGERS.HOVER);
assert.equal(configuredSidebarThroughGateway?.meta?.sidebar?.animation, SIDEBAR_ANIMATIONS.FADE);
assert.deepEqual(configuredSidebarThroughGateway?.meta?.sidebar?.responsive, {
  narrow: SIDEBAR_STATES.OVERLAY,
  mobile: SIDEBAR_STATES.COLLAPSED
});

const sidebarWithContent = {
  ...configuredSidebarThroughGateway,
  meta: {
    ...configuredSidebarThroughGateway.meta,
    sidebar: {
      ...configuredSidebarThroughGateway.meta.sidebar,
      content: {
        grid: {
          columns: 3,
          rows: 4
        },
        items: [
          {
            id: "nav-layout",
            type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
            x: 1,
            y: 1,
            w: 3,
            h: 1,
            text: "Layout",
            action: {
              type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
              pageId: "layout-page"
            },
            style: {
              fontSize: 14,
              fontWeight: 600,
              fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM,
              lineHeight: 1.2,
              align: SIDEBAR_CONTENT_TEXT_ALIGNS.CENTER
            },
            textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
          }
        ]
      }
    }
  }
};
const updateSidebarContentItemThroughGateway = applySceneOperationCommand({
  items: [sidebarWithContent, content],
  operation: {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: sidebarWithContent.id,
    payload: {
      contentItemId: "nav-layout",
      patch: {
        id: "nav-ignored",
        text: "Home",
        x: 2,
        y: 8,
        w: 5,
        style: {
          fontSize: 3,
          fontWeight: "bold",
          align: SIDEBAR_CONTENT_TEXT_ALIGNS.LEFT,
          textColor: "#0F766E",
          backgroundColor: "#DCFCE7",
          borderColor: "#14532D",
          borderWidth: 12,
          textOpacity: 1.5,
          backgroundOpacity: -1
        }
      }
    }
  },
  metrics
});
const updatedSidebarContentItem = updateSidebarContentItemThroughGateway.items
  .find((item) => item.id === sidebarWithContent.id)
  ?.meta?.sidebar?.content?.items?.[0];

assert.equal(updateSidebarContentItemThroughGateway.valid, true);
assert.equal(updateSidebarContentItemThroughGateway.changed, true);
assert.equal(updateSidebarContentItemThroughGateway.result.report.type, SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM);
assert.deepEqual(updatedSidebarContentItem, {
  id: "nav-layout",
  type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
  x: 2,
  y: 8,
  w: 3,
  h: 1,
  text: "Home",
  action: {
    type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
    pageId: "layout-page",
    routeId: null,
    workspaceId: null
  },
  style: {
    fontSize: 6,
    fontWeight: 700,
    fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM,
    lineHeight: 1.2,
    align: SIDEBAR_CONTENT_TEXT_ALIGNS.LEFT,
    textColor: "#0f766e",
    backgroundColor: "#dcfce7",
    borderColor: "#14532d",
    borderWidth: 8,
    textOpacity: 1,
    backgroundOpacity: 0.1
  },
  textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
});
assert.equal(
  updateSidebarContentItemThroughGateway.items.find((item) => item.id === content.id)?.id,
  content.id
);

const sidebarAfterContentUpdate = updateSidebarContentItemThroughGateway.items.find((item) => (
  item.id === sidebarWithContent.id
));
assert.deepEqual(sidebarAfterContentUpdate?.meta?.sidebar?.content?.grid, {
  columns: 4,
  rows: 8
});
const shrinkSidebarBelowContentThroughGateway = applySceneOperationCommand({
  items: [sidebarAfterContentUpdate, content],
  operation: {
    type: OPERATION_TYPES.RESIZE_AREA,
    targetId: sidebarAfterContentUpdate.id,
    payload: {
      w: 3,
      h: 2
    }
  },
  metrics
});
const protectedSidebarAfterShrink = shrinkSidebarBelowContentThroughGateway.items.find((item) => (
  item.id === sidebarAfterContentUpdate.id
));

assert.equal(shrinkSidebarBelowContentThroughGateway.valid, true);
assert.equal(protectedSidebarAfterShrink?.w, 4);
assert.equal(protectedSidebarAfterShrink?.h, 8);
assert.deepEqual(protectedSidebarAfterShrink?.meta?.sidebar?.expandedArea, {
  x: 1,
  y: 1,
  w: 4,
  h: 8
});

const missingSidebarContentItemThroughGateway = applySceneOperationCommand({
  items: [sidebarWithContent],
  operation: {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: sidebarWithContent.id,
    payload: {
      contentItemId: "missing-nav",
      patch: {
        text: "Missing"
      }
    }
  },
  metrics
});

assert.equal(missingSidebarContentItemThroughGateway.valid, false);
assert.equal(missingSidebarContentItemThroughGateway.result.rejection?.code, "SIDEBAR_CONTENT_ITEM_NOT_FOUND");
assert.equal(
  missingSidebarContentItemThroughGateway.result.report.errorsByType.SIDEBAR_CONTENT_ITEM_NOT_FOUND,
  1
);

const invalidSidebarContentTargetThroughGateway = applySceneOperationCommand({
  items: [content],
  operation: {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_CONTENT_ITEM,
    targetId: content.id,
    payload: {
      contentItemId: "nav-layout",
      patch: {
        text: "Invalid"
      }
    }
  },
  metrics
});

assert.equal(invalidSidebarContentTargetThroughGateway.valid, false);
assert.equal(invalidSidebarContentTargetThroughGateway.result.rejection?.code, "SIDEBAR_INVALID_ITEM");

const moveUnderOverlay = applySceneOperationCommand({
  items: [overlaySidebar, content],
  operation: {
    type: OPERATION_TYPES.MOVE_AREA,
    targetId: content.id,
    payload: {
      x: 2,
      y: 2
    }
  },
  metrics
});

assert.equal(moveUnderOverlay.valid, true);
assert.equal(moveUnderOverlay.result.report.type, OPERATION_TYPES.MOVE_AREA);
assert.equal(moveUnderOverlay.items.find((item) => item.id === content.id)?.x, 2);
assert.equal(moveUnderOverlay.items.find((item) => item.id === content.id)?.y, 2);

const createUnderFixed = applySceneOperationCommand({
  items: [fixedSidebar],
  operation: {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "content-under-fixed",
    payload: {
      x: 2,
      y: 2,
      w: 3,
      h: 3
    },
    meta: {
      blockType: "content"
    }
  },
  metrics
});

assert.equal(createUnderFixed.valid, false);
assert.equal(createUnderFixed.result.rejection?.code, "AREA_COLLISION");

const createInsideFixedReservedStrip = applySceneOperationCommand({
  items: [fixedSidebar],
  operation: {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "content-inside-fixed-strip",
    payload: {
      x: 2,
      y: 10,
      w: 3,
      h: 3
    },
    meta: {
      blockType: "content"
    }
  },
  metrics
});

assert.equal(createInsideFixedReservedStrip.valid, false);
assert.equal(
  createInsideFixedReservedStrip.result.rejection?.code,
  SCENE_OPERATION_ERRORS.NO_SPACE_AFTER_FIXED_SIDEBAR
);

const fixedReservedDockCases = [
  {
    dock: SIDEBAR_DOCKS.LEFT,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.LEFT, { x: 1, y: 1, w: 4, h: 8 }),
    payload: { x: 2, y: 10, w: 3, h: 3 }
  },
  {
    dock: SIDEBAR_DOCKS.RIGHT,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.RIGHT, { x: 21, y: 1, w: 4, h: 8 }),
    payload: { x: 22, y: 10, w: 3, h: 3 }
  },
  {
    dock: SIDEBAR_DOCKS.TOP,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.TOP, { x: 1, y: 1, w: 8, h: 3 }),
    payload: { x: 10, y: 2, w: 3, h: 2 }
  },
  {
    dock: SIDEBAR_DOCKS.BOTTOM,
    sidebar: createFixedSidebarForDock(SIDEBAR_DOCKS.BOTTOM, { x: 1, y: 14, w: 8, h: 3 }),
    payload: { x: 10, y: 15, w: 3, h: 2 }
  }
];

for (const dockCase of fixedReservedDockCases) {
  const command = applySceneOperationCommand({
    items: [dockCase.sidebar],
    operation: {
      type: OPERATION_TYPES.CREATE_AREA,
      targetId: `content-in-${dockCase.dock}-reserved-strip`,
      payload: dockCase.payload,
      meta: {
        blockType: "content"
      }
    },
    metrics
  });

  assert.equal(command.valid, false, `${dockCase.dock}: command rejected`);
  assert.equal(
    command.result.rejection?.code,
    SCENE_OPERATION_ERRORS.NO_SPACE_AFTER_FIXED_SIDEBAR,
    `${dockCase.dock}: reserved strip rejection`
  );
}

const fixedStateChange = applySceneOperationCommand({
  items: [
    overlaySidebar,
    {
      id: "content-under-sidebar",
      x: 2,
      y: 2,
      w: 3,
      h: 3,
      meta: {
        blockType: "content"
      }
    }
  ],
  operation: {
    type: SCENE_OPERATION_TYPES.SET_SIDEBAR_STATE,
    targetId: overlaySidebar.id,
    payload: {
      state: SIDEBAR_STATES.FIXED
    }
  },
  metrics
});

assert.equal(fixedStateChange.valid, true);
assert.equal(fixedStateChange.result.report.type, SCENE_OPERATION_TYPES.SET_SIDEBAR_STATE);
assert.equal(
  fixedStateChange.items.find((item) => item.id === overlaySidebar.id)?.meta?.sidebar?.state,
  SIDEBAR_STATES.FIXED
);

const fixedSidebarAfterStateChange = fixedStateChange.items.find((item) => item.id === overlaySidebar.id);
const contentAfterStateChange = fixedStateChange.items.find((item) => item.id === "content-under-sidebar");

assert.equal(detectAreaCollision(fixedSidebarAfterStateChange, contentAfterStateChange), false);
assert.notDeepEqual(
  {
    x: contentAfterStateChange.x,
    y: contentAfterStateChange.y
  },
  {
    x: 2,
    y: 2
  }
);

const moveBackUnderFixed = applySceneOperationCommand({
  items: fixedStateChange.items,
  operation: {
    type: OPERATION_TYPES.MOVE_AREA,
    targetId: "content-under-sidebar",
    payload: {
      x: 2,
      y: 2
    }
  },
  metrics
});

assert.equal(moveBackUnderFixed.valid, false);
assert.equal(moveBackUnderFixed.result.rejection?.code, "AREA_COLLISION");

const unknownSceneOperation = applySceneOperationCommand({
  items: [overlaySidebar],
  operation: {
    type: "launch-sidebar-into-space",
    targetId: overlaySidebar.id
  },
  metrics
});

assert.equal(unknownSceneOperation.valid, false);
assert.equal(unknownSceneOperation.result.rejection?.code, SCENE_OPERATION_ERRORS.UNKNOWN_SCENE_OPERATION);
assert.equal(unknownSceneOperation.result.report.errorsByType[SCENE_OPERATION_ERRORS.UNKNOWN_SCENE_OPERATION], 1);

console.log("adapter scene-operation gateway tests passed");

function createFixedSidebarForDock(dock, area) {
  return {
    id: `fixed-${dock}-gateway-test`,
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
