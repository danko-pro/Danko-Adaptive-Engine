import assert from "node:assert/strict";
import { OPERATION_TYPES, applySceneOperationCommand, fitItemsToGridCommand } from "../index.js";
import {
  SIDEBAR_LAYERS,
  SIDEBAR_RENDER_MODES,
  SIDEBAR_STATES,
  createSidebarSceneProjection
} from "../../sidebar-element/index.js";

const metrics = {
  columns: 16,
  rows: 10,
  cellSize: 20,
  gridWidth: 320,
  gridHeight: 200
};

const expectedByState = {
  [SIDEBAR_STATES.FIXED]: {
    layer: SIDEBAR_LAYERS.LAYOUT,
    renderMode: SIDEBAR_RENDER_MODES.VISIBLE,
    hidden: false,
    createUnder: false,
    moveUnder: false,
    fitKeepsContentUnder: false
  },
  [SIDEBAR_STATES.OVERLAY]: {
    layer: SIDEBAR_LAYERS.OVERLAY,
    renderMode: SIDEBAR_RENDER_MODES.VISIBLE,
    hidden: false,
    createUnder: true,
    moveUnder: true,
    fitKeepsContentUnder: true
  },
  [SIDEBAR_STATES.COLLAPSED]: {
    layer: SIDEBAR_LAYERS.OVERLAY,
    renderMode: SIDEBAR_RENDER_MODES.COLLAPSED,
    hidden: false,
    createUnder: true,
    moveUnder: true,
    fitKeepsContentUnder: true
  },
  [SIDEBAR_STATES.HIDDEN]: {
    layer: SIDEBAR_LAYERS.OVERLAY,
    renderMode: SIDEBAR_RENDER_MODES.HIDDEN,
    hidden: false,
    createUnder: true,
    moveUnder: true,
    fitKeepsContentUnder: true
  }
};

for (const [state, expected] of Object.entries(expectedByState)) {
  const sidebar = createSidebar(state);
  const content = createContent({ id: `content-${state}`, x: 8, y: 2 });
  const contentUnderSidebar = createContent({ id: `content-under-${state}`, x: 2, y: 2 });
  const projection = createSidebarSceneProjection([sidebar, content]);
  const sidebarPolicy = projection.policyById.get(sidebar.id);

  assert.equal(sidebarPolicy.layer, expected.layer, `${state}: sidebar layer`);
  assert.equal(sidebarPolicy.renderMode, expected.renderMode, `${state}: sidebar render mode`);
  assert.equal(projection.layoutItems.some((item) => item.id === sidebar.id), expected.layer === SIDEBAR_LAYERS.LAYOUT, `${state}: layoutItems`);
  assert.equal(projection.overlayItems.some((item) => item.id === sidebar.id), expected.layer === SIDEBAR_LAYERS.OVERLAY, `${state}: overlayItems`);
  assert.equal(projection.hiddenItems.some((item) => item.id === sidebar.id), expected.hidden, `${state}: hiddenItems`);

  const createUnder = applySceneOperationCommand({
    items: [sidebar],
    operation: {
      type: OPERATION_TYPES.CREATE_AREA,
      targetId: `created-under-${state}`,
      payload: {
        x: 2,
        y: 2,
        w: 2,
        h: 2
      },
      meta: {
        blockType: "content"
      }
    },
    metrics
  });

  assert.equal(createUnder.valid, expected.createUnder, `${state}: create content under sidebar`);

  const moveUnder = applySceneOperationCommand({
    items: [sidebar, content],
    operation: {
      type: OPERATION_TYPES.MOVE_AREA,
      targetId: content.id,
      payload: {
        x: 2,
        y: 2
      }
    },
    metrics
  });

  assert.equal(moveUnder.valid, expected.moveUnder, `${state}: move content under sidebar`);

  const fitUnder = fitItemsToGridCommand({
    items: [sidebar, contentUnderSidebar],
    metrics,
    sourceMetrics: metrics
  });
  const fittedContent = fitUnder.items.find((item) => item.id === contentUnderSidebar.id);

  assert.equal(fitUnder.valid, true, `${state}: fit scene with content under sidebar`);
  assert.equal(
    fittedContent.x === contentUnderSidebar.x && fittedContent.y === contentUnderSidebar.y,
    expected.fitKeepsContentUnder,
    `${state}: fit keeps content under sidebar only outside fixed`
  );
}

console.log("sidebar state behavior matrix tests passed");

function createSidebar(state) {
  return {
    id: `sidebar-${state}`,
    x: 1,
    y: 1,
    w: 4,
    h: 5,
    meta: {
      blockType: "sidebar",
      sidebar: {
        state
      }
    }
  };
}

function createContent({ id, x, y }) {
  return {
    id,
    x,
    y,
    w: 2,
    h: 2,
    meta: {
      blockType: "content"
    }
  };
}
