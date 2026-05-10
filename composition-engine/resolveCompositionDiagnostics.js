import { COMPOSITION_ISSUE_CODES } from "./contracts/compositionIssueCodes.js";
import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";
import {
  WORKSPACE_HORIZONTAL_ZONES,
  WORKSPACE_VERTICAL_ZONES
} from "./contracts/workspaceZones.js";
import { createCompositionIssue } from "./createCompositionIssue.js";

export function resolveCompositionDiagnostics({ blocks, context }) {
  const issues = [];
  const proposals = [];
  const contentBlocks = blocks.filter((block) => getBlockType(block) === "content");

  addCollisionDiagnostics({ blocks, context, issues, proposals });
  addSpacingDiagnostics({ blocks, context, issues, proposals });

  for (const block of blocks) {
    const type = getBlockType(block);

    if (type === "header") {
      addHeaderDiagnostics({ block, issues, proposals });
      continue;
    }

    if (type === "content") {
      addContentDiagnostics({ block, issues, proposals });
      continue;
    }

    if (type === "sidebar") {
      addSidebarDiagnostics({ block, issues, proposals });
      continue;
    }

    if (type === "control") {
      addControlDiagnostics({ block, issues, proposals });
      continue;
    }

    if (type === "warning") {
      addWarningDiagnostics({ block, contentBlocks, issues, proposals });
      continue;
    }

    addUnknownTypeDiagnostics({ block, issues, proposals });
  }

  return {
    issues,
    proposals
  };
}

function addCollisionDiagnostics({ blocks, context, issues, proposals }) {
  for (let firstIndex = 0; firstIndex < blocks.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < blocks.length; secondIndex += 1) {
      const firstBlock = blocks[firstIndex];
      const secondBlock = blocks[secondIndex];

      if (!doBlocksOverlap(firstBlock, secondBlock)) {
        continue;
      }

      issues.push(
        createCompositionIssue({
          code: COMPOSITION_ISSUE_CODES.BLOCKS_OVERLAP,
          message: "Блоки наложились друг на друга. Композицию нельзя безопасно адаптировать.",
          severity: COMPOSITION_ISSUE_SEVERITY.ERROR,
          blockId: firstBlock.id,
          details: {
            blockIds: [firstBlock.id, secondBlock.id],
            firstArea: firstBlock.area,
            secondArea: secondBlock.area
          }
        })
      );

      proposals.push({
        type: "separate-overlapping-blocks",
        blockIds: [firstBlock.id, secondBlock.id],
        message: "Развести пересекающиеся блоки перед дальнейшей адаптацией.",
        priority: "critical"
      });
      proposals.push(createOverlapRecoveryProposal({ firstBlock, secondBlock, context }));
    }
  }
}

function addSpacingDiagnostics({ blocks, context, issues, proposals }) {
  const minGap = Number(context?.policy?.spacing?.minGap ?? 0);

  if (!Number.isFinite(minGap) || minGap <= 0) {
    return;
  }

  for (let firstIndex = 0; firstIndex < blocks.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < blocks.length; secondIndex += 1) {
      const firstBlock = blocks[firstIndex];
      const secondBlock = blocks[secondIndex];
      const gap = resolveBlockGap(firstBlock, secondBlock);

      if (!gap || gap.distance >= minGap) {
        continue;
      }

      issues.push(
        createCompositionIssue({
          code: COMPOSITION_ISSUE_CODES.BLOCK_GAP_TOO_SMALL,
          message: "Между блоками меньше дизайнерского зазора.",
          severity: COMPOSITION_ISSUE_SEVERITY.WARNING,
          blockId: firstBlock.id,
          details: {
            blockIds: [firstBlock.id, secondBlock.id],
            axis: gap.axis,
            gap: gap.distance,
            minGap
          }
        })
      );

      proposals.push({
        type: "increase-block-gap",
        blockIds: [firstBlock.id, secondBlock.id],
        message: `Сохранить между блоками зазор минимум ${minGap} ячейка(и).`,
        priority: "medium",
        axis: gap.axis,
        minGap
      });
    }
  }
}

function doBlocksOverlap(firstBlock, secondBlock) {
  return !(
    Number(firstBlock.area.right) < Number(secondBlock.area.x) ||
    Number(secondBlock.area.right) < Number(firstBlock.area.x) ||
    Number(firstBlock.area.bottom) < Number(secondBlock.area.y) ||
    Number(secondBlock.area.bottom) < Number(firstBlock.area.y)
  );
}

function resolveBlockGap(firstBlock, secondBlock) {
  if (doBlocksOverlap(firstBlock, secondBlock)) {
    return null;
  }

  const verticallyAligned = rangesOverlap(
    Number(firstBlock.area.y),
    Number(firstBlock.area.bottom),
    Number(secondBlock.area.y),
    Number(secondBlock.area.bottom)
  );
  const horizontallyAligned = rangesOverlap(
    Number(firstBlock.area.x),
    Number(firstBlock.area.right),
    Number(secondBlock.area.x),
    Number(secondBlock.area.right)
  );

  if (verticallyAligned) {
    const distance = Number(firstBlock.area.right) < Number(secondBlock.area.x)
      ? Number(secondBlock.area.x) - Number(firstBlock.area.right) - 1
      : Number(firstBlock.area.x) - Number(secondBlock.area.right) - 1;

    return { axis: "horizontal", distance };
  }

  if (horizontallyAligned) {
    const distance = Number(firstBlock.area.bottom) < Number(secondBlock.area.y)
      ? Number(secondBlock.area.y) - Number(firstBlock.area.bottom) - 1
      : Number(firstBlock.area.y) - Number(secondBlock.area.bottom) - 1;

    return { axis: "vertical", distance };
  }

  return null;
}

