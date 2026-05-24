import assert from "node:assert/strict";
import { applySidebarContentItemCommand } from "../commands/applySidebarContentItemCommand.js";
import { SIDEBAR_CONTENT_GEOMETRY_TARGETS } from "../contracts/sidebarContentGeometryTarget.js";
import {
  resolveMobileIconStripContent,
  resolveMobileIconStripViewportGrid
} from "../render/resolveMobileIconStripContent.js";

assert.deepEqual(
  resolveMobileIconStripViewportGrid({ x: 1, y: 1, w: 12, h: 2 }),
  { columns: 12, rows: 2 }
);

const desktopContent = {
  grid: { columns: 4, rows: 20 },
  items: [
    { id: "a", x: 1, y: 8, w: 1, h: 1, text: "A" },
    { id: "b", x: 2, y: 3, w: 1, h: 1, text: "B" },
    { id: "c", x: 3, y: 15, w: 1, h: 1, text: "C" }
  ]
};
const viewportArea = { x: 1, y: 1, w: 12, h: 2 };

const autoPacked = resolveMobileIconStripContent(
  desktopContent,
  viewportArea,
  { iconStrip: { itemsById: {} } }
);

assert.deepEqual(autoPacked.grid, { columns: 12, rows: 2 });
assert.deepEqual(pickGeometry(autoPacked.items[0]), { id: "a", x: 1, y: 1, w: 1, h: 1 });
assert.deepEqual(pickGeometry(autoPacked.items[1]), { id: "b", x: 2, y: 1, w: 1, h: 1 });
assert.deepEqual(pickGeometry(autoPacked.items[2]), { id: "c", x: 3, y: 1, w: 1, h: 1 });

const savedStrip = resolveMobileIconStripContent(
  desktopContent,
  viewportArea,
  {
    iconStrip: {
      itemsById: {
        a: { x: 5, y: 1, w: 2, h: 1 }
      }
    }
  }
);

assert.deepEqual(pickGeometry(savedStrip.items[0]), { id: "a", x: 5, y: 1, w: 2, h: 1 });

const sidebarItem = {
  id: "sidebar-a",
  x: 1,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      expandedArea: { x: 1, y: 1, w: 4, h: 8 },
      content: desktopContent,
      mobileLayout: {
        iconStrip: { itemsById: {} }
      }
    }
  }
};

const stripMove = applySidebarContentItemCommand({
  item: sidebarItem,
  contentItemId: "a",
  patch: { x: 6, y: 1, w: 1, h: 1 },
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  viewportArea
});

assert.equal(stripMove.valid, true);
assert.deepEqual(pickGeometry(stripMove.item.meta.sidebar.content.items[0]), {
  id: "a",
  x: 1,
  y: 8,
  w: 1,
  h: 1
});
assert.equal(stripMove.item.meta.sidebar.content.items[0].text, "A");
assert.deepEqual(stripMove.item.meta.sidebar.mobileLayout.iconStrip.itemsById.a, {
  x: 6,
  y: 1,
  w: 1,
  h: 1
});
assert.deepEqual(stripMove.item.meta.sidebar.expandedArea, { x: 1, y: 1, w: 4, h: 8 });
assertNoIconStripPollution({
  before: sidebarItem.meta.sidebar,
  after: stripMove.item.meta.sidebar,
  contentItemId: "a",
  expectedIconStripGeometry: { x: 6, y: 1, w: 1, h: 1 }
});

const navLayoutSidebar = {
  id: "sidebar-b",
  x: 1,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      expandedArea: { x: 1, y: 1, w: 4, h: 8 },
      content: {
        grid: { columns: 4, rows: 20 },
        items: [
          {
            id: "nav-layout",
            x: 1,
            y: 8,
            w: 1,
            h: 1,
            text: "Layout"
          }
        ]
      },
      mobileLayout: {
        compactButtonArea: { x: 11, y: 1, w: 2, h: 2 },
        iconStrip: { itemsById: {} }
      }
    }
  }
};
const navLayoutStripMove = applySidebarContentItemCommand({
  item: navLayoutSidebar,
  contentItemId: "nav-layout",
  patch: { x: 6, y: 1, w: 2, h: 1 },
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  viewportArea
});

