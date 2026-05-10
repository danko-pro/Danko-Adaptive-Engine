import { COMPOSITION_DEVICE_PROFILES, resolveCompositionDeviceProfile } from "./contracts/compositionDeviceProfiles.js";
import { COMPOSITION_FLOW_SIGNAL_TYPES } from "./contracts/compositionFlowSignalTypes.js";
import { COMPOSITION_ISSUE_CODES } from "./contracts/compositionIssueCodes.js";
import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";
import { WORKSPACE_VERTICAL_ZONES } from "./contracts/workspaceZones.js";
import { createCompositionIssue } from "./createCompositionIssue.js";

export function resolveCompositionFlow({ blocks, context }) {
  const currentProfile = resolveCompositionDeviceProfile(context.metrics);
  const order = createFlowOrder(blocks);
  const signals = [
    createSignal({
      type: COMPOSITION_FLOW_SIGNAL_TYPES.CURRENT_FLOW_ORDER,
      profile: currentProfile,
      message: createOrderMessage(order)
    })
  ];
  const issues = [];
  const proposals = [];
  const mainContent = findMainContentBlock(blocks);

  addContentFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals });
  addControlFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals });
  addSidebarFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals });
  addWarningFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals });
  addBottomBandChecks({ blocks, context, currentProfile, signals, issues, proposals });

  return {
    currentProfile,
    expectedOrder: getExpectedOrder(currentProfile),
    order,
    signals,
    issues,
    proposals
  };
}

function addContentFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals }) {
  if (!mainContent || currentProfile === COMPOSITION_DEVICE_PROFILES.DESKTOP) {
    return;
  }

  const firstMeaningfulBlock = order.find((item) => item.type !== "header");

  if (!firstMeaningfulBlock || firstMeaningfulBlock.id === mainContent.id) {
    return;
  }

  addFlowFinding({
    signals,
    issues,
    proposals,
    profile: currentProfile,
    type: COMPOSITION_FLOW_SIGNAL_TYPES.CONTENT_SHOULD_LEAD_FLOW,
    code: COMPOSITION_ISSUE_CODES.CONTENT_SHOULD_LEAD_FLOW,
    blockId: mainContent.id,
    priority: "high",
    message: "На узкой композиции главный content должен идти первым после header."
  });
}

function addControlFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals }) {
  if (!mainContent || currentProfile === COMPOSITION_DEVICE_PROFILES.DESKTOP) {
    return;
  }

  const contentIndex = getOrderIndex(order, mainContent.id);
  const controlBlocks = blocks.filter((block) => getBlockType(block) === "control");

  for (const control of controlBlocks) {
    const controlIndex = getOrderIndex(order, control.id);
    const isLinkedToContent = control.dependencies.includes(mainContent.id);
    const followsContent = controlIndex > contentIndex;

    if (isLinkedToContent && followsContent) {
      continue;
    }

    addFlowFinding({
      signals,
      issues,
      proposals,
      profile: currentProfile,
      type: COMPOSITION_FLOW_SIGNAL_TYPES.CONTROL_SHOULD_FOLLOW_CONTENT,
      code: COMPOSITION_ISSUE_CODES.CONTROL_SHOULD_FOLLOW_CONTENT,
      blockId: control.id,
      priority: "high",
      message: "Control должен идти после content и явно знать, чем управляет."
    });
  }
}

function addSidebarFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals }) {
  if (!mainContent || currentProfile === COMPOSITION_DEVICE_PROFILES.DESKTOP) {
    return;
  }

  const contentIndex = getOrderIndex(order, mainContent.id);
  const sidebarBlocks = blocks.filter((block) => getBlockType(block) === "sidebar");

  for (const sidebar of sidebarBlocks) {
    const sidebarIndex = getOrderIndex(order, sidebar.id);

    if (sidebarIndex > contentIndex) {
      continue;
    }

    addFlowFinding({
      signals,
      issues,
      proposals,
      profile: currentProfile,
      type: COMPOSITION_FLOW_SIGNAL_TYPES.SIDEBAR_SHOULD_NOT_SPLIT_CONTENT,
      code: COMPOSITION_ISSUE_CODES.SIDEBAR_SHOULD_NOT_SPLIT_CONTENT,
      blockId: sidebar.id,
      priority: "medium",
      message: "Sidebar на узкой ширине не должен идти раньше главного content."
    });
  }
}

