import assert from "node:assert/strict";

import {
  SIDEBAR_CONTENT_BUTTON_VARIANTS,
  resolveSidebarContentButtonState,
  resolveSidebarContentItemAriaDisabled,
  resolveSidebarContentItemTabIndex,
  shouldAllowSidebarContentItemActivation,
  shouldAllowSidebarContentItemMenuOpen,
  shouldAllowSidebarContentItemPointerAction,
  getSidebarContentItemClassName
} from "../index.js";

assert.deepEqual(
  resolveSidebarContentButtonState({
    contentItem: {
      id: "button-1",
      type: "button",
      action: { type: "none" }
    }
  }),
  {
    type: "button",
    variant: "default",
    active: false,
    disabled: false,
    selected: false,
    hovered: false,
    pressed: false,
    actionType: "none",
    classParts: [
      "grid-operation-sidebar-content-button",
      "is-type-button",
      "is-variant-default",
      "is-action-none"
    ],
    className: "grid-operation-sidebar-content-button is-type-button is-variant-default is-action-none"
  }
);

assert.deepEqual(
  resolveSidebarContentButtonState({
    contentItem: {
      id: "nav-1",
      type: "navigation-item",
      action: {
        type: "select-page",
        pageId: "page-1"
      }
    }
  }),
  {
    type: "navigation-item",
    variant: "default",
    active: false,
    disabled: false,
    selected: false,
    hovered: false,
    pressed: false,
    actionType: "select-page",
    classParts: [
      "grid-operation-sidebar-content-button",
      "is-type-navigation-item",
      "is-variant-default",
      "is-action-select-page"
    ],
    className: "grid-operation-sidebar-content-button is-type-navigation-item is-variant-default is-action-select-page"
  }
);

const activeState = resolveSidebarContentButtonState({
  contentItem: {
    type: "navigation-item",
    active: true
  }
});
assert.equal(activeState.active, true);
assert.ok(activeState.classParts.includes("is-active"));

const disabledState = resolveSidebarContentButtonState({
  contentItem: {
    type: "button",
    disabled: true
  }
});
assert.equal(disabledState.disabled, true);
assert.ok(disabledState.classParts.includes("is-disabled"));
assert.equal(resolveSidebarContentItemAriaDisabled(disabledState), true);
assert.equal(resolveSidebarContentItemTabIndex(disabledState, true), -1);
assert.equal(shouldAllowSidebarContentItemActivation(disabledState), false);
assert.equal(shouldAllowSidebarContentItemMenuOpen(disabledState), true);
assert.equal(shouldAllowSidebarContentItemPointerAction(disabledState), false);
assertHasClasses(getSidebarContentItemClassName({
  type: "button",
  disabled: true
}), [
  "grid-operation-sidebar-content-item",
  "grid-operation-sidebar-content-button",
  "is-disabled"
]);

const enabledState = resolveSidebarContentButtonState({
  contentItem: {
    type: "button"
  }
});
assert.equal(resolveSidebarContentItemAriaDisabled(enabledState), undefined);
assert.equal(resolveSidebarContentItemTabIndex(enabledState, false), 0);
assert.equal(shouldAllowSidebarContentItemActivation(enabledState), true);
assert.equal(shouldAllowSidebarContentItemPointerAction(enabledState), true);

assert.deepEqual(
  pickStateFlags(resolveSidebarContentButtonState({
    contentItem: {
      type: "button"
    },
    selected: true,
    hovered: true,
    pressed: true
  })),
  {
    selected: true,
    hovered: true,
    pressed: true
  }
);

const hoveredState = resolveSidebarContentButtonState({
  contentItem: {
    type: "button"
  },
  hovered: true
});
assert.equal(hoveredState.hovered, true);
assert.ok(hoveredState.classParts.includes("is-hovered"));

