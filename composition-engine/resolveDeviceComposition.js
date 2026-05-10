import { COMPOSITION_DEVICE_PROFILES, resolveCompositionDeviceProfile } from "./contracts/compositionDeviceProfiles.js";
import { COMPOSITION_DEVICE_SIGNAL_TYPES } from "./contracts/compositionDeviceSignalTypes.js";
import { COMPOSITION_GROUP_TYPES } from "./contracts/compositionGroupTypes.js";

export function resolveDeviceComposition({ blocks, context, groups }) {
  const currentProfile = resolveCompositionDeviceProfile(context.metrics);
  const signals = [
    createSignal({
      type: COMPOSITION_DEVICE_SIGNAL_TYPES.CURRENT_PROFILE,
      profile: currentProfile,
      message: `Текущая композиция читается как ${currentProfile}.`
    })
  ];
  const proposals = [];

  addGroupSignals({ groups, currentProfile, signals, proposals });
  addBlockRoleSignals({ blocks, currentProfile, signals, proposals });

  return {
    currentProfile,
    profiles: createProfilePolicySummary(),
    signals,
    proposals
  };
}

function addGroupSignals({ groups, currentProfile, signals, proposals }) {
  for (const group of groups) {
    if (currentProfile === COMPOSITION_DEVICE_PROFILES.MOBILE && group.type === COMPOSITION_GROUP_TYPES.HORIZONTAL_ROW) {
      const signal = createSignal({
        type: COMPOSITION_DEVICE_SIGNAL_TYPES.MOBILE_STACK_REQUIRED,
        profile: currentProfile,
        groupId: group.id,
        blockIds: group.blockIds,
        message: "На мобильной ширине горизонтальная группа должна иметь порядок укладки."
      });

      signals.push(signal);
      proposals.push(createProposal({
        type: signal.type,
        groupId: group.id,
        blockIds: group.blockIds,
        priority: "high",
        message: signal.message
      }));
    }

    if (currentProfile === COMPOSITION_DEVICE_PROFILES.TABLET && group.density.widthRatio >= 0.65) {
      const signal = createSignal({
        type: COMPOSITION_DEVICE_SIGNAL_TYPES.TABLET_WRAP_RECOMMENDED,
        profile: currentProfile,
        groupId: group.id,
        blockIds: group.blockIds,
        message: "На планшетной ширине плотную группу лучше готовить к переносу."
      });

      signals.push(signal);
      proposals.push(createProposal({
        type: signal.type,
        groupId: group.id,
        blockIds: group.blockIds,
        priority: "medium",
        message: signal.message
      }));
    }
  }
}

function addBlockRoleSignals({ blocks, currentProfile, signals, proposals }) {
  for (const block of blocks) {
    const blockType = getBlockType(block);

    if (blockType === "content" && currentProfile !== COMPOSITION_DEVICE_PROFILES.DESKTOP) {
      addBlockSignal({
        block,
        profile: currentProfile,
        signals,
        proposals,
        type: COMPOSITION_DEVICE_SIGNAL_TYPES.CONTENT_PRIORITY_REQUIRED,
        priority: "high",
        message: "Content должен сохранять главный смысловой приоритет при адаптации."
      });
    }

    if (blockType === "sidebar" && currentProfile !== COMPOSITION_DEVICE_PROFILES.DESKTOP) {
      addBlockSignal({
        block,
        profile: currentProfile,
        signals,
        proposals,
        type: COMPOSITION_DEVICE_SIGNAL_TYPES.SIDEBAR_CAN_COLLAPSE,
        priority: "medium",
        message: "Sidebar на узких ширинах должен иметь сценарий переноса или сворачивания."
      });
    }

    if (blockType === "control" && block.dependencies.length === 0) {
      addBlockSignal({
        block,
        profile: currentProfile,
        signals,
        proposals,
        type: COMPOSITION_DEVICE_SIGNAL_TYPES.CONTROL_CONTEXT_REQUIRED,
        priority: "high",
        message: "Control должен знать, каким блоком или данными он управляет."
      });
    }

    if (blockType === "warning") {
      addBlockSignal({
        block,
        profile: currentProfile,
        signals,
        proposals,
        type: COMPOSITION_DEVICE_SIGNAL_TYPES.WARNING_VISIBILITY_REQUIRED,
        priority: "medium",
        message: "Warning должен оставаться видимым, но не перекрывать главный смысловой поток."
      });
    }
  }
}

function addBlockSignal({ block, profile, signals, proposals, type, priority, message }) {
  const signal = createSignal({
    type,
    profile,
    blockId: block.id,
    message
  });

  signals.push(signal);
  proposals.push(createProposal({
    type,
    blockId: block.id,
    priority,
    message
  }));
}

function createProfilePolicySummary() {
  return [
    {
      profile: COMPOSITION_DEVICE_PROFILES.DESKTOP,
      policy: "Сохранять широкие группы, боковые роли и главный content в просторной зоне."
    },
    {
      profile: COMPOSITION_DEVICE_PROFILES.TABLET,
      policy: "Готовить плотные горизонтальные группы к переносу без потери связей."
    },
    {
      profile: COMPOSITION_DEVICE_PROFILES.MOBILE,
      policy: "Укладывать смысловые блоки в понятный порядок: header, content, controls, sidebar, warnings."
    }
  ];
}

function createSignal({
  type,
  profile,
  blockId = null,
  groupId = null,
  blockIds = [],
  message
}) {
  return {
    type,
    profile,
    blockId,
    groupId,
    blockIds,
    message
  };
}

function createProposal({
  type,
  blockId = null,
  groupId = null,
  blockIds = [],
  priority,
  message
}) {
  return {
    type,
    blockId,
    groupId,
    blockIds,
    priority,
    message
  };
}

function getBlockType(block) {
  return String(block.contentSchema?.type ?? "unknown");
}
