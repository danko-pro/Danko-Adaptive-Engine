import assert from "node:assert/strict";
import {
  canStartMobileSidebarButtonMove,
  shouldEnterMobileSidebarButtonEditModeFromDoubleClick,
  shouldToggleMobileSidebarMenuFromClick
} from "./mobileSidebarButtonEditModeState.js";

assert.equal(canStartMobileSidebarButtonMove({ selected: false }), false);
assert.equal(canStartMobileSidebarButtonMove({ selected: true }), true);

assert.equal(
  shouldToggleMobileSidebarMenuFromClick({
    selected: false,
    dragged: false
  }),
  true
);
assert.equal(
  shouldToggleMobileSidebarMenuFromClick({
    selected: true,
    dragged: false
  }),
  false
);
assert.equal(
  shouldToggleMobileSidebarMenuFromClick({
    selected: false,
    dragged: true
  }),
  false
);

assert.deepEqual(shouldEnterMobileSidebarButtonEditModeFromDoubleClick(), {
  select: true,
  openMenu: true,
  toggle: false,
  cancelPending: true
});

console.log("mobile sidebar button edit mode tests passed");