function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart <= secondEnd && secondStart <= firstEnd;
}

function createOverlapRecoveryProposal({ firstBlock, secondBlock, context }) {
  const minGap = Number(context?.policy?.spacing?.minGap ?? 0);
  const nextY = Number(firstBlock.area.bottom) + minGap + 1;
  const rows = Number(context?.metrics?.rows);

  if (Number.isFinite(rows) && nextY + Number(secondBlock.area.h) - 1 <= rows) {
    return {
      type: "move-overlap-below",
      blockId: secondBlock.id,
      targetArea: {
        x: secondBlock.area.x,
        y: nextY,
        w: secondBlock.area.w,
        h: secondBlock.area.h
      },
      message: "Переместить второй блок ниже первого, чтобы развести пересечение.",
      priority: "critical"
    };
  }

  return {
    type: "stack-overlap-group",
    blockIds: [firstBlock.id, secondBlock.id],
    message: "Сложить пересекающиеся блоки в отдельную группу и пересчитать порядок.",
    priority: "critical"
  };
}

function addHeaderDiagnostics({ block, issues, proposals }) {
  if (block.workspacePosition.vertical !== WORKSPACE_VERTICAL_ZONES.TOP) {
    addDiagnostic({
      issues,
      proposals,
      code: COMPOSITION_ISSUE_CODES.HEADER_NOT_TOP,
      type: "place-header-top",
      block,
      message: "Header должен находиться в верхней зоне рабочей области."
    });
  }

  if (!block.workspacePosition.spans.fullWidth) {
    addDiagnostic({
      issues,
      proposals,
      code: COMPOSITION_ISSUE_CODES.HEADER_NOT_FULL_WIDTH,
      type: "stretch-header-width",
      block,
      message: "Header лучше держать привязанным к ширине рабочей области."
    });
  }
}

function addContentDiagnostics({ block, issues, proposals }) {
  if (block.workspacePosition.horizontal !== WORKSPACE_HORIZONTAL_ZONES.CENTER) {
    addDiagnostic({
      issues,
      proposals,
      code: COMPOSITION_ISSUE_CODES.CONTENT_NOT_CENTERED,
      type: "prioritize-content-zone",
      block,
      message: "Content смещен из центральной смысловой зоны."
    });
  }
}

function addSidebarDiagnostics({ block, issues, proposals }) {
  if (block.workspacePosition.horizontal === WORKSPACE_HORIZONTAL_ZONES.CENTER) {
    addDiagnostic({
      issues,
      proposals,
      code: COMPOSITION_ISSUE_CODES.SIDEBAR_NOT_SIDE,
      type: "move-sidebar-to-side",
      block,
      message: "Sidebar должен занимать боковую роль, а не центральную зону."
    });
  }
}

function addControlDiagnostics({ block, issues, proposals }) {
  if (block.dependencies.length > 0) {
    return;
  }

  addDiagnostic({
    issues,
    proposals,
    code: COMPOSITION_ISSUE_CODES.CONTROL_WITHOUT_CONTEXT,
    type: "link-control-context",
    block,
    message: "Control должен знать, какой областью он управляет."
  });
}

function addWarningDiagnostics({ block, contentBlocks, issues, proposals }) {
  if (block.dependencies.length > 0 || contentBlocks.length === 0) {
    return;
  }

  addDiagnostic({
    issues,
    proposals,
    code: COMPOSITION_ISSUE_CODES.WARNING_WITHOUT_CONTEXT,
    type: "link-warning-context",
    block,
    message: "Warning должен быть связан с областью, к которой относится предупреждение."
  });
}

function addUnknownTypeDiagnostics({ block, issues, proposals }) {
  addDiagnostic({
    issues,
    proposals,
    code: COMPOSITION_ISSUE_CODES.UNKNOWN_BLOCK_TYPE,
    type: "describe-block-type",
    block,
    severity: COMPOSITION_ISSUE_SEVERITY.INFO,
    message: "Блоку нужен смысловой тип перед точной композиционной адаптацией."
  });
}

function addDiagnostic({
  issues,
  proposals,
  code,
  type,
  block,
  message,
  severity = COMPOSITION_ISSUE_SEVERITY.WARNING
}) {
  issues.push(
    createCompositionIssue({
      code,
      message,
      severity,
      blockId: block.id,
      details: {
        blockType: getBlockType(block),
        sector: block.workspacePosition?.sector ?? null
      }
    })
  );

  proposals.push({
    type,
    blockId: block.id,
    message,
    priority: severity === COMPOSITION_ISSUE_SEVERITY.WARNING ? "high" : "low"
  });
}

function getBlockType(block) {
  return String(block.contentSchema?.type ?? "unknown");
}
