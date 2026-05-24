import assert from "node:assert/strict";
import {
  LAYOUT_RELATION_CHILD_KINDS,
  LAYOUT_RELATION_CHILD_ROLES
} from "./layoutRelationContracts.js";
import { resolveLayoutRelationProjection } from "./resolveLayoutRelationProjection.js";

const desktopMetrics = { columns: 64, rows: 32 };
const narrowMetrics = {
  columns: 40,
  rows: 32,
  debug: { horizontalMode: "compact" }
};
const mobileMetrics = {
  columns: 22,
  rows: 32,
  debug: { horizontalMode: "min-limit" }
};

const sourceItems = [
  {
    id: "parent",
    x: 4,
    y: 2,
    w: 20,
    h: 6,
    meta: {
      layoutRelations: {
        version: 1,
        children: [
          { id: "child-b", order: 2, priority: 5 },
          { id: "child-a", order: 1, priority: 5 },
          { id: "child-c", order: 3, priority: 20 },
          { id: "missing-child", order: 4 },
          {
            id: "internal-child",
            kind: LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM,
            order: 1
          }
        ]
      }
    }
  },
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 },
  { id: "child-b", x: 8, y: 20, w: 24, h: 3 },
  { id: "child-c", x: 12, y: 9, w: 30, h: 5 },
  { id: "internal-child", x: 1, y: 1, w: 2, h: 2 },
  { id: "solo", x: 50, y: 1, w: 10, h: 4 }
];

const itemsBefore = structuredClone(sourceItems);

