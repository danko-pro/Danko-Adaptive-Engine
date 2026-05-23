import assert from "node:assert/strict";
import {
  MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS,
  resolveMobileSidebarButtonClickAction,
  resolveMobileSidebarButtonDoubleClickAction,
  resolveMobileSidebarButtonPointerMoveState
} from "../index.js";

assert.equal(
  resolveMobileSidebarButtonClickAction({
    pointerPress: {
      dragged: false
    }
  }),
  MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS.SCHEDULE_TOGGLE
);

assert.equal(
  resolveMobileSidebarButtonClickAction({
    pointerPress: {
      dragged: true
    }
  }),
  MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS.NONE
);

assert.deepEqual(resolveMobileSidebarButtonDoubleClickAction(), {
  cancelPending: true,
  action: MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS.OPEN_MENU
});

assert.deepEqual(
  resolveMobileSidebarButtonPointerMoveState({
    pointerPress: {
      clientX: 10,
      clientY: 10,
      dragged: false
    },
    clientX: 13,
    clientY: 10,
    tolerancePx: 4
  }),
  {
    clientX: 10,
    clientY: 10,
    dragged: false
  }
);

assert.deepEqual(
  resolveMobileSidebarButtonPointerMoveState({
    pointerPress: {
      clientX: 10,
      clientY: 10,
      dragged: false
    },
    clientX: 15,
    clientY: 10,
    tolerancePx: 4
  }),
  {
    clientX: 10,
    clientY: 10,
    dragged: true
  }
);

assert.deepEqual(
  resolveMobileSidebarButtonPointerMoveState({
    pointerPress: {
      clientX: 10,
      clientY: 10,
      dragged: true
    },
    clientX: 10,
    clientY: 10,
    tolerancePx: 4
  }),
  {
    clientX: 10,
    clientY: 10,
    dragged: true
  }
);

console.log("mobile sidebar button activation state tests passed");
