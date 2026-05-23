import assert from "node:assert/strict";
import {
  createSidebarContentItemGeometryOperation,
  createSidebarContentItemPatchOperation,
  createSidebarContentItemStyleOperation,
  createSidebarContentItemTextOperation
} from "../../../engine-adapter/index.js";
import { SIDEBAR_STATES } from "../../../sidebar-element/index.js";
import { canStartOperationMenuDrag } from "./operationMenuDragIntent.js";
import {
  OPERATION_MENU_TARGET_TYPES,
  createAreaOperationMenuTarget,
  createMobileSidebarButtonOperationMenuTarget,
  createSidebarContentOperationMenuTarget,
  getOperationMenuTargetAnchorItemId,
  getOperationMenuTargetAnchorKey,
  getOperationMenuTargetKey,
  isAreaOperationMenuTargetForItem,
  isMobileSidebarButtonOperationMenuTarget,
  isSidebarContentOperationMenuTarget,
  resolveOperationMenuTarget,
  resolveOperationMenuTargetItem,
  resolveSidebarContentOperationMenuTargetItem
} from "./operationMenuTarget.js";
import { resolveSidebarContentOperationItems } from "./resolveSidebarContentOperationItems.js";
import { resolveSidebarContentTextFitToast } from "./resolveSidebarContentTextFitToast.js";
import { resolveSidebarFixedToggle } from "./resolveSidebarFixedToggle.js";

assert.equal(
  canStartOperationMenuDrag({
    button: 0,
    target: createTarget(false),
    hasPosition: true
  }),
  true
);

assert.equal(
  canStartOperationMenuDrag({
    button: 1,
    target: createTarget(false),
    hasPosition: true
  }),
  false
);

assert.equal(
  canStartOperationMenuDrag({
    button: 0,
    target: createTarget(false),
    hasPosition: false
  }),
  false
);

assert.equal(
  canStartOperationMenuDrag({
    button: 0,
    target: createTarget(true),
    hasPosition: true
  }),
  false
);

assert.deepEqual(
  resolveSidebarFixedToggle({ state: SIDEBAR_STATES.FIXED }),
  {
    active: true,
    nextState: SIDEBAR_STATES.OVERLAY,
    title: "Отключить фиксацию: сайдбар станет поверхностным и перестанет резервировать зону"
  }
);

assert.deepEqual(
  resolveSidebarFixedToggle({ state: SIDEBAR_STATES.OVERLAY }),
  {
    active: false,
    nextState: SIDEBAR_STATES.FIXED,
    title: "Включить фиксацию: сайдбар зарезервирует свою зону и не пустит layout-блоки под себя"
  }
);

assert.equal(resolveSidebarFixedToggle({ state: "unknown" }).nextState, SIDEBAR_STATES.FIXED);
assert.equal(resolveSidebarFixedToggle().nextState, SIDEBAR_STATES.FIXED);

assert.deepEqual(
  createAreaOperationMenuTarget({ id: "content-a" }),
  {
    type: OPERATION_MENU_TARGET_TYPES.AREA_ITEM,
    itemId: "content-a"
  }
);

assert.deepEqual(
  resolveOperationMenuTarget("content-a"),
  {
    type: OPERATION_MENU_TARGET_TYPES.AREA_ITEM,
    itemId: "content-a"
  }
);

assert.deepEqual(
  createSidebarContentOperationMenuTarget({
    sidebarItemId: "sidebar-a",
    contentItemId: "nav-layout"
  }),
  {
    type: OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM,
    sidebarItemId: "sidebar-a",
    contentItemId: "nav-layout"
  }
);

assert.deepEqual(
  createMobileSidebarButtonOperationMenuTarget({
    sidebarItemId: "sidebar-a"
  }),
  {
    type: OPERATION_MENU_TARGET_TYPES.MOBILE_SIDEBAR_BUTTON,
    sidebarItemId: "sidebar-a"
  }
);

assert.equal(
  getOperationMenuTargetAnchorItemId({
    type: OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM,
    sidebarItemId: "sidebar-a",
    contentItemId: "nav-layout"
  }),
  "sidebar-a"
);

assert.equal(
  getOperationMenuTargetAnchorItemId(createMobileSidebarButtonOperationMenuTarget({
    sidebarItemId: "sidebar-a"
  })),
  "sidebar-a"
);

assert.equal(
  getOperationMenuTargetAnchorKey(createAreaOperationMenuTarget("content-a")),
  "content-a"
);