const desktopProjection = resolveLayoutRelationProjection({
  items: sourceItems,
  metrics: desktopMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(
  desktopProjection.map((item) => pickGeometry(item)),
  sourceItems.map((item) => pickGeometry(item))
);

const narrowProjection = resolveLayoutRelationProjection({
  items: sourceItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

const narrowById = mapById(narrowProjection);

assert.deepEqual(pickGeometry(narrowById.parent), pickGeometry(sourceItems[0]));
assert.deepEqual(pickGeometry(narrowById["child-c"]), {
  x: 4,
  y: 9,
  w: 30,
  h: 5
});
assert.deepEqual(pickGeometry(narrowById["child-a"]), {
  x: 4,
  y: 15,
  w: 18,
  h: 4
});
assert.deepEqual(pickGeometry(narrowById["child-b"]), {
  x: 4,
  y: 20,
  w: 24,
  h: 3
});
assert.deepEqual(pickGeometry(narrowById["internal-child"]), pickGeometry(sourceItems[4]));
assert.deepEqual(pickGeometry(narrowById.solo), pickGeometry(sourceItems[5]));

const manualParentItems = [
  {
    id: "parent",
    x: 2,
    y: 1,
    w: 12,
    h: 4,
    meta: {
      layoutRelations: {
        children: [
          {
            id: "child-manual",
            manualAreas: {
              narrow: { x: 5, y: 7, w: 50, h: 2 },
              mobile: { x: 3, y: 8, w: 8, h: 2 }
            }
          }
        ]
      }
    }
  },
  { id: "child-manual", x: 20, y: 20, w: 10, h: 6 }
];

const narrowManual = resolveLayoutRelationProjection({
  items: manualParentItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(mapById(narrowManual)["child-manual"]), {
  x: 5,
  y: 7,
  w: 36,
  h: 2
});

const mobileManual = resolveLayoutRelationProjection({
  items: manualParentItems,
  metrics: mobileMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(mapById(mobileManual)["child-manual"]), {
  x: 3,
  y: 8,
  w: 8,
  h: 2
});

const widthClampItems = [
  {
    id: "parent",
    x: 18,
    y: 1,
    w: 8,
    h: 3,
    meta: {
      layoutRelations: {
        children: [{ id: "wide-child" }]
      }
    }
  },
  { id: "wide-child", x: 1, y: 10, w: 30, h: 2 }
];

const mobileClamp = resolveLayoutRelationProjection({
  items: widthClampItems,
  metrics: mobileMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(mapById(mobileClamp)["wide-child"]), {
  x: 18,
  y: 5,
  w: 5,
  h: 2
});

const duplicateParentItems = [
  {
    id: "parent-a",
    x: 1,
    y: 1,
    w: 10,
    h: 2,
    meta: {
      layoutRelations: {
        children: [{ id: "shared-child" }]
      }
    }
  },
  {
    id: "parent-b",
    x: 20,
    y: 1,
    w: 10,
    h: 2,
    meta: {
      layoutRelations: {
        children: [{ id: "shared-child" }]
      }
    }
  },
  { id: "shared-child", x: 30, y: 20, w: 8, h: 2 }
];

const duplicateParentProjection = resolveLayoutRelationProjection({
  items: duplicateParentItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(mapById(duplicateParentProjection)["shared-child"]), {
  x: 1,
  y: 4,
  w: 8,
  h: 2
});

const selfRelationItems = [
  {
    id: "parent-self",
    x: 3,
    y: 2,
    w: 10,
    h: 3,
    meta: {
      layoutRelations: {
        children: [{ id: "parent-self" }]
      }
    }
  }
];

const selfRelationProjection = resolveLayoutRelationProjection({
  items: selfRelationItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(selfRelationProjection[0]), pickGeometry(selfRelationItems[0]));

assert.deepEqual(sourceItems, itemsBefore);

const roleOrderItems = [
  {
    id: "parent",
    x: 4,
    y: 2,
    w: 20,
    h: 6,
    meta: {
      layoutRelations: {
        children: [
          { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE, order: 1 },
          { id: "action-item", role: LAYOUT_RELATION_CHILD_ROLES.ACTION, order: 2 },
          { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 3 }
        ]
      }
    }
  },
  { id: "aside-item", x: 10, y: 12, w: 8, h: 3 },
  { id: "action-item", x: 12, y: 16, w: 10, h: 3 },
  { id: "content-item", x: 14, y: 20, w: 12, h: 4 }
];
const roleOrderGeometryBefore = roleOrderItems.map((item) => pickGeometry(item));

const desktopRoleOrderProjection = resolveLayoutRelationProjection({
  items: roleOrderItems,
  metrics: desktopMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(
  pickOrderedChildIds(findItem(desktopRoleOrderProjection, "parent")),
  ["aside-item", "action-item", "content-item"]
);
assert.deepEqual(
  desktopRoleOrderProjection.map((item) => pickGeometry(item)),
  roleOrderGeometryBefore
);

const narrowRoleOrderProjection = resolveLayoutRelationProjection({
  items: roleOrderItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(
  pickOrderedChildIds(findItem(narrowRoleOrderProjection, "parent")),
  ["content-item", "action-item", "aside-item"]
);

const mobileRoleOrderProjection = resolveLayoutRelationProjection({
  items: roleOrderItems,
  metrics: mobileMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(
  pickOrderedChildIds(findItem(mobileRoleOrderProjection, "parent")),
  ["content-item", "action-item", "aside-item"]
);

const narrowRoleById = mapById(narrowRoleOrderProjection);
const mobileRoleById = mapById(mobileRoleOrderProjection);

assert.ok(narrowRoleById["content-item"].y < narrowRoleById["action-item"].y);
assert.ok(narrowRoleById["action-item"].y < narrowRoleById["aside-item"].y);
assert.ok(mobileRoleById["content-item"].y < mobileRoleById["action-item"].y);
assert.ok(mobileRoleById["action-item"].y < mobileRoleById["aside-item"].y);
assert.deepEqual(pickGeometry(narrowRoleById["content-item"]), {
  x: 4,
  y: 9,
  w: 12,
  h: 4
});
assert.deepEqual(pickGeometry(narrowRoleById["action-item"]), {
  x: 4,
  y: 14,
  w: 10,
  h: 3
});
assert.deepEqual(pickGeometry(narrowRoleById["aside-item"]), {
  x: 4,
  y: 18,
  w: 8,
  h: 3
});

const manualStackItems = [
  {
    id: "parent",
    x: 2,
    y: 1,
    w: 12,
    h: 4,
    meta: {
      layoutRelations: {
        children: [
          { id: "aside-item", role: LAYOUT_RELATION_CHILD_ROLES.ASIDE, order: 1 },
          {
            id: "action-item",
            role: LAYOUT_RELATION_CHILD_ROLES.ACTION,
            order: 2,
            manualAreas: {
              narrow: { x: 5, y: 10, w: 4, h: 2 }
            }
          },
          { id: "content-item", role: LAYOUT_RELATION_CHILD_ROLES.CONTENT, order: 3 }
        ]
      }
    }
  },
  { id: "aside-item", x: 1, y: 20, w: 8, h: 3 },
  { id: "action-item", x: 2, y: 21, w: 10, h: 3 },
  { id: "content-item", x: 3, y: 22, w: 12, h: 4 }
];

const narrowManualStack = resolveLayoutRelationProjection({
  items: manualStackItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});
const narrowManualStackById = mapById(narrowManualStack);

assert.deepEqual(pickGeometry(narrowManualStackById["action-item"]), {
  x: 5,
  y: 10,
  w: 4,
  h: 2
});
assert.ok(narrowManualStackById["content-item"].y < narrowManualStackById["aside-item"].y);
assert.deepEqual(
  pickOrderedChildIds(findItem(narrowManualStack, "parent")),
  ["content-item", "action-item", "aside-item"]
);

const soloProjection = resolveLayoutRelationProjection({
  items: [{ id: "solo", x: 1, y: 1, w: 4, h: 4 }],
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(soloProjection[0].meta?.layoutRelationProjection, undefined);

const emptyRelationsProjection = resolveLayoutRelationProjection({
  items: [
    {
      id: "parent-empty",
      x: 2,
      y: 2,
      w: 10,
      h: 4,
      meta: {
        layoutRelations: {
          children: []
        }
      }
    }
  ],
  metrics: desktopMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(
  findItem(emptyRelationsProjection, "parent-empty").meta.layoutRelationProjection.orderedChildren,
  []
);

console.log("layout relation projection tests passed");

function pickGeometry(item) {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}

function mapById(items) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function findItem(items, id) {
  return items.find((item) => item.id === id);
}

function pickOrderedChildIds(parentItem) {
  return parentItem.meta.layoutRelationProjection.orderedChildren.map((child) => child.id);
}