assert.equal(navLayoutStripMove.valid, true);
assertNoIconStripPollution({
  before: navLayoutSidebar.meta.sidebar,
  after: navLayoutStripMove.item.meta.sidebar,
  contentItemId: "nav-layout",
  expectedIconStripGeometry: { x: 6, y: 1, w: 2, h: 1 },
  expectedDesktopGeometry: { x: 1, y: 8, w: 1, h: 1 }
});

const generatedNavSidebar = {
  id: "sidebar-a",
  x: 1,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      expandedArea: { x: 1, y: 1, w: 4, h: 8 },
      content: {
        grid: { columns: 4, rows: 20 },
        items: []
      },
      mobileLayout: {
        iconStrip: { itemsById: {} }
      }
    }
  }
};
const generatedNavContent = {
  grid: { columns: 4, rows: 20 },
  items: [
    {
      id: "nav-checks",
      x: 1,
      y: 3,
      w: 4,
      h: 1,
      text: "Checks",
      action: {
        type: "select-page",
        pageId: "checks-page"
      }
    }
  ]
};
const renderedGeneratedStrip = resolveMobileIconStripContent(
  generatedNavContent,
  viewportArea,
  { iconStrip: { itemsById: {} } }
);
const operationSidebarItem = {
  ...generatedNavSidebar,
  meta: {
    ...generatedNavSidebar.meta,
    sidebar: {
      ...generatedNavSidebar.meta.sidebar,
      content: {
        grid: { columns: 4, rows: 20 },
        items: [
          {
            id: "nav-checks",
            x: 1,
            y: 1,
            w: 1,
            h: 1,
            text: "Checks",
            action: {
              type: "select-page",
              pageId: "checks-page"
            }
          }
        ]
      }
    }
  }
};

const generatedStripMove = applySidebarContentItemCommand({
  item: operationSidebarItem,
  contentItemId: "nav-checks",
  patch: { x: 6, y: 1, w: 2, h: 1 },
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  viewportArea
});

assert.equal(generatedStripMove.valid, true);
assert.deepEqual(
  pickGeometry(generatedStripMove.item.meta.sidebar.content.items[0]),
  { id: "nav-checks", x: 1, y: 1, w: 1, h: 1 }
);
assert.equal(
  generatedStripMove.item.meta.sidebar.content.items[0].action.pageId,
  "checks-page"
);
assert.deepEqual(generatedStripMove.item.meta.sidebar.mobileLayout.iconStrip.itemsById["nav-checks"], {
  x: 6,
  y: 1,
  w: 2,
  h: 1
});
assert.deepEqual(
  generatedStripMove.item.meta.sidebar.expandedArea,
  { x: 1, y: 1, w: 4, h: 8 }
);
assert.equal(
  generatedStripMove.item.meta.sidebar.content.items[0].action.type,
  "select-page"
);
assertNoIconStripPollution({
  before: operationSidebarItem.meta.sidebar,
  after: generatedStripMove.item.meta.sidebar,
  contentItemId: "nav-checks",
  expectedIconStripGeometry: { x: 6, y: 1, w: 2, h: 1 },
  expectedDesktopGeometry: { x: 1, y: 1, w: 1, h: 1 }
});
assert.equal(renderedGeneratedStrip.items[0].x, 1);

console.log("mobile icon strip content tests passed");

function pickGeometry(item) {
  return {
    id: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}

function assertNoIconStripPollution({
  before,
  after,
  contentItemId,
  expectedIconStripGeometry,
  expectedDesktopGeometry = null
}) {
  const beforeItem = before.content.items.find((item) => item.id === contentItemId);
  const afterItem = after.content.items.find((item) => item.id === contentItemId);

  assert.deepEqual(after.content.grid, before.content.grid);
  assert.deepEqual(after.expandedArea, before.expandedArea);

  if (before.mobileLayout?.compactButtonArea !== undefined) {
    assert.deepEqual(after.mobileLayout?.compactButtonArea, before.mobileLayout.compactButtonArea);
  }
  assert.deepEqual(
    after.mobileLayout.iconStrip.itemsById[contentItemId],
    expectedIconStripGeometry
  );

  if (expectedDesktopGeometry) {
    assert.deepEqual(pickGeometry(afterItem), {
      id: contentItemId,
      ...expectedDesktopGeometry
    });
    return;
  }

  assert.deepEqual(pickGeometry(afterItem), pickGeometry(beforeItem));
}
