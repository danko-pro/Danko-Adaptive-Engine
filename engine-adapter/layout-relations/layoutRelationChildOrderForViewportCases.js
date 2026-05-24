import assert from "node:assert/strict";
import { LAYOUT_RELATION_CHILD_ROLES } from "./layoutRelationContracts.js";
import { LAYOUT_RELATION_VIEWPORT_MODES } from "./resolveLayoutRelationViewportMode.js";
import { resolveLayoutRelationChildOrderForViewport } from "./resolveLayoutRelationChildOrderForViewport.js";

const roleFirstInput = [
  { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE, order: 1 },
  { id: "action-item", role: LAYOUT_RELATION_CHILD_ROLES.ACTION, order: 2 },
  { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 3 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(roleFirstInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.MOBILE
  }).map((child) => child.id),
  ["content-item", "action-item", "aside-item"]
);

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(roleFirstInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.NARROW
  }).map((child) => child.id),
  ["content-item", "action-item", "aside-item"]
);

const desktopOrderFirstInput = [
  { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 3 },
  { id: "action-item", role: LAYOUT_RELATION_CHILD_ROLES.ACTION, order: 2 },
  { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE, order: 1 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(desktopOrderFirstInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT
  }).map((child) => child.id),
  ["aside-item", "action-item", "content-item"]
);

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(desktopOrderFirstInput, {
    viewportMode: "unknown"
  }).map((child) => child.id),
  ["aside-item", "action-item", "content-item"]
);

const desktopPriorityInput = [
  { id: "content-low", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 1, priority: 10 },
  { id: "content-high", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 1, priority: 20 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(desktopPriorityInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT
  }).map((child) => child.id),
  ["content-high", "content-low"]
);

const desktopRoleTieBreakInput = [
  { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE, order: 1, priority: 10 },
  { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 1, priority: 10 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(desktopRoleTieBreakInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT
  }).map((child) => child.id),
  ["content-item", "aside-item"]
);

const desktopStableIndexInput = [
  { id: "content-a", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 1, priority: 10 },
  { id: "content-b", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 1, priority: 10 },
  { id: "content-c", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 1, priority: 10 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(desktopStableIndexInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT
  }).map((child) => child.id),
  ["content-a", "content-b", "content-c"]
);

const mobileReverseInput = [
  { id: "child-fallback", role: LAYOUT_RELATION_CHILD_ROLES.CHILD },
  { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE },
  { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT }
];

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(mobileReverseInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.MOBILE,
    direction: "reverse"
  }).map((child) => child.id),
  ["child-fallback", "aside-item", "content-item"]
);

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(desktopOrderFirstInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT,
    direction: "reverse"
  }).map((child) => child.id),
  ["aside-item", "action-item", "content-item"]
);

const mutableInput = structuredClone(desktopOrderFirstInput);
const inputBefore = structuredClone(mutableInput);

resolveLayoutRelationChildOrderForViewport(mutableInput, {
  viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT
});

assert.deepEqual(mutableInput, inputBefore);

assert.deepEqual(resolveLayoutRelationChildOrderForViewport(null), []);
assert.deepEqual(resolveLayoutRelationChildOrderForViewport(undefined), []);
assert.deepEqual(resolveLayoutRelationChildOrderForViewport("broken"), []);

const invalidChildrenInput = [{ id: "  " }, null, "broken", { id: "keep-me", order: 1 }];

assert.deepEqual(
  resolveLayoutRelationChildOrderForViewport(invalidChildrenInput, {
    viewportMode: LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT
  }).map((child) => child.id),
  ["keep-me"]
);

console.log("layout relation child order for viewport tests passed");
