import assert from "node:assert/strict";

import { resolveSidebarContentOperationItems } from "./resolveSidebarContentOperationItems.js";

const explicitContent = {
  grid: { columns: 4, rows: 20 },
  items: [
    {
      id: "sidebar-nav-checks",
      x: 1,
      y: 1,
      w: 4,
      h: 1,
      text: "Checks"
    }
  ]
};
const sourceItems = [
  {
    id: "sidebar-1",
    x: 1,
    y: 1,
    w: 4,
    h: 20,
    meta: {
      blockType: "sidebar",
      sidebar: {
        state: "fixed"
      }
    }
  },
  {
    id: "card-1",
    x: 5,
    y: 1,
    w: 2,
    h: 2,
    meta: {
      blockType: "card"
    }
  }
];

const withExplicitContent = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar"
    }
  },
  content: explicitContent
});

assert.notEqual(withExplicitContent, sourceItems);
assert.notEqual(withExplicitContent[0], sourceItems[0]);
assert.equal(withExplicitContent[1], sourceItems[1]);
assert.equal(withExplicitContent[0].meta.blockType, "sidebar");
assert.equal(withExplicitContent[0].meta.sidebar.state, "fixed");
assert.equal(
  withExplicitContent[0].meta.sidebar.content.items[0].id,
  "sidebar-nav-checks"
);
assert.equal(sourceItems[0].meta.sidebar.content, undefined);

const sidebarItemContent = {
  grid: { columns: 2, rows: 2 },
  items: [
    {
      id: "existing-button",
      x: 1,
      y: 1,
      w: 1,
      h: 1,
      text: "Existing"
    }
  ]
};
const withSidebarItemContent = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar",
      sidebar: {
        content: sidebarItemContent
      }
    }
  }
});

assert.equal(
  withSidebarItemContent[0].meta.sidebar.content.items[0].id,
  "existing-button"
);

const withoutContent = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar"
    }
  }
});

assert.equal(withoutContent, sourceItems);

console.log("sidebar content operation source item tests passed");