assert.equal(
  getOperationMenuTargetAnchorKey(createSidebarContentOperationMenuTarget({
    sidebarItemId: "sidebar-a",
    contentItemId: "nav-layout"
  })),
  "sidebar-content-item:sidebar-a:nav-layout"
);

assert.equal(
  getOperationMenuTargetAnchorKey(createMobileSidebarButtonOperationMenuTarget({
    sidebarItemId: "sidebar-a"
  })),
  "mobile-sidebar-button:sidebar-a"
);

assert.equal(
  getOperationMenuTargetKey(createAreaOperationMenuTarget("content-a")),
  "area-item:content-a"
);

assert.equal(
  getOperationMenuTargetKey(createSidebarContentOperationMenuTarget({
    sidebarItemId: "sidebar-a",
    contentItemId: "nav-layout"
  })),
  "sidebar-content-item:sidebar-a:nav-layout"
);

assert.equal(
  getOperationMenuTargetKey(createMobileSidebarButtonOperationMenuTarget({
    sidebarItemId: "sidebar-a"
  })),
  "mobile-sidebar-button:sidebar-a"
);

assert.equal(
  resolveOperationMenuTargetItem({
    target: createSidebarContentOperationMenuTarget({
      sidebarItemId: "sidebar-a",
      contentItemId: "nav-layout"
    }),
    items: [
      { id: "content-a" },
      { id: "sidebar-a" }
    ]
  })?.id,
  "sidebar-a"
);

assert.equal(
  resolveOperationMenuTargetItem({
    target: createMobileSidebarButtonOperationMenuTarget({
      sidebarItemId: "sidebar-a"
    }),
    items: [
      { id: "content-a" },
      { id: "sidebar-a" }
    ]
  })?.id,
  "sidebar-a"
);

assert.equal(isSidebarContentOperationMenuTarget(createAreaOperationMenuTarget("content-a")), false);
assert.equal(isMobileSidebarButtonOperationMenuTarget(createAreaOperationMenuTarget("content-a")), false);
assert.equal(
  isSidebarContentOperationMenuTarget(createSidebarContentOperationMenuTarget({
    sidebarItemId: "sidebar-a",
    contentItemId: "nav-layout"
  })),
  true
);
assert.equal(
  isMobileSidebarButtonOperationMenuTarget(createMobileSidebarButtonOperationMenuTarget({
    sidebarItemId: "sidebar-a"
  })),
  true
);

assert.equal(
  resolveSidebarContentOperationMenuTargetItem({
    target: createSidebarContentOperationMenuTarget({
      sidebarItemId: "sidebar-a",
      contentItemId: "nav-layout"
    }),
    item: {
      id: "sidebar-a",
      meta: {
        sidebar: {
          content: {
            items: [
              { id: "nav-layout", text: "layout" },
              { id: "nav-content", text: "content" }
            ]
          }
        }
      }
    }
  })?.text,
  "layout"
);

assert.equal(
  resolveSidebarContentOperationMenuTargetItem({
    target: createAreaOperationMenuTarget("content-a"),
    item: {
      id: "sidebar-a",
      meta: {
        sidebar: {
          content: {
            items: [
              { id: "nav-layout", text: "layout" }
            ]
          }
        }
      }
    }
  }),
  null
);

assert.deepEqual(
  createSidebarContentItemTextOperation({
    sidebarItemId: " sidebar-a ",
    contentItemId: " nav-layout ",
    text: 42
  }),
  {
    type: "set-sidebar-content-item",
    targetId: "sidebar-a",
    payload: {
      contentItemId: "nav-layout",
      patch: {
        text: "42"
      }
    }
  }
);

assert.equal(
  createSidebarContentItemTextOperation({
    sidebarItemId: "sidebar-a",
    contentItemId: "nav-layout",
    text: "Layout\nPage"
  }).payload.patch.text,
  "Layout\nPage"
);

assert.deepEqual(
  createSidebarContentItemGeometryOperation({
    sidebarItemId: " sidebar-a ",
    contentItemId: " nav-layout ",
    area: {
      x: 2,
      y: "3",
      w: 4,
      h: 1,
      ignored: true
    }
  }),
  {
    type: "set-sidebar-content-item",
    targetId: "sidebar-a",
    payload: {
      contentItemId: "nav-layout",
      patch: {
        x: 2,
        y: "3",
        w: 4,
        h: 1
      }
    }
  }
);