const pressedState = resolveSidebarContentButtonState({
  contentItem: {
    type: "button"
  },
  pressed: true
});
assert.equal(pressedState.pressed, true);
assert.ok(pressedState.classParts.includes("is-pressed"));

const disabledPointerState = resolveSidebarContentButtonState({
  contentItem: {
    type: "button",
    disabled: true
  },
  hovered: true,
  pressed: true
});
assert.equal(disabledPointerState.disabled, true);
assert.equal(disabledPointerState.hovered, true);
assert.equal(disabledPointerState.pressed, true);
assert.ok(disabledPointerState.classParts.includes("is-disabled"));
assert.ok(disabledPointerState.classParts.includes("is-hovered"));
assert.ok(disabledPointerState.classParts.includes("is-pressed"));
assert.equal(shouldAllowSidebarContentItemPointerAction(disabledPointerState), false);

const unknownState = resolveSidebarContentButtonState({
  contentItem: {
    type: "unknown-type",
    variant: "  ",
    action: {}
  }
});

assert.equal(unknownState.type, "button");
assert.equal(unknownState.variant, SIDEBAR_CONTENT_BUTTON_VARIANTS.DEFAULT);
assert.equal(unknownState.actionType, "none");
assert.ok(unknownState.classParts.includes("is-type-button"));
assert.ok(unknownState.classParts.includes("is-variant-default"));

const customVariantState = resolveSidebarContentButtonState({
  contentItem: {
    type: "button",
    variant: "primary CTA"
  }
});

assert.equal(customVariantState.variant, "default");
assert.ok(customVariantState.classParts.includes("is-variant-default"));

assertVariantClass("primary", "is-variant-primary");
assertVariantClass("secondary", "is-variant-secondary");
assertVariantClass("ghost", "is-variant-ghost");
assertVariantClass("danger", "is-variant-danger");

const selectedClassName = getSidebarContentItemClassName({
  type: "button",
  textFit: "wrap"
}, {
  selected: true
});
assertHasClasses(selectedClassName, [
  "grid-operation-sidebar-content-item",
  "grid-operation-sidebar-content-button",
  "is-type-button",
  "is-text-fit-wrap",
  "is-variant-default",
  "is-action-none",
  "is-selected"
]);
assert.equal(countClass(selectedClassName, "is-selected"), 1);
assert.equal(countClass(selectedClassName, "is-type-button"), 1);

assertHasClasses(getSidebarContentItemClassName({
  type: "navigation-item",
  textFit: "truncate",
  action: {
    type: "select-page"
  },
  active: true
}), [
  "grid-operation-sidebar-content-item",
  "grid-operation-sidebar-content-button",
  "is-type-navigation-item",
  "is-text-fit-truncate",
  "is-action-select-page",
  "is-active"
]);

assertHasClasses(getSidebarContentItemClassName({
  type: "unknown type",
  textFit: "bad fit",
  action: {}
}), [
  "grid-operation-sidebar-content-item",
  "grid-operation-sidebar-content-button",
  "is-type-unknown-type",
  "is-text-fit-bad-fit",
  "is-variant-default",
  "is-action-none"
]);

console.log("sidebar content button state tests passed");

function pickStateFlags(state) {
  return {
    selected: state.selected,
    hovered: state.hovered,
    pressed: state.pressed
  };
}

function assertHasClasses(className, expectedClasses) {
  const classSet = new Set(className.split(/\s+/).filter(Boolean));

  for (const expectedClass of expectedClasses) {
    assert.equal(classSet.has(expectedClass), true, `missing class ${expectedClass}`);
  }
}

function countClass(className, expectedClass) {
  return className.split(/\s+/).filter((classPart) => classPart === expectedClass).length;
}

function assertVariantClass(variant, expectedClass) {
  const state = resolveSidebarContentButtonState({
    contentItem: {
      type: "button",
      variant
    }
  });

  assert.equal(state.variant, variant);
  assert.ok(state.classParts.includes(expectedClass));
}
