import assert from "node:assert/strict";
import {
  COMPOSITION_BEHAVIOR_ANCHORS,
  COMPOSITION_BEHAVIOR_LAYERS,
  COMPOSITION_BEHAVIOR_PROFILE_IDS,
  COMPOSITION_BEHAVIOR_STATE_TYPES,
  COMPOSITION_SIDEBAR_DOCKS,
  COMPOSITION_SIDEBAR_MODES,
  COMPOSITION_BLOCK_ROLES,
  getCompositionBehaviorProfile,
  resolveBlockBehaviorProfile,
  resolveBlockBehaviorState,
  resolveCompositionPlan,
  validateBlockBehaviorProfile
} from "../index.js";

const headerProfile = resolveBlockBehaviorProfile({
  block: { id: "header", contentSchema: { type: "header" } },
  role: COMPOSITION_BLOCK_ROLES.FULL_WIDTH
});

assert.equal(headerProfile.id, COMPOSITION_BEHAVIOR_PROFILE_IDS.HEADER);
assert.equal(headerProfile.valid, true);
assert.equal(headerProfile.canWrap, false);
assert.equal(headerProfile.anchors.includes(COMPOSITION_BEHAVIOR_ANCHORS.TOP_WIDTH), true);
assert.equal(headerProfile.minSize.w >= 12, true);

const sidebarProfile = resolveBlockBehaviorProfile({
  block: { id: "sidebar", contentSchema: { type: "sidebar" } },
  role: COMPOSITION_BLOCK_ROLES.EDGE_BOUND
});

assert.equal(sidebarProfile.id, COMPOSITION_BEHAVIOR_PROFILE_IDS.SIDEBAR);
assert.equal(sidebarProfile.canStack, true);
assert.equal(sidebarProfile.canDetachFromGroup, false);
assert.equal(sidebarProfile.fallbackOrder.includes("move-below-content"), true);
assert.equal(sidebarProfile.sidebar.defaultMode, COMPOSITION_SIDEBAR_MODES.STATIC);
assert.equal(sidebarProfile.sidebar.docks.includes(COMPOSITION_SIDEBAR_DOCKS.HEADER), true);
assert.equal(sidebarProfile.sidebar.collapsedSize.w, 4);
assert.equal(
  sidebarProfile.sidebar.modes.some((mode) => (
    mode.id === COMPOSITION_SIDEBAR_MODES.OVERLAY &&
    mode.layer === COMPOSITION_BEHAVIOR_LAYERS.OVERLAY &&
    mode.reservesSpace === false &&
    mode.declaredAreaMeaning === "opened-overlay-area"
  )),
  true
);
assert.equal(
  sidebarProfile.sidebar.modes.some((mode) => (
    mode.id === COMPOSITION_SIDEBAR_MODES.STATIC &&
    mode.layer === COMPOSITION_BEHAVIOR_LAYERS.LAYOUT &&
    mode.reservesSpace === true
  )),
  true
);

const contentProfile = resolveBlockBehaviorProfile({
  block: {
    id: "content",
    contentSchema: {
      type: "content",
      behavior: {
        minSize: { w: 14 },
        fallbackOrder: ["keep-readable", "reject"]
      }
    }
  },
  role: COMPOSITION_BLOCK_ROLES.CENTER_CONTENT
});

assert.equal(contentProfile.id, COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTENT);
assert.equal(contentProfile.source, "profile+schema");
assert.equal(contentProfile.minSize.w, 14);
assert.equal(contentProfile.minSize.h, 6);
assert.deepEqual(contentProfile.fallbackOrder, ["keep-readable", "reject"]);

const unknownProfile = getCompositionBehaviorProfile("missing-profile");
assert.equal(unknownProfile.id, COMPOSITION_BEHAVIOR_PROFILE_IDS.UNKNOWN);
assert.equal(validateBlockBehaviorProfile(unknownProfile).valid, true);

