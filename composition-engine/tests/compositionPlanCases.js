import assert from "node:assert/strict";
import {
  COMPOSITION_BLOCK_ROLES,
  COMPOSITION_DEVICE_PROFILES,
  COMPOSITION_DEVICE_SIGNAL_TYPES,
  COMPOSITION_FLOW_SIGNAL_TYPES,
  COMPOSITION_ISSUE_CODES,
  COMPOSITION_LAYOUT_INTENTS,
  COMPOSITION_MODES,
  COMPOSITION_RELATION_TYPES,
  COMPOSITION_STATUS,
  WORKSPACE_HORIZONTAL_ZONES,
  WORKSPACE_SECTORS,
  runtimeSnapshotToCompositionInput,
  resolveCompositionPlan
} from "../index.js";

const metrics = { columns: 12, rows: 8 };

const plan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics,
  items: [
    { id: "header", x: 1, y: 1, w: 12, h: 2 },
    { id: "card", x: 4, y: 4, w: 4, h: 3 },
    { id: "side", x: 10, y: 4, w: 3, h: 3 }
  ],
  contentSchemas: {
    header: { type: "header" },
    card: { type: "content" },
    side: { type: "sidebar" }
  },
  dependencies: {
    card: ["side"]
  }
});

assert.equal(plan.engine, "composition-engine");
assert.equal(plan.valid, true);
assert.equal(plan.status, COMPOSITION_STATUS.READY);
assert.equal(plan.summary.blocks, 3);
assert.equal(plan.summary.groups, 2);
assert.equal(plan.devices.currentProfile, COMPOSITION_DEVICE_PROFILES.MOBILE);
assert.equal(plan.summary.deviceSignals > 0, true);
assert.equal(plan.flow.currentProfile, COMPOSITION_DEVICE_PROFILES.MOBILE);
assert.equal(plan.summary.flowSignals > 0, true);
assert.equal(plan.summary.relations, 2);
assert.equal(plan.summary.referenceBlocks, 3);
assert.equal(plan.reference.blockCount, 3);
assert.equal(plan.reference.groupCount, 2);
assert.equal(plan.reference.relationCount, 2);
assert.equal(plan.reference.source.columns, 12);
assert.equal(
  plan.reference.blocks.find((block) => block.id === "header").anchors.includes("full-width"),
  true
);
assert.equal(
  plan.reference.gaps.horizontal.some((gap) => gap.fromId === "card" && gap.toId === "side" && gap.gap === 2),
  true
);
assert.equal(plan.workspace.center.x, 6);
assert.equal(plan.workspace.center.y, 4);
assert.equal(plan.blocks[0].edges.fullWidth, true);
assert.equal(plan.blocks[0].role, COMPOSITION_BLOCK_ROLES.FULL_WIDTH);
assert.equal(plan.blocks[0].layoutIntent.type, COMPOSITION_LAYOUT_INTENTS.PRESERVE_TOP_WIDTH);
assert.equal(plan.blocks[0].workspacePosition.sector, WORKSPACE_SECTORS.TOP_CENTER);
assert.equal(plan.blocks[1].dependencies[0], "side");
assert.equal(plan.blocks[1].role, COMPOSITION_BLOCK_ROLES.CENTER_CONTENT);
assert.equal(plan.blocks[1].layoutIntent.type, COMPOSITION_LAYOUT_INTENTS.PRIORITIZE_CONTENT);
assert.equal(plan.blocks[1].workspacePosition.sector, WORKSPACE_SECTORS.MIDDLE_CENTER);
assert.equal(plan.blocks[2].role, COMPOSITION_BLOCK_ROLES.EDGE_BOUND);
assert.equal(plan.blocks[2].layoutIntent.type, COMPOSITION_LAYOUT_INTENTS.PRESERVE_SIDE_ROLE);
assert.equal(plan.blocks[2].workspacePosition.horizontal, WORKSPACE_HORIZONTAL_ZONES.RIGHT);
assert.equal(
  plan.proposals.some((proposal) => proposal.type === "preserve-full-width"),
  true
);
assert.equal(
  plan.proposals.some((proposal) => proposal.type === COMPOSITION_LAYOUT_INTENTS.PRESERVE_TOP_WIDTH),
  true
);
assert.equal(
  plan.proposals.some((proposal) => proposal.type === "resolve-dependency-group"),
  true
);
assert.equal(
  plan.relations.some((relation) => relation.type === COMPOSITION_RELATION_TYPES.CONTENT_WITH_SIDEBAR),
  true
);

const disabledPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.OFF,
  metrics,
  items: [{ id: "box", x: 1, y: 1, w: 2, h: 2 }]
});

assert.equal(disabledPlan.valid, true);
assert.equal(disabledPlan.status, COMPOSITION_STATUS.DISABLED);
assert.equal(disabledPlan.enabled, false);
assert.equal(disabledPlan.summary.blocks, 0);
assert.equal(disabledPlan.workspace, null);
assert.equal(disabledPlan.reference, null);

const overflowPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics,
  items: [{ id: "bad", x: 11, y: 1, w: 4, h: 2 }]
});

assert.equal(overflowPlan.valid, true);
assert.equal(overflowPlan.status, COMPOSITION_STATUS.WARNING);
assert.equal(
  overflowPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.BLOCK_OUT_OF_GRID),
  true
);

const invalidPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics,
  items: [{ id: "bad-negative", x: 0, y: 1, w: 4, h: 2 }]
});

assert.equal(invalidPlan.valid, false);
assert.equal(invalidPlan.status, COMPOSITION_STATUS.ERROR);
assert.equal(
  invalidPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.BLOCK_OUT_OF_GRID),
  true
);

const overlapPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics,
  items: [
    { id: "first", x: 2, y: 2, w: 5, h: 4 },
    { id: "second", x: 4, y: 3, w: 5, h: 4 }
  ],
  contentSchemas: {
    first: { type: "content" },
    second: { type: "sidebar" }
  }
});

assert.equal(overlapPlan.valid, false);
assert.equal(overlapPlan.status, COMPOSITION_STATUS.ERROR);
assert.equal(
  overlapPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.BLOCKS_OVERLAP),
  true
);
assert.equal(
  overlapPlan.proposals.some((proposal) => proposal.type === "separate-overlapping-blocks"),
  true
);
assert.equal(
  overlapPlan.proposals.some((proposal) => proposal.type === "stack-overlap-group"),
  true
);

const spacingPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics,
  policy: {
    spacing: {
      minGap: 1
    }
  },
  items: [
    { id: "left", x: 1, y: 3, w: 3, h: 2 },
    { id: "right", x: 4, y: 3, w: 3, h: 2 }
  ],
  contentSchemas: {
    left: { type: "content" },
    right: { type: "sidebar" }
  }
});

assert.equal(spacingPlan.valid, true);
assert.equal(spacingPlan.status, COMPOSITION_STATUS.WARNING);
assert.equal(spacingPlan.policy.spacing.minGap, 1);
assert.equal(
  spacingPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.BLOCK_GAP_TOO_SMALL),
  true
);
assert.equal(
  spacingPlan.proposals.some((proposal) => proposal.type === "increase-block-gap"),
  true
);

const referencePlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics: { columns: 74, rows: 30 },
  items: [
    { id: "reference-header", x: 1, y: 1, w: 74, h: 3 },
    { id: "reference-content", x: 12, y: 6, w: 28, h: 12 },
    { id: "reference-sidebar", x: 43, y: 6, w: 10, h: 12 },
    { id: "reference-warning", x: 12, y: 21, w: 41, h: 4 }
  ],
  contentSchemas: {
    "reference-header": { type: "header" },
    "reference-content": { type: "content" },
    "reference-sidebar": { type: "sidebar" },
    "reference-warning": { type: "warning" }
  }
});

assert.equal(referencePlan.reference.blockCount, 4);
assert.equal(referencePlan.reference.groups.length, 3);
assert.equal(
  referencePlan.reference.groups.some((group) => group.blockIds.includes("reference-content") && group.blockIds.includes("reference-sidebar")),
  true
);
assert.equal(
  referencePlan.reference.gaps.horizontal.some((gap) => (
    gap.fromId === "reference-content" &&
    gap.toId === "reference-sidebar" &&
    gap.gap === 3
  )),
  true
);
assert.equal(
  referencePlan.reference.gaps.vertical.some((gap) => (
    gap.fromId === "reference-header" &&
    gap.toId === "reference-content" &&
    gap.gap === 2
  )),
  true
);

const autoPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.AUTO,
  metrics,
  items: [{ id: "auto-box", x: 2, y: 2, w: 3, h: 3 }],
  contentSchemas: {
    "auto-box": { type: "content" }
  }
});

assert.equal(autoPlan.valid, true);
assert.equal(
  autoPlan.proposals.some((proposal) => proposal.type === "auto-not-implemented"),
  true
);

const unknownPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics,
  items: [{ id: "unknown-box", x: 2, y: 2, w: 3, h: 3 }]
});

assert.equal(
  unknownPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.BLOCK_WITHOUT_CONTENT_SCHEMA),
  true
);
assert.equal(
  unknownPlan.blocks[0].layoutIntent.type,
  COMPOSITION_LAYOUT_INTENTS.DESCRIBE_BEHAVIOR
);

const semanticPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics,
  items: [
    { id: "bad-header", x: 2, y: 7, w: 4, h: 2 },
    { id: "left-content", x: 1, y: 4, w: 3, h: 2 },
    { id: "center-sidebar", x: 5, y: 4, w: 3, h: 2 },
    { id: "loose-control", x: 9, y: 4, w: 2, h: 2 }
  ],
  contentSchemas: {
    "bad-header": { type: "header" },
    "left-content": { type: "content" },
    "center-sidebar": { type: "sidebar" },
    "loose-control": { type: "control" }
  }
});

assert.equal(semanticPlan.status, COMPOSITION_STATUS.WARNING);
assert.equal(semanticPlan.summary.groups, 2);
assert.equal(semanticPlan.summary.relations, 3);
assert.equal(
  semanticPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.HORIZONTAL_GROUP_NEEDS_WRAP),
  true
);
assert.equal(
  semanticPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.HEADER_NOT_TOP),
  true
);
assert.equal(
  semanticPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.CONTENT_NOT_CENTERED),
  true
);
assert.equal(
  semanticPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.SIDEBAR_NOT_SIDE),
  true
);
assert.equal(
  semanticPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.CONTROL_WITHOUT_CONTEXT),
  true
);

const runtimeSnapshot = {
  workspaceId: "shell-workspace",
  activeRoute: "calculator",
  metrics: { columns: 32, rows: 24 },
  components: [
    {
      id: "shell.header",
      type: "toolbar",
      title: "Header",
      area: { x: 1, y: 1, w: 32, h: 3 },
      capabilities: { fixed: true },
      layoutParticipation: "always"
    },
    {
      id: "shell.sidebar",
      type: "panel",
      title: "Sidebar",
      area: { x: 1, y: 4, w: 6, h: 18 },
      capabilities: { collapsible: true },
      layoutParticipation: "always"
    },
    {
      id: "shell.screen-router",
      type: "stage",
      title: "Route outlet",
      area: { x: 8, y: 4, w: 20, h: 18 },
      dataKey: "activeRoute",
      capabilities: { resizable: true },
      layoutParticipation: "always"
    },
    {
      id: "shell.toast",
      type: "popover",
      title: "Toast",
      area: { x: 28, y: 20, w: 4, h: 3 },
      layoutParticipation: "none"
    },
    {
      id: "shell.parent-only",
      type: "workspace",
      title: "Parent",
      area: { x: 1, y: 1, w: 32, h: 24 },
      capabilities: { parentOnly: true }
    }
  ],
  relationships: [
    {
      sourceId: "shell.sidebar",
      targetId: "shell.screen-router",
      type: COMPOSITION_RELATION_TYPES.SELECTS,
      note: "Боковая панель выбирает активный маршрут."
    }
  ]
};

const runtimeInput = runtimeSnapshotToCompositionInput(runtimeSnapshot, {
  mode: COMPOSITION_MODES.SUGGEST
});

assert.equal(runtimeInput.workspaceId, "shell-workspace");
assert.equal(runtimeInput.activeRoute, "calculator");
assert.equal(runtimeInput.items.length, 3);
assert.equal(runtimeInput.contentSchemas["shell.header"].type, "header");
assert.equal(runtimeInput.contentSchemas["shell.sidebar"].type, "sidebar");
assert.equal(runtimeInput.contentSchemas["shell.screen-router"].type, "content");
assert.equal(runtimeInput.contentSchemas["shell.toast"], undefined);
assert.deepEqual(runtimeInput.dependencies["shell.sidebar"], ["shell.screen-router"]);
assert.equal(runtimeInput.relationships[0].type, COMPOSITION_RELATION_TYPES.SELECTS);

