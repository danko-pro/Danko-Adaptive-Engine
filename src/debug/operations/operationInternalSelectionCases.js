import assert from "node:assert/strict";
import { SELECTION_TYPES } from "../../../engine-adapter/index.js";
import {
  OPERATION_INTERNAL_SELECTION_TYPES,
  createSidebarContentItemSelection,
  formatSidebarContentItemSelection,
  isSelectedSidebarContentItem,
  isSidebarContentItemSelection
} from "./operationInternalSelection.js";
import { formatSelection, isSelectedItem } from "./operationProbeUtils.js";
import {
  handleSidebarContentKeyboardBoundary,
  handleSidebarContentPointerBoundary,
  shouldActivateSidebarContentByKeyboard,
  shouldActivateSidebarContentByPointer,
  stopSidebarContentBoundaryEvent
} from "./operationSidebarContentEventBoundary.js";
import {
  createSidebarContentItemPointerInteraction,
  createSidebarContentItemPointerMove,
  SIDEBAR_CONTENT_POINTER_TYPES,
  resolveSidebarContentPointerCell
} from "./sidebarContentItemPointerOperation.js";

const sidebarItem = {
  id: "sidebar-a",
  meta: {
    blockType: "sidebar"
  }
};
const contentItem = {
  id: "nav-layout",
  text: "Раскладка"
};

const selection = createSidebarContentItemSelection({
  sidebarItem,
  contentItem
});

assert.deepEqual(selection, {
  type: OPERATION_INTERNAL_SELECTION_TYPES.SIDEBAR_CONTENT_ITEM,
  sidebarItemId: "sidebar-a",
  contentItemId: "nav-layout",
  sidebarItem,
  contentItem
});

assert.equal(isSidebarContentItemSelection(selection), true);
assert.equal(isSidebarContentItemSelection({ type: SELECTION_TYPES.AREA }), false);

assert.equal(
  isSelectedSidebarContentItem(selection, {
    sidebarItem,
    contentItem
  }),
  true
);

assert.equal(
  isSelectedSidebarContentItem(selection, {
    sidebarItem,
    contentItem: { id: "nav-content" }
  }),
  false
);

assert.equal(isSelectedItem(selection, sidebarItem), false);
assert.equal(
  formatSidebarContentItemSelection(selection),
  "sidebar sidebar-a · кнопка Раскладка · id: nav-layout"
);
assert.equal(
  formatSelection(selection),
  "выбор: sidebar sidebar-a · кнопка Раскладка · id: nav-layout"
);

assert.equal(
  createSidebarContentItemSelection({
    sidebarItem,
    contentItem: null
  }),
  null
);

assert.equal(shouldActivateSidebarContentByPointer({ button: 0 }), true);
assert.equal(shouldActivateSidebarContentByPointer({ button: 2 }), false);
assert.equal(shouldActivateSidebarContentByKeyboard({ key: "Enter" }), true);
assert.equal(shouldActivateSidebarContentByKeyboard({ key: " " }), true);
assert.equal(shouldActivateSidebarContentByKeyboard({ key: "Escape" }), false);

const stoppedEvent = createEvent();
stopSidebarContentBoundaryEvent(stoppedEvent);
assert.deepEqual(stoppedEvent.calls, ["preventDefault", "stopPropagation"]);

const pointerEvent = createEvent({ button: 0 });
const pointerSelections = [];
assert.equal(
  handleSidebarContentPointerBoundary({
    event: pointerEvent,
    sidebarItem,
    contentItem,
    onSelectItem(event, currentSidebarItem, currentContentItem) {
      pointerSelections.push({
        event,
        sidebarItemId: currentSidebarItem.id,
        contentItemId: currentContentItem.id
      });
    }
  }),
  true
);
assert.deepEqual(pointerEvent.calls, ["preventDefault", "stopPropagation"]);
assert.deepEqual(pointerSelections.map((item) => [item.sidebarItemId, item.contentItemId]), [
  ["sidebar-a", "nav-layout"]
]);

const secondaryPointerEvent = createEvent({ button: 2 });
assert.equal(
  handleSidebarContentPointerBoundary({
    event: secondaryPointerEvent,
    sidebarItem,
    contentItem,
    onSelectItem() {
      throw new Error("secondary pointer must not select sidebar content item");
    }
  }),
  false
);
assert.deepEqual(secondaryPointerEvent.calls, ["preventDefault", "stopPropagation"]);

const keyboardEvent = createEvent({ key: "Enter" });
const keyboardSelections = [];
assert.equal(
  handleSidebarContentKeyboardBoundary({
    event: keyboardEvent,
    sidebarItem,
    contentItem,
    onSelectItem(event, currentSidebarItem, currentContentItem) {
      keyboardSelections.push({
        event,
        sidebarItemId: currentSidebarItem.id,
        contentItemId: currentContentItem.id
      });
    }
  }),
  true
);
assert.deepEqual(keyboardEvent.calls, ["preventDefault", "stopPropagation"]);
assert.deepEqual(keyboardSelections.map((item) => [item.sidebarItemId, item.contentItemId]), [
  ["sidebar-a", "nav-layout"]
]);