const invalidProfile = validateBlockBehaviorProfile({
  id: "broken",
  role: "broken",
  minSize: { w: 0, h: 1 },
  anchors: [],
  fallbackOrder: [],
  canMove: true,
  canResize: true,
  canShrink: true,
  canGrow: true,
  canWrap: true,
  canStack: true,
  canDetachFromGroup: true
});

assert.equal(invalidProfile.valid, false);
assert.equal(
  invalidProfile.issues.some((issue) => issue.code === "INVALID_MIN_SIZE"),
  true
);

const plan = resolveCompositionPlan({
  mode: "suggest",
  metrics: { columns: 24, rows: 16 },
  items: [
    { id: "header", x: 1, y: 1, w: 24, h: 3 },
    { id: "content", x: 5, y: 5, w: 12, h: 8 }
  ],
  contentSchemas: {
    header: { type: "header" },
    content: { type: "content" }
  }
});

assert.equal(plan.blocks[0].behavior.id, COMPOSITION_BEHAVIOR_PROFILE_IDS.HEADER);
assert.equal(plan.blocks[1].behavior.id, COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTENT);
assert.equal(plan.blocks[1].behavior.v4.internalGrid, "content-workspace");
assert.equal(plan.blocks[0].behaviorState.type, COMPOSITION_BEHAVIOR_STATE_TYPES.STATIC_LAYOUT);
assert.equal(plan.blocks[0].behaviorState.reservesSpace, true);
assert.equal(plan.blocks[1].behaviorState.requiresV4Measure, true);

const mobileSidebarState = resolveBlockBehaviorState({
  block: {
    id: "sidebar",
    area: { x: 1, y: 4, w: 5, h: 14, right: 5, bottom: 17 }
  },
  behavior: sidebarProfile,
  context: {
    metrics: { columns: 24, rows: 30 }
  }
});

assert.equal(mobileSidebarState.type, COMPOSITION_BEHAVIOR_STATE_TYPES.COLLAPSE_CANDIDATE);
assert.equal(mobileSidebarState.canOverlay, true);
assert.equal(mobileSidebarState.canCollapse, true);
assert.equal(mobileSidebarState.recommendedMode, COMPOSITION_SIDEBAR_MODES.OVERLAY);
assert.equal(mobileSidebarState.reservesSpace, true);
assert.equal(mobileSidebarState.collapsedSize.w, 4);

const overlaySidebarProfile = resolveBlockBehaviorProfile({
  block: {
    id: "sidebar-overlay",
    contentSchema: {
      type: "sidebar",
      behavior: {
        sidebar: {
          defaultMode: COMPOSITION_SIDEBAR_MODES.OVERLAY
        }
      }
    }
  },
  role: COMPOSITION_BLOCK_ROLES.EDGE_BOUND
});
const overlaySidebarState = resolveBlockBehaviorState({
  block: {
    id: "sidebar-overlay",
    area: { x: 1, y: 4, w: 6, h: 12, right: 6, bottom: 15 }
  },
  behavior: overlaySidebarProfile,
  context: {
    metrics: { columns: 72, rows: 30 }
  }
});

assert.equal(overlaySidebarState.type, COMPOSITION_BEHAVIOR_STATE_TYPES.OVERLAY_AVAILABLE);
assert.equal(overlaySidebarState.reservesSpace, false);
assert.equal(overlaySidebarState.affectsContentFlow, false);
assert.equal(overlaySidebarState.declaredAreaMeaning, "opened-overlay-area");

const blockedContentState = resolveBlockBehaviorState({
  block: {
    id: "content-small",
    area: { x: 3, y: 3, w: 3, h: 2, right: 5, bottom: 4 }
  },
  behavior: contentProfile,
  context: {
    metrics: { columns: 72, rows: 30 }
  }
});

assert.equal(blockedContentState.type, COMPOSITION_BEHAVIOR_STATE_TYPES.BLOCKED_BY_CONTENT);
assert.equal(blockedContentState.blocked, true);
assert.equal(blockedContentState.fitsCurrentSize, false);
assert.equal(blockedContentState.reasons.includes("area-smaller-than-min-size"), true);

console.log("composition behavior tests passed");