assert.deepEqual(
  createSidebarContentItemStyleOperation({
    sidebarItemId: " sidebar-a ",
    contentItemId: " nav-layout ",
    style: {
      fontSize: 18,
      fontWeight: 700,
      align: "right",
      textColor: "#0f766e",
      backgroundColor: "#dcfce7",
      borderColor: "#14532d",
      borderWidth: 2,
      fontFamily: "mono",
      lineHeight: 1.45,
      textOpacity: 0.7,
      backgroundOpacity: 0.45,
      ignored: undefined
    }
  }),
  {
    type: "set-sidebar-content-item",
    targetId: "sidebar-a",
    payload: {
      contentItemId: "nav-layout",
      patch: {
        style: {
          fontSize: 18,
          fontWeight: 700,
          align: "right",
          textColor: "#0f766e",
          backgroundColor: "#dcfce7",
          borderColor: "#14532d",
          borderWidth: 2,
          fontFamily: "mono",
          lineHeight: 1.45,
          textOpacity: 0.7,
          backgroundOpacity: 0.45
        }
      }
    }
  }
);

assert.deepEqual(
  createSidebarContentItemPatchOperation({
    sidebarItemId: " sidebar-a ",
    contentItemId: " nav-layout ",
    patch: {
      variant: "primary",
      disabled: true,
      active: false,
      text: "ignored"
    }
  }),
  {
    type: "set-sidebar-content-item",
    targetId: "sidebar-a",
    payload: {
      contentItemId: "nav-layout",
      patch: {
        variant: "primary",
        disabled: true,
        active: false
      }
    }
  }
);

assert.equal(
  resolveSidebarContentTextFitToast({
    sidebarItem: {
      id: "sidebar-a",
      meta: {
        sidebar: {
          content: {
            grid: {
              columns: 4,
              rows: 4
            },
            items: [
              {
                id: "nav-short",
                x: 1,
                y: 1,
                w: 4,
                h: 1,
                text: "Ok",
                textFit: "wrap"
              }
            ]
          }
        }
      }
    },
    contentItem: {
      id: "nav-short"
    },
    metrics: {
      cellSize: 24
    }
  }),
  null
);

assert.deepEqual(
  resolveSidebarContentTextFitToast({
    sidebarItem: {
      id: "sidebar-a",
      meta: {
        sidebar: {
          content: {
            grid: {
              columns: 4,
              rows: 4
            },
            items: [
              {
                id: "nav-long",
                x: 1,
                y: 1,
                w: 1,
                h: 1,
                text: "Very long sidebar item label",
                style: {
                  fontSize: 20
                },
                textFit: "wrap"
              }
            ]
          }
        }
      }
    },
    contentItem: {
      id: "nav-long"
    },
    metrics: {
      cellSize: 24
    }
  }),
  {
    code: "sidebar-content-text-overflow",
    itemId: "nav-long",
    message: "Текст не помещается. Увеличьте кнопку, сайдбар или уменьшите шрифт.",
    severity: "warning"
  }
);

const sidebarContentOperationItems = resolveSidebarContentOperationItems({
  items: [
    {
      id: "sidebar-a",
      meta: {
        blockType: "sidebar",
        sidebar: {
          state: "fixed"
        }
      }
    },
    {
      id: "content-a",
      meta: {
        blockType: "content"
      }
    }
  ],
  sidebarItem: {
    id: "sidebar-a",
    meta: {
      blockType: "sidebar",
      sidebar: {
        content: {
          grid: {
            columns: 4,
            rows: 4
          },
          items: [
            {
              id: "nav-layout",
              x: 1,
              y: 1,
              w: 4,
              h: 1,
              text: "Layout"
            }
          ]
        }
      }
    }
  }
});

assert.equal(sidebarContentOperationItems[1].id, "content-a");
assert.equal(sidebarContentOperationItems[0].meta.sidebar.state, "fixed");
assert.equal(sidebarContentOperationItems[0].meta.sidebar.content.items[0].id, "nav-layout");

assert.equal(
  isAreaOperationMenuTargetForItem(createAreaOperationMenuTarget("content-a"), { id: "content-a" }),
  true
);

assert.equal(
  isAreaOperationMenuTargetForItem(
    createSidebarContentOperationMenuTarget({
      sidebarItemId: "sidebar-a",
      contentItemId: "nav-layout"
    }),
    { id: "sidebar-a" }
  ),
  false
);

console.log("operation menu interaction tests passed");

function createTarget(interactive) {
  return {
    closest() {
      return interactive ? {} : null;
    }
  };
}