const escapeEvent = createEvent({ key: "Escape" });
assert.equal(
  handleSidebarContentKeyboardBoundary({
    event: escapeEvent,
    sidebarItem,
    contentItem,
    onSelectItem() {
      throw new Error("Escape must not select sidebar content item");
    }
  }),
  false
);
assert.deepEqual(escapeEvent.calls, []);

const gridElement = createGridElement({
  left: 0,
  top: 0,
  width: 80,
  height: 80
});
const pointerContent = {
  grid: {
    columns: 4,
    rows: 4
  },
  items: []
};

assert.deepEqual(
  resolveSidebarContentPointerCell({
    clientX: 39,
    clientY: 41,
    content: pointerContent,
    metrics: { cellSize: 20 },
    gridElement
  }),
  { x: 2, y: 3 }
);
assert.equal(
  resolveSidebarContentPointerCell({
    clientX: 99,
    clientY: 41,
    content: pointerContent,
    metrics: { cellSize: 20 },
    gridElement
  }),
  null
);
assert.deepEqual(
  resolveSidebarContentPointerCell({
    clientX: 79,
    clientY: 21,
    content: pointerContent,
    metrics: { cellSize: 20 },
    gridElement: createGridElement({
      left: 0,
      top: 0,
      width: 160,
      height: 80
    })
  }),
  { x: 4, y: 2 }
);
assert.equal(
  resolveSidebarContentPointerCell({
    clientX: 81,
    clientY: 21,
    content: pointerContent,
    metrics: { cellSize: 20 },
    gridElement: createGridElement({
      left: 0,
      top: 0,
      width: 160,
      height: 80
    })
  }),
  null
);

const pointerInteraction = createSidebarContentItemPointerInteraction({
  event: createPointerEvent({
    currentTarget: createPointerTarget(gridElement),
    clientX: 5,
    clientY: 5,
    pointerId: 7
  }),
  sidebarItem,
  contentItem: {
    id: "nav-layout",
    x: 1,
    y: 1,
    w: 1,
    h: 1
  },
  content: pointerContent,
  sourceItems: [sidebarItem],
  metrics: { cellSize: 20 }
});

assert.equal(pointerInteraction.pointerId, 7);
assert.deepEqual(pointerInteraction.startCell, { x: 1, y: 1 });
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(gridElement),
      clientX: 65,
      clientY: 45,
      pointerId: 7
    }),
    interaction: pointerInteraction
  })?.area,
  { x: 4, y: 3, w: 1, h: 1 }
);
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(gridElement),
      clientX: 200,
      clientY: 200,
      pointerId: 7
    }),
    interaction: pointerInteraction
  }),
  null
);

assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(gridElement),
      clientX: 5,
      clientY: 5,
      pointerId: 7
    }),
    interaction: pointerInteraction
  })?.area,
  { x: 1, y: 1, w: 1, h: 1 }
);

const resizeInteraction = createSidebarContentItemPointerInteraction({
  event: createPointerEvent({
    currentTarget: createPointerTarget(gridElement),
    clientX: 39,
    clientY: 39,
    pointerId: 8
  }),
  type: SIDEBAR_CONTENT_POINTER_TYPES.RESIZE,
  handle: "se",
  sidebarItem,
  contentItem: {
    id: "nav-layout",
    x: 1,
    y: 1,
    w: 2,
    h: 2
  },
  content: pointerContent,
  sourceItems: [sidebarItem],
  metrics: { cellSize: 20 }
});

assert.equal(resizeInteraction.type, SIDEBAR_CONTENT_POINTER_TYPES.RESIZE);
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: createPointerEvent({
      currentTarget: createPointerTarget(gridElement),
      clientX: 65,
      clientY: 65,
      pointerId: 8
    }),
    interaction: resizeInteraction
  })?.area,
  { x: 1, y: 1, w: 4, h: 4 }
);

console.log("operation internal selection tests passed");

function createEvent({ button = 0, key = "" } = {}) {
  return {
    button,
    key,
    calls: [],
    preventDefault() {
      this.calls.push("preventDefault");
    },
    stopPropagation() {
      this.calls.push("stopPropagation");
    }
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

function createPointerTarget(gridElement) {
  return {
    closest(selector) {
      return selector === ".grid-operation-sidebar-content" ? gridElement : null;
    }
  };
}

function createGridElement({ left, top, width, height }) {
  return {
    getBoundingClientRect() {
      return {
        left,
        top,
        width,
        height
      };
    }
  };
}
