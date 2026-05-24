import assert from "node:assert/strict";
import {
  DEFAULT_LAYOUT_RELATIONS,
  LAYOUT_RELATION_CHILD_KINDS,
  LAYOUT_RELATION_STACK_MODES,
  normalizeLayoutRelations,
  resolveLayoutRelationTree
} from "./index.js";

assert.deepEqual(normalizeLayoutRelations(null), DEFAULT_LAYOUT_RELATIONS);
assert.deepEqual(normalizeLayoutRelations(undefined), DEFAULT_LAYOUT_RELATIONS);
assert.deepEqual(normalizeLayoutRelations("broken"), DEFAULT_LAYOUT_RELATIONS);
assert.deepEqual(normalizeLayoutRelations([]), DEFAULT_LAYOUT_RELATIONS);

const validChild = normalizeLayoutRelations({
  version: 1,
  children: [
    {
      id: "child-a",
      kind: LAYOUT_RELATION_CHILD_KINDS.WORKSPACE_ITEM,
      role: "section",
      priority: 12,
      order: 2,
      stack: LAYOUT_RELATION_STACK_MODES.RIGHT,
      manualAreas: {
        narrow: { x: 2, y: 3, w: 4, h: 5 },
        mobile: { x: 1.9, y: 2.1, w: 3, h: 2 }
      }
    }
  ]
});

assert.equal(validChild.version, 1);
assert.equal(validChild.children.length, 1);
assert.deepEqual(validChild.children[0], {
  id: "child-a",
  kind: LAYOUT_RELATION_CHILD_KINDS.WORKSPACE_ITEM,
  role: "section",
  priority: 12,
  order: 2,
  stack: LAYOUT_RELATION_STACK_MODES.RIGHT,
  manualAreas: {
    narrow: { x: 2, y: 3, w: 4, h: 5 },
    mobile: { x: 2, y: 2, w: 3, h: 2 }
  }
});

const droppedMissingId = normalizeLayoutRelations({
  children: [{ id: "  ", kind: "workspace-item" }, { id: "keep-me" }]
});

assert.equal(droppedMissingId.children.length, 1);
assert.equal(droppedMissingId.children[0].id, "keep-me");

const unknownKind = normalizeLayoutRelations({
  children: [{ id: "child-b", kind: "unknown-kind" }]
});

assert.equal(
  unknownKind.children[0].kind,
  LAYOUT_RELATION_CHILD_KINDS.WORKSPACE_ITEM
);

const priorityClamp = normalizeLayoutRelations({
  children: [
    { id: "low", priority: 0 },
    { id: "high", priority: 99 },
    { id: "default", priority: "broken" }
  ]
});

assert.equal(priorityClamp.children[0].priority, 1);
assert.equal(priorityClamp.children[1].priority, 20);
assert.equal(priorityClamp.children[2].priority, 10);

const orderNormalize = normalizeLayoutRelations({
  children: [
    { id: "first" },
    { id: "second", order: 5 },
    { id: "third", order: 0 }
  ]
});

assert.equal(orderNormalize.children[0].order, 1);
assert.equal(orderNormalize.children[1].order, 5);
assert.equal(orderNormalize.children[2].order, 3);

const stackFallback = normalizeLayoutRelations({
  children: [{ id: "child-c", stack: "diagonal" }]
});

assert.equal(
  stackFallback.children[0].stack,
  LAYOUT_RELATION_STACK_MODES.BELOW
);

const manualAreasNormalize = normalizeLayoutRelations({
  children: [
    {
      id: "child-d",
      manualAreas: {
        narrow: { x: 0, y: 1, w: 2, h: 2 },
        mobile: { x: 1, y: 1, w: 1, h: 1 }
      }
    }
  ]
});

assert.equal(manualAreasNormalize.children[0].manualAreas.narrow, null);
assert.deepEqual(manualAreasNormalize.children[0].manualAreas.mobile, {
  x: 1,
  y: 1,
  w: 1,
  h: 1
});

const parentItem = {
  id: "parent",
  x: 1,
  y: 1,
  w: 10,
  h: 8,
  meta: {
    layoutRelations: {
      version: 1,
      children: [
        { id: "child-a", order: 1 },
        { id: "missing-child", order: 2 }
      ]
    }
  }
};
const childItem = {
  id: "child-a",
  x: 2,
  y: 10,
  w: 8,
  h: 4
};
const items = [parentItem, childItem];
const itemsBefore = structuredClone(items);

const tree = resolveLayoutRelationTree(items);

assert.equal(tree.parents.length, 1);
assert.equal(tree.parents[0].parentId, "parent");
assert.equal(tree.parents[0].parentItem, parentItem);
assert.equal(tree.parents[0].resolvedChildren.length, 1);
assert.equal(tree.parents[0].resolvedChildren[0], childItem);
assert.equal(tree.parents[0].unresolvedChildren.length, 1);
assert.equal(tree.parents[0].unresolvedChildren[0].id, "missing-child");
assert.deepEqual(tree.childToParent, {
  "child-a": "parent",
  "missing-child": "parent"
});

const dependenciesOnlyItem = {
  id: "solo",
  meta: {
    dependencies: ["other"],
    dependsOn: ["legacy"],
    linkedTo: ["legacy-link"]
  }
};

assert.deepEqual(resolveLayoutRelationTree([dependenciesOnlyItem]), {
  parents: [],
  childToParent: {}
});

assert.deepEqual(items, itemsBefore);

console.log("layout relation contract tests passed");
