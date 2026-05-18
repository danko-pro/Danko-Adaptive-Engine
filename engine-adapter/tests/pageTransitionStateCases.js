import assert from "node:assert/strict";
import {
  DEFAULT_PAGE_TRANSITION,
  PAGE_TRANSITION_DIRECTIONS,
  PAGE_TRANSITION_TYPES,
  createPageTransitionSnapshot,
  normalizePageTransitionConfig,
  resolvePageTransitionDirection,
  splitPageTransitionItems
} from "../index.js";

const pages = [
  { id: "layout-page", workspaceId: "layout-workspace" },
  { id: "content-page", workspaceId: "content-workspace" },
  { id: "checks-page", workspaceId: "checks-workspace" }
];

assert.deepEqual(
  normalizePageTransitionConfig({
    type: "bad",
    durationMs: "bad",
    direction: "bad"
  }),
  DEFAULT_PAGE_TRANSITION
);

assert.deepEqual(
  normalizePageTransitionConfig({
    type: PAGE_TRANSITION_TYPES.FADE,
    durationMs: 240.4,
    direction: PAGE_TRANSITION_DIRECTIONS.BACKWARD
  }),
  {
    type: PAGE_TRANSITION_TYPES.FADE,
    durationMs: 240,
    direction: PAGE_TRANSITION_DIRECTIONS.BACKWARD
  }
);

assert.equal(
  resolvePageTransitionDirection({
    fromPageId: "layout-page",
    toPageId: "checks-page",
    pages
  }),
  PAGE_TRANSITION_DIRECTIONS.FORWARD
);

assert.equal(
  resolvePageTransitionDirection({
    fromPageId: "checks-page",
    toPageId: "content-page",
    pages
  }),
  PAGE_TRANSITION_DIRECTIONS.BACKWARD
);

assert.equal(
  resolvePageTransitionDirection({
    fromPageId: "layout-page",
    toPageId: "checks-page",
    pages,
    direction: PAGE_TRANSITION_DIRECTIONS.UP
  }),
  PAGE_TRANSITION_DIRECTIONS.UP
);

assert.deepEqual(
  createPageTransitionSnapshot({
    fromPageId: "layout-page",
    toPageId: "content-page",
    fromWorkspaceId: "layout-workspace",
    toWorkspaceId: "content-workspace",
    pages,
    transition: {
      type: PAGE_TRANSITION_TYPES.SLIDE,
      durationMs: 220,
      direction: PAGE_TRANSITION_DIRECTIONS.AUTO
    }
  }),
  {
    active: true,
    fromPageId: "layout-page",
    toPageId: "content-page",
    fromWorkspaceId: "layout-workspace",
    toWorkspaceId: "content-workspace",
    type: PAGE_TRANSITION_TYPES.SLIDE,
    durationMs: 220,
    direction: PAGE_TRANSITION_DIRECTIONS.FORWARD
  }
);

assert.equal(
  createPageTransitionSnapshot({
    fromPageId: "layout-page",
    toPageId: "layout-page",
    fromWorkspaceId: "layout-workspace",
    toWorkspaceId: "layout-workspace",
    pages
  }).active,
  false
);

assert.equal(
  createPageTransitionSnapshot({
    fromPageId: "layout-page",
    toPageId: "content-page",
    fromWorkspaceId: "layout-workspace",
    toWorkspaceId: "content-workspace",
    pages,
    transition: {
      type: PAGE_TRANSITION_TYPES.NONE,
      durationMs: 220
    }
  }).active,
  false
);

assert.deepEqual(
  splitPageTransitionItems({
    items: [
      { id: "sidebar", meta: { blockType: "sidebar" } },
      { id: "content", meta: { blockType: "content" } }
    ],
    shellItems: [{ id: "sidebar" }]
  }),
  {
    shellItems: [{ id: "sidebar", meta: { blockType: "sidebar" } }],
    workspaceItems: [{ id: "content", meta: { blockType: "content" } }]
  }
);

assert.deepEqual(
  splitPageTransitionItems({
    items: [
      { id: "sidebar", meta: { blockType: "sidebar" } },
      { id: "content", meta: { blockType: "content" } }
    ],
    isShellItem: (item) => item.meta?.blockType === "sidebar"
  }).workspaceItems.map((item) => item.id),
  ["content"]
);

console.log("adapter page transition state tests passed");
