import assert from "node:assert/strict";
import {
  DEFAULT_SIDEBAR_MOBILE_LAYOUT,
  clampIconStripBarAreaToMetrics,
  normalizeIconStripBarArea,
  normalizeIconStripItemsById,
  normalizeIconStripLayout,
  normalizeSidebarMobileLayout
} from "../index.js";

assert.deepEqual(DEFAULT_SIDEBAR_MOBILE_LAYOUT, {
  compactBarArea: null,
  compactButtonArea: null,
  iconStrip: {
    barArea: null,
    itemsById: {}
  }
});

assert.equal(normalizeIconStripBarArea(null), null);
assert.equal(normalizeIconStripBarArea({ x: 0, y: 1, w: 2, h: 2 }), null);
assert.deepEqual(
  normalizeIconStripBarArea({ x: 1, y: 1, w: 12, h: 4 }),
  { x: 1, y: 1, w: 12, h: 4 }
);
assert.deepEqual(
  clampIconStripBarAreaToMetrics({ x: 10, y: 1, w: 20, h: 99 }, { columns: 12, rows: 16 }),
  { x: 1, y: 1, w: 12, h: 16 }
);

assert.deepEqual(
  normalizeSidebarMobileLayout({
    compactBarArea: { x: 1, y: 1, w: 12, h: 4 },
    compactButtonArea: { x: 2, y: 1, w: 2, h: 2 },
    iconStrip: {
      barArea: { x: 1, y: 1, w: 12, h: 4 },
      itemsById: {
        "nav-1": { x: 3, y: 1, w: 2, h: 1 }
      }
    }
  }),
  {
    compactBarArea: { x: 1, y: 1, w: 12, h: 4 },
    compactButtonArea: { x: 2, y: 1, w: 2, h: 2 },
    iconStrip: {
      barArea: { x: 1, y: 1, w: 12, h: 4 },
      itemsById: {
        "nav-1": { x: 3, y: 1, w: 2, h: 1 }
      }
    }
  }
);

assert.deepEqual(
  normalizeIconStripItemsById({
    a: { x: 5, y: 1, w: 2, h: 1 }
  }).a,
  { x: 5, y: 1, w: 2, h: 1 }
);

assert.deepEqual(
  normalizeIconStripItemsById({
    a: { x: -5, y: 0, w: -2, h: 0 },
    "": { x: 1, y: 1, w: 1, h: 1 }
  }),
  {
    a: { x: 1, y: 1, w: 1, h: 1 }
  }
);

assert.deepEqual(normalizeIconStripLayout(null), {
  barArea: null,
  itemsById: {}
});

console.log("icon strip contract tests passed");
