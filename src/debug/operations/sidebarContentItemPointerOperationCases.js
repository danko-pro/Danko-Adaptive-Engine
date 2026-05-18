import assert from "node:assert/strict";

import {
  createSidebarContentItemPointerMove,
  resolveSidebarContentPointerCell,
  SIDEBAR_CONTENT_POINTER_TYPES
} from "./sidebarContentItemPointerOperation.js";

const content = {
  grid: {
    columns: 4,
    rows: 20
  }
};
const gridElement = createFakeGridElement({
  left: 100,
  top: 50,
  width: 200,
  height: 400
});

assert.deepEqual(
  resolveSidebarContentPointerCell({
    clientX: 125,
    clientY: 60,
    content,
    gridElement
  }),
  { x: 1, y: 1 }
);
assert.deepEqual(
  resolveSidebarContentPointerCell({
    clientX: 175,
    clientY: 60,
    content,
    metrics: { cellSize: 30 },
    gridElement
  }),
  { x: 2, y: 1 }
);
assert.deepEqual(
  resolveSidebarContentPointerCell({
    clientX: 125,
    clientY: 90,
    content,
    gridElement
  }),
  { x: 1, y: 3 }
);
assert.equal(
  resolveSidebarContentPointerCell({ clientX: 99, clientY: 60, content, gridElement }),
  null
);
assert.equal(
  resolveSidebarContentPointerCell({ clientX: 125, clientY: 49, content, gridElement }),
  null
);
assert.equal(
  resolveSidebarContentPointerCell({ clientX: 300, clientY: 60, content, gridElement }),
  null
);
assert.equal(
  resolveSidebarContentPointerCell({ clientX: 125, clientY: 450, content, gridElement }),
  null
);

const startItem = { id: "btn-1", x: 1, y: 1, w: 1, h: 1 };

assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: { clientX: 175, clientY: 60 },
    interaction: createMoveInteraction({
      content,
      gridElement,
      startCell: { x: 1, y: 1 },
      startItem
    })
  })?.area,
  { x: 2, y: 1, w: 1, h: 1 }
);
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: { clientX: 125, clientY: 90 },
    interaction: createMoveInteraction({
      content,
      gridElement,
      startCell: { x: 1, y: 1 },
      startItem
    })
  })?.area,
  { x: 1, y: 3, w: 1, h: 1 }
);
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: { clientX: 275, clientY: 115 },
    interaction: createMoveInteraction({
      content: { grid: { columns: 4, rows: 4 } },
      gridElement: createFakeGridElement({
        left: 100,
        top: 50,
        width: 200,
        height: 80
      }),
      startCell: { x: 3, y: 3 },
      startItem: { x: 3, y: 3, w: 2, h: 2 }
    })
  })?.area,
  { x: 3, y: 3, w: 2, h: 2 }
);

assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: { clientX: 225, clientY: 60 },
    interaction: createResizeInteraction({
      content,
      gridElement,
      startItem: { x: 1, y: 1, w: 2, h: 2 },
      handle: "e"
    })
  })?.area,
  { x: 1, y: 1, w: 3, h: 2 }
);
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: { clientX: 125, clientY: 115 },
    interaction: createResizeInteraction({
      content,
      gridElement,
      startItem: { x: 1, y: 1, w: 2, h: 2 },
      handle: "s"
    })
  })?.area,
  { x: 1, y: 1, w: 2, h: 4 }
);
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: { clientX: 125, clientY: 60 },
    interaction: createResizeInteraction({
      content,
      gridElement,
      startItem: { x: 2, y: 2, w: 2, h: 2 },
      handle: "w"
    })
  })?.area,
  { x: 1, y: 2, w: 3, h: 2 }
);
assert.deepEqual(
  createSidebarContentItemPointerMove({
    event: { clientX: 125, clientY: 60 },
    interaction: createResizeInteraction({
      content,
      gridElement,
      startItem: { x: 2, y: 2, w: 2, h: 2 },
      handle: "n"
    })
  })?.area,
  { x: 2, y: 1, w: 2, h: 3 }
);

console.log("sidebar content item pointer operation tests passed");

function createMoveInteraction({
  content,
  gridElement,
  startCell,
  startItem
}) {
  return {
    type: SIDEBAR_CONTENT_POINTER_TYPES.MOVE,
    gridElement,
    sidebarItem: { id: "sidebar-1" },
    content,
    startCell,
    startItem
  };
}

function createResizeInteraction({
  content,
  gridElement,
  startItem,
  handle
}) {
  return {
    type: SIDEBAR_CONTENT_POINTER_TYPES.RESIZE,
    handle,
    gridElement,
    sidebarItem: { id: "sidebar-1" },
    content,
    startCell: { x: startItem.x, y: startItem.y },
    startItem
  };
}

function createFakeGridElement(rect) {
  return {
    getBoundingClientRect() {
      return rect;
    }
  };
}