const runtimePlan = resolveCompositionPlan(runtimeInput);

assert.equal(runtimePlan.valid, true);
assert.equal(runtimePlan.summary.blocks, 3);
assert.equal(runtimePlan.devices.currentProfile, COMPOSITION_DEVICE_PROFILES.TABLET);
assert.equal(
  runtimePlan.devices.signals.some((signal) => signal.type === COMPOSITION_DEVICE_SIGNAL_TYPES.CONTENT_PRIORITY_REQUIRED),
  true
);
assert.equal(
  runtimePlan.blocks.some((block) => block.id === "shell.parent-only"),
  false
);
assert.equal(
  runtimePlan.relations.some((relation) => (
    relation.type === COMPOSITION_RELATION_TYPES.SELECTS &&
    relation.source === "runtime-snapshot" &&
    relation.sourceId === "shell.sidebar" &&
    relation.targetId === "shell.screen-router"
  )),
  true
);

const desktopPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics: { columns: 74, rows: 30 },
  items: [
    { id: "desktop-header", x: 1, y: 1, w: 74, h: 3 },
    { id: "desktop-content", x: 20, y: 6, w: 30, h: 12 },
    { id: "desktop-sidebar", x: 55, y: 6, w: 12, h: 12 }
  ],
  contentSchemas: {
    "desktop-header": { type: "header" },
    "desktop-content": { type: "content" },
    "desktop-sidebar": { type: "sidebar" }
  }
});

assert.equal(desktopPlan.devices.currentProfile, COMPOSITION_DEVICE_PROFILES.DESKTOP);
assert.equal(
  desktopPlan.devices.signals.some((signal) => signal.type === COMPOSITION_DEVICE_SIGNAL_TYPES.CURRENT_PROFILE),
  true
);
assert.equal(
  desktopPlan.flow.signals.some((signal) => signal.type === COMPOSITION_FLOW_SIGNAL_TYPES.CURRENT_FLOW_ORDER),
  true
);

const mobileFlowPlan = resolveCompositionPlan({
  mode: COMPOSITION_MODES.SUGGEST,
  metrics: { columns: 22, rows: 30 },
  items: [
    { id: "mobile-header", x: 1, y: 1, w: 22, h: 3 },
    { id: "mobile-sidebar", x: 1, y: 4, w: 6, h: 8 },
    { id: "mobile-content", x: 7, y: 4, w: 10, h: 8 },
    { id: "mobile-control", x: 17, y: 4, w: 5, h: 8 },
    { id: "mobile-warning", x: 1, y: 20, w: 22, h: 7 }
  ],
  contentSchemas: {
    "mobile-header": { type: "header" },
    "mobile-sidebar": { type: "sidebar" },
    "mobile-content": { type: "content" },
    "mobile-control": { type: "control" },
    "mobile-warning": { type: "warning" }
  }
});

assert.equal(mobileFlowPlan.flow.currentProfile, COMPOSITION_DEVICE_PROFILES.MOBILE);
assert.equal(
  mobileFlowPlan.flow.signals.some((signal) => signal.type === COMPOSITION_FLOW_SIGNAL_TYPES.CONTENT_SHOULD_LEAD_FLOW),
  true
);
assert.equal(
  mobileFlowPlan.flow.signals.some((signal) => signal.type === COMPOSITION_FLOW_SIGNAL_TYPES.SIDEBAR_SHOULD_NOT_SPLIT_CONTENT),
  true
);
assert.equal(
  mobileFlowPlan.flow.signals.some((signal) => signal.type === COMPOSITION_FLOW_SIGNAL_TYPES.WARNING_SHOULD_NOT_DOMINATE_FLOW),
  true
);
assert.equal(
  mobileFlowPlan.issues.some((issue) => issue.code === COMPOSITION_ISSUE_CODES.CONTENT_SHOULD_LEAD_FLOW),
  true
);

console.log("composition plan tests passed");
