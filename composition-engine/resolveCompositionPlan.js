import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";
import { COMPOSITION_MODES } from "./contracts/compositionModes.js";
import { COMPOSITION_STATUS } from "./contracts/compositionStatus.js";
import { createCompositionContext } from "./createCompositionContext.js";
import { resolveCompositionBlock } from "./resolveCompositionBlock.js";
import { resolveCompositionDiagnostics } from "./resolveCompositionDiagnostics.js";
import { resolveCompositionFlow } from "./resolveCompositionFlow.js";
import { resolveCompositionGroups } from "./resolveCompositionGroups.js";
import { resolveCompositionRelations } from "./resolveCompositionRelations.js";
import { resolveDeviceComposition } from "./resolveDeviceComposition.js";
import { validateCompositionContext } from "./validateCompositionContext.js";
import { createReferenceCompositionSnapshot } from "./reference/createReferenceCompositionSnapshot.js";
import { resolveWorkspaceZones } from "./workspace/resolveWorkspaceZones.js";

export function resolveCompositionPlan(input = {}) {
  const context = createCompositionContext(input);
  const validation = validateCompositionContext(context);

  if (!validation.valid) {
    return createPlan({
      context,
      status: COMPOSITION_STATUS.ERROR,
      valid: false,
      workspace: null,
      issues: validation.issues,
      blocks: [],
      groups: [],
      devices: null,
      flow: null,
      relations: [],
      proposals: []
    });
  }

  if (context.mode === COMPOSITION_MODES.OFF) {
    return createPlan({
      context,
      status: COMPOSITION_STATUS.DISABLED,
      valid: true,
      workspace: null,
      issues: validation.issues,
      blocks: [],
      groups: [],
      devices: null,
      flow: null,
      relations: [],
      proposals: []
    });
  }

  const workspace = resolveWorkspaceZones(context.metrics);
  const blocks = context.items.map((item) => resolveCompositionBlock({ item, context, workspace }));
  const diagnostics = resolveCompositionDiagnostics({ blocks, context, workspace });
  const grouping = resolveCompositionGroups({ blocks, context, workspace });
  const relationships = resolveCompositionRelations({ blocks, context, workspace });
  const reference = createReferenceCompositionSnapshot({
    blocks,
    groups: grouping.groups,
    relations: relationships.relations,
    context,
    workspace
  });
  const deviceComposition = resolveDeviceComposition({
    blocks,
    context,
    groups: grouping.groups
  });
  const flowComposition = resolveCompositionFlow({
    blocks,
    context
  });
  const issues = [
    ...validation.issues,
    ...blocks.flatMap((block) => block.issues),
    ...diagnostics.issues,
    ...grouping.issues,
    ...flowComposition.issues
  ];
  const proposals = [
    ...createCompositionProposals({ blocks, context }),
    ...diagnostics.proposals,
    ...grouping.proposals,
    ...relationships.proposals,
    ...deviceComposition.proposals,
    ...flowComposition.proposals
  ];
  const hasErrors = issues.some((issue) => issue.severity === COMPOSITION_ISSUE_SEVERITY.ERROR);
  const hasWarnings = issues.some((issue) => issue.severity === COMPOSITION_ISSUE_SEVERITY.WARNING);
  const status = hasErrors
    ? COMPOSITION_STATUS.ERROR
    : hasWarnings
      ? COMPOSITION_STATUS.WARNING
      : COMPOSITION_STATUS.READY;

  return createPlan({
    context,
    status,
    valid: !hasErrors,
    workspace,
    issues,
    blocks,
    groups: grouping.groups,
    devices: deviceComposition,
    flow: flowComposition,
    reference,
    relations: relationships.relations,
    proposals
  });
}

function createCompositionProposals({ blocks, context }) {
  const proposals = [];

  for (const block of blocks) {
    if (!block.contentSchema) {
      proposals.push({
        type: "describe-content",
        blockId: block.id,
        message: "Описать внутреннее содержимое блока перед умной адаптацией."
      });
    }

    if (block.edges.fullWidth) {
      proposals.push({
        type: "preserve-full-width",
        blockId: block.id,
        message: "Сохранять привязку блока к двум горизонтальным краям."
      });
    }

    if (block.edges.right && !block.edges.fullWidth) {
      proposals.push({
        type: "preserve-right-edge",
        blockId: block.id,
        message: "Сохранять привязку блока к правому краю при изменении ширины."
      });
    }

    if (block.dependencies.length > 0) {
      proposals.push({
        type: "resolve-dependency-group",
        blockId: block.id,
        message: "Рассматривать связанный блок как часть композиционной группы.",
        dependencies: block.dependencies
      });
    }

    if (block.layoutIntent) {
      proposals.push({
        type: block.layoutIntent.type,
        blockId: block.id,
        message: block.layoutIntent.message,
        priority: block.layoutIntent.priority,
        anchors: block.layoutIntent.anchors,
        canWrap: block.layoutIntent.canWrap
      });
    }
  }

  if (context.mode === COMPOSITION_MODES.AUTO) {
    proposals.push({
      type: "auto-not-implemented",
      message: "Режим auto зарезервирован, но пока не применяет изменения."
    });
  }

  return proposals;
}

function createPlan({ context, status, valid, workspace, issues, blocks, groups, devices, flow, reference = null, relations, proposals }) {
  return {
    engine: "composition-engine",
    version: "0.1.0",
    mode: context.mode,
    enabled: context.enabled,
    valid,
    status,
    summary: {
      blocks: blocks.length,
      groups: groups.length,
      deviceSignals: devices?.signals?.length ?? 0,
      flowSignals: flow?.signals?.length ?? 0,
      referenceBlocks: reference?.blockCount ?? 0,
      referenceGaps: (reference?.gaps?.horizontal?.length ?? 0) + (reference?.gaps?.vertical?.length ?? 0),
      relations: relations.length,
      issues: issues.length,
      proposals: proposals.length
    },
    policy: context.policy,
    workspace,
    issues,
    blocks,
    groups,
    devices,
    flow,
    reference,
    relations,
    proposals
  };
}
