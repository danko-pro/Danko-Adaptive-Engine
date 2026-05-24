import assert from "node:assert/strict";
import { LAYOUT_RELATION_CHILD_ROLES } from "./layoutRelationContracts.js";
import { resolveLayoutRelationChildOrder } from "./resolveLayoutRelationChildOrder.js";

assert.deepEqual(resolveLayoutRelationChildOrder(null), []);
assert.deepEqual(resolveLayoutRelationChildOrder(undefined), []);
assert.deepEqual(resolveLayoutRelationChildOrder("broken"), []);
assert.deepEqual(resolveLayoutRelationChildOrder([]), []);

const roleOrderInput = [
  { id: "child-fallback", role: LAYOUT_RELATION_CHILD_ROLES.CHILD },
  { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE },
  { id: "details-item", role: LAYOUT_RELATION_CHILD_ROLES.DETAILS },
  { id: "warning-item", role: LAYOUT_RELATION_CHILD_ROLES.WARNING },
  { id: "control-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTROL },
  { id: "action-item", role: LAYOUT_RELATION_CHILD_ROLES.ACTION },
  { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT }
];

assert.deepEqual(
  resolveLayoutRelationChildOrder(roleOrderInput).map((child) => child.id),
  [
    "content-item",
    "action-item",
    "control-item",
    "warning-item",
    "details-item",
    "aside-item",
    "child-fallback"
  ]
);

const priorityInput = [
  { id: "content-low", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, priority: 10 },
  { id: "content-high", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, priority: 20 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrder(priorityInput).map((child) => child.id),
  ["content-high", "content-low"]
);

const orderInput = [
  {
    id: "content-second",
    role: LAYOUT_RELATION_CHILD_ROLES.CONTENT,
    priority: 10,
    order: 2
  },
  {
    id: "content-first",
    role: LAYOUT_RELATION_CHILD_ROLES.CONTENT,
    priority: 10,
    order: 1
  }
];

assert.deepEqual(
  resolveLayoutRelationChildOrder(orderInput).map((child) => child.id),
  ["content-first", "content-second"]
);

const defaultOrderInput = [
  {
    id: "content-second",
    role: LAYOUT_RELATION_CHILD_ROLES.CONTENT,
    order: 2
  },
  { id: "content-third", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT },
  { id: "content-first", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 1 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrder(defaultOrderInput).map((child) => child.id),
  ["content-first", "content-second", "content-third"]
);

const stableIndexInput = [
  { id: "content-a", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, priority: 10, order: 1 },
  { id: "content-b", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, priority: 10, order: 1 },
  { id: "content-c", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, priority: 10, order: 1 }
];

assert.deepEqual(
  resolveLayoutRelationChildOrder(stableIndexInput).map((child) => child.id),
  ["content-a", "content-b", "content-c"]
);

const unknownRoleInput = [{ id: "unknown-role", role: "section" }, { id: "child-role", role: LAYOUT_RELATION_CHILD_ROLES.CHILD }];

assert.equal(resolveLayoutRelationChildOrder(unknownRoleInput)[0].role, LAYOUT_RELATION_CHILD_ROLES.CHILD);
assert.equal(resolveLayoutRelationChildOrder(unknownRoleInput)[0].id, "unknown-role");
assert.equal(resolveLayoutRelationChildOrder(unknownRoleInput)[1].id, "child-role");

const mutableInput = [
  { id: "action-item", role: LAYOUT_RELATION_CHILD_ROLES.ACTION },
  { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT }
];
const inputBefore = structuredClone(mutableInput);

resolveLayoutRelationChildOrder(mutableInput);

assert.deepEqual(mutableInput, inputBefore);

const reverseInput = structuredClone(roleOrderInput);

assert.deepEqual(
  resolveLayoutRelationChildOrder(reverseInput, { direction: "reverse" }).map((child) => child.id),
  [
    "child-fallback",
    "aside-item",
    "details-item",
    "warning-item",
    "control-item",
    "action-item",
    "content-item"
  ]
);

assert.deepEqual(
  resolveLayoutRelationChildOrder(reverseInput, { direction: "unknown" }).map((child) => child.id),
  [
    "content-item",
    "action-item",
    "control-item",
    "warning-item",
    "details-item",
    "aside-item",
    "child-fallback"
  ]
);

const invalidChildrenInput = [{ id: "  " }, null, "broken", { id: "keep-me", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT }];

assert.deepEqual(resolveLayoutRelationChildOrder(invalidChildrenInput).map((child) => child.id), ["keep-me"]);

console.log("layout relation child order tests passed");
