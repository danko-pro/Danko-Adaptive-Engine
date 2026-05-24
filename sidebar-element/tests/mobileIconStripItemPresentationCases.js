import assert from "node:assert/strict";
import { resolveMobileIconStripItemPresentation } from "../index.js";

assert.deepEqual(
  resolveMobileIconStripItemPresentation({
    contentItem: {
      id: "nav-1",
      type: "button",
      text: "Раскладка",
      active: true
    }
  }),
  {
    id: "nav-1",
    text: "Раскладка",
    glyph: "Р",
    type: "button",
    active: true,
    disabled: false,
    activatable: true,
    className: "grid-operation-mobile-sidebar-icon-strip-item is-type-button is-active"
  }
);

assert.equal(
  resolveMobileIconStripItemPresentation({
    contentItem: {
      id: "nav-2",
      glyph: "★",
      text: "Star"
    }
  }).glyph,
  "★"
);

assert.equal(
  resolveMobileIconStripItemPresentation({
    contentItem: {
      id: "nav-3",
      disabled: true
    }
  }).activatable,
  false
);

console.log("mobile icon strip item presentation tests passed");