function addWarningFlowChecks({ blocks, order, mainContent, currentProfile, signals, issues, proposals }) {
  const warningBlocks = blocks.filter((block) => getBlockType(block) === "warning");

  if (warningBlocks.length === 0) {
    return;
  }

  const mainContentArea = mainContent ? getAreaSize(mainContent) : 0;

  for (const warning of warningBlocks) {
    const dominatesContent = mainContentArea > 0 && getAreaSize(warning) >= mainContentArea * 0.7;
    const warningBeforeContent = mainContent && getOrderIndex(order, warning.id) < getOrderIndex(order, mainContent.id);

    if (!dominatesContent && !(currentProfile !== COMPOSITION_DEVICE_PROFILES.DESKTOP && warningBeforeContent)) {
      continue;
    }

    addFlowFinding({
      signals,
      issues,
      proposals,
      profile: currentProfile,
      type: COMPOSITION_FLOW_SIGNAL_TYPES.WARNING_SHOULD_NOT_DOMINATE_FLOW,
      code: COMPOSITION_ISSUE_CODES.WARNING_SHOULD_NOT_DOMINATE_FLOW,
      blockId: warning.id,
      priority: "medium",
      message: "Warning должен оставаться заметным, но не становиться главным блоком потока."
    });
  }
}

function addBottomBandChecks({ blocks, context, currentProfile, signals, issues, proposals }) {
  if (currentProfile === COMPOSITION_DEVICE_PROFILES.DESKTOP) {
    return;
  }

  const rows = Math.max(1, Number(context.metrics.rows));
  const bottomBlocks = blocks.filter((block) => (
    block.workspacePosition.vertical === WORKSPACE_VERTICAL_ZONES.BOTTOM &&
    Number(block.area.h) >= Math.ceil(rows * 0.2)
  ));

  for (const block of bottomBlocks) {
    addFlowFinding({
      signals,
      issues,
      proposals,
      profile: currentProfile,
      type: COMPOSITION_FLOW_SIGNAL_TYPES.BOTTOM_BAND_TOO_DOMINANT,
      code: COMPOSITION_ISSUE_CODES.BOTTOM_BAND_TOO_DOMINANT,
      blockId: block.id,
      priority: "medium",
      message: "Нижняя зона не должна съедать смысловую композицию на узкой ширине."
    });
  }
}

function addFlowFinding({ signals, issues, proposals, profile, type, code, blockId, priority, message }) {
  signals.push(
    createSignal({
      type,
      profile,
      blockId,
      message
    })
  );

  issues.push(
    createCompositionIssue({
      code,
      message,
      severity: COMPOSITION_ISSUE_SEVERITY.WARNING,
      blockId,
      details: {
        profile
      }
    })
  );

  proposals.push({
    type,
    blockId,
    priority,
    message
  });
}

function createFlowOrder(blocks) {
  return [...blocks]
    .sort((left, right) => {
      if (Number(left.area.y) !== Number(right.area.y)) {
        return Number(left.area.y) - Number(right.area.y);
      }

      return Number(left.area.x) - Number(right.area.x);
    })
    .map((block, index) => ({
      index,
      id: block.id,
      type: getBlockType(block),
      x: Number(block.area.x),
      y: Number(block.area.y)
    }));
}

function findMainContentBlock(blocks) {
  return blocks
    .filter((block) => getBlockType(block) === "content")
    .sort((left, right) => getAreaSize(right) - getAreaSize(left))[0] ?? null;
}

function getExpectedOrder(profile) {
  if (profile === COMPOSITION_DEVICE_PROFILES.DESKTOP) {
    return ["header", "content", "sidebar", "control", "warning"];
  }

  if (profile === COMPOSITION_DEVICE_PROFILES.TABLET) {
    return ["header", "content", "control", "sidebar", "warning"];
  }

  return ["header", "content", "control", "sidebar", "warning"];
}

function createOrderMessage(order) {
  if (order.length === 0) {
    return "Поток композиции пуст.";
  }

  return `Текущий поток: ${order.map((item) => `${item.type}:${item.id}`).join(" -> ")}.`;
}

function getOrderIndex(order, blockId) {
  const index = order.findIndex((item) => item.id === blockId);

  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function getAreaSize(block) {
  return Number(block.area.w) * Number(block.area.h);
}

function createSignal({ type, profile, blockId = null, message }) {
  return {
    type,
    profile,
    blockId,
    message
  };
}

function getBlockType(block) {
  return String(block.contentSchema?.type ?? "unknown");
}
