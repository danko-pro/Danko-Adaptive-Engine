import { COMPOSITION_ISSUE_CODES } from "./contracts/compositionIssueCodes.js";
import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";
import { classifyCompositionBlockRole } from "./classifyCompositionBlockRole.js";
import { createCompositionIssue } from "./createCompositionIssue.js";
import { resolveBlockLayoutIntent } from "./resolveBlockLayoutIntent.js";
import { classifyWorkspacePosition } from "./workspace/classifyWorkspacePosition.js";

export function resolveCompositionBlock({ item, context, workspace }) {
  const metrics = context.metrics;
  const right = Number(item.x) + Number(item.w) - 1;
  const bottom = Number(item.y) + Number(item.h) - 1;
  const area = {
    x: Number(item.x),
    y: Number(item.y),
    w: Number(item.w),
    h: Number(item.h),
    right,
    bottom
  };
  const contentSchema = context.contentSchemas[item.id] ?? null;
  const dependencies = normalizeDependencies(context.dependencies[item.id]);
  const issues = [];

  if (!contentSchema) {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.BLOCK_WITHOUT_CONTENT_SCHEMA,
        message: "У блока пока нет описания внутреннего содержимого.",
        severity: COMPOSITION_ISSUE_SEVERITY.WARNING,
        blockId: item.id
      })
    );
  }

  addEdgeIssues({ item, right, bottom, metrics, issues });

  if (dependencies.length > 0) {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.BLOCK_HAS_DEPENDENCIES,
        message: "У блока есть связи с другими блоками.",
        blockId: item.id,
        details: { dependencies }
      })
    );
  }

  const workspacePosition = classifyWorkspacePosition({ area, zones: workspace });
  const block = {
    id: item.id,
    type: item.type ?? "area",
    area,
    edges: {
      left: Number(item.x) === 1,
      right: right === Number(metrics.columns),
      top: Number(item.y) === 1,
      bottom: bottom === Number(metrics.rows),
      fullWidth: Number(item.x) === 1 && right === Number(metrics.columns),
      fullHeight: Number(item.y) === 1 && bottom === Number(metrics.rows)
    },
    workspacePosition,
    contentSchema,
    dependencies,
    issues
  };

  return {
    ...block,
    role: classifyCompositionBlockRole(block),
    layoutIntent: resolveBlockLayoutIntent(block)
  };
}

function addEdgeIssues({ item, right, bottom, metrics, issues }) {
  if (Number(item.x) === 1) {
    issues.push(createEdgeIssue(COMPOSITION_ISSUE_CODES.BLOCK_TOUCHES_LEFT_EDGE, item.id, "Блок касается левого края."));
  }

  if (right === Number(metrics.columns)) {
    issues.push(createEdgeIssue(COMPOSITION_ISSUE_CODES.BLOCK_TOUCHES_RIGHT_EDGE, item.id, "Блок касается правого края."));
  }

  if (Number(item.y) === 1) {
    issues.push(createEdgeIssue(COMPOSITION_ISSUE_CODES.BLOCK_TOUCHES_TOP_EDGE, item.id, "Блок касается верхнего края."));
  }

  if (bottom === Number(metrics.rows)) {
    issues.push(createEdgeIssue(COMPOSITION_ISSUE_CODES.BLOCK_TOUCHES_BOTTOM_EDGE, item.id, "Блок касается нижнего края."));
  }

  if (Number(item.x) === 1 && right === Number(metrics.columns)) {
    issues.push(createEdgeIssue(COMPOSITION_ISSUE_CODES.BLOCK_SPANS_FULL_WIDTH, item.id, "Блок занимает всю ширину сетки."));
  }

  if (Number(item.y) === 1 && bottom === Number(metrics.rows)) {
    issues.push(createEdgeIssue(COMPOSITION_ISSUE_CODES.BLOCK_SPANS_FULL_HEIGHT, item.id, "Блок занимает всю высоту сетки."));
  }
}

function createEdgeIssue(code, blockId, message) {
  return createCompositionIssue({
    code,
    message,
    blockId
  });
}

function normalizeDependencies(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(String).filter(Boolean);
}
