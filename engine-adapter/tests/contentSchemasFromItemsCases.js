import assert from "node:assert/strict";
import { COMPOSITION_SIDEBAR_MODES } from "../../composition-engine/index.js";
import {
  createContentSchemasFromItems,
  mapSidebarStateToCompositionMode,
  mapSidebarToCompositionBehavior
} from "../index.js";
import { SIDEBAR_STATES } from "../../sidebar-element/index.js";

assert.equal(
  mapSidebarStateToCompositionMode(SIDEBAR_STATES.FIXED),
  COMPOSITION_SIDEBAR_MODES.STATIC
);
assert.equal(
  mapSidebarStateToCompositionMode(SIDEBAR_STATES.COLLAPSED),
  COMPOSITION_SIDEBAR_MODES.COLLAPSIBLE
);
assert.equal(
  mapSidebarStateToCompositionMode(SIDEBAR_STATES.HIDDEN),
  COMPOSITION_SIDEBAR_MODES.TRIGGER
);
assert.equal(
  mapSidebarStateToCompositionMode(SIDEBAR_STATES.OVERLAY),
  COMPOSITION_SIDEBAR_MODES.OVERLAY
);

assert.deepEqual(
  mapSidebarToCompositionBehavior({
    meta: {
      blockType: "sidebar",
      sidebar: {
        state: SIDEBAR_STATES.FIXED
      }
    }
  }),
  {
    sidebar: {
      defaultMode: COMPOSITION_SIDEBAR_MODES.STATIC
    }
  }
);

assert.equal(
  mapSidebarToCompositionBehavior({
    meta: {
      blockType: "content"
    }
  }),
  null
);

assert.deepEqual(
  createContentSchemasFromItems([
    {
      id: "content-main",
      meta: {
        blockType: "content",
        value: "Главный блок"
      }
    },
    {
      id: "sidebar-left",
      meta: {
        blockType: "sidebar",
        value: "Меню",
        sidebar: {
          state: SIDEBAR_STATES.FIXED
        }
      }
    },
    {
      id: "empty"
    }
  ]),
  {
    "content-main": {
      type: "content",
      value: "Главный блок"
    },
    "sidebar-left": {
      type: "sidebar",
      value: "Меню",
      behavior: {
        sidebar: {
          defaultMode: COMPOSITION_SIDEBAR_MODES.STATIC
        }
      }
    }
  }
);

console.log("adapter content schema tests passed");
