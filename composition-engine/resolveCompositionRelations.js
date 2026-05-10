import { COMPOSITION_RELATION_TYPES } from "./contracts/compositionRelationTypes.js";
import { WORKSPACE_HORIZONTAL_ZONES } from "./contracts/workspaceZones.js";

export function resolveCompositionRelations({ blocks, context = {} }) {
  const relations = [];
  const proposals = [];
  const contentBlocks = blocks.filter((block) => getBlockType(block) === "content");
  const sidebarBlocks = blocks.filter((block) => getBlockType(block) === "sidebar");
  const controlBlocks = blocks.filter((block) => getBlockType(block) === "control");
  const warningBlocks = blocks.filter((block) => getBlockType(block) === "warning");
  const unknownBlocks = blocks.filter((block) => getBlockType(block) === "unknown");
  const mainContent = findMainContentBlock(contentBlocks);

  for (const relationship of Array.isArray(context.relationships) ? context.relationships : []) {
    if (!relationship?.sourceId || !relationship?.targetId) {
      continue;
    }

    addRelation(relations, {
      type: normalizeRelationshipType(relationship.type),
      sourceId: relationship.sourceId,
      targetId: relationship.targetId,
      confidence: "strong",
      source: "runtime-snapshot",
      note: relationship.note ?? null
    });
  }

  for (const block of blocks.filter((item) => getBlockType(item) === "header")) {
    addRelation(
      relations,
      createRelation({
        type: COMPOSITION_RELATION_TYPES.HEADER_TO_WORKSPACE,
        sourceId: block.id,
        targetId: "workspace",
        confidence: block.edges.fullWidth ? "strong" : "medium"
      })
    );
  }

  for (const sidebar of sidebarBlocks) {
    const target = findNearestBlock(sidebar, contentBlocks);

    if (!target) {
      continue;
    }

    addRelation(
      relations,
      createRelation({
        type: COMPOSITION_RELATION_TYPES.CONTENT_WITH_SIDEBAR,
        sourceId: target.id,
        targetId: sidebar.id,
        confidence: sidebar.workspacePosition.horizontal === WORKSPACE_HORIZONTAL_ZONES.CENTER ? "medium" : "strong"
      })
    );
    proposals.push({
      type: "keep-sidebar-near-content",
      blockId: sidebar.id,
      targetId: target.id,
      message: "Держать sidebar рядом с основным content при адаптации."
    });
  }

  for (const control of controlBlocks) {
    const target = findExplicitOrNearestTarget(control, contentBlocks);

    if (!target) {
      continue;
    }

    addRelation(
      relations,
      createRelation({
        type: COMPOSITION_RELATION_TYPES.CONTROL_FOR_CONTENT,
        sourceId: control.id,
        targetId: target.id,
        confidence: control.dependencies.includes(target.id) ? "strong" : "weak"
      })
    );
    proposals.push({
      type: "bind-control-to-content",
      blockId: control.id,
      targetId: target.id,
      message: "Связать control с content, которым он управляет."
    });
  }

  for (const warning of warningBlocks) {
    const target = findExplicitOrNearestTarget(warning, contentBlocks) ?? mainContent;

    if (!target) {
      continue;
    }

    addRelation(
      relations,
      createRelation({
        type: COMPOSITION_RELATION_TYPES.WARNING_FOR_CONTENT,
        sourceId: warning.id,
        targetId: target.id,
        confidence: warning.dependencies.includes(target.id) ? "strong" : "weak"
      })
    );
    proposals.push({
      type: "bind-warning-to-content",
      blockId: warning.id,
      targetId: target.id,
      message: "Связать warning с content, к которому относится предупреждение."
    });
  }

  for (const block of unknownBlocks) {
    addRelation(
      relations,
      createRelation({
        type: COMPOSITION_RELATION_TYPES.UNKNOWN_NEEDS_ROLE,
        sourceId: block.id,
        targetId: null,
        confidence: "weak"
      })
    );
  }

  return {
    relations,
    proposals
  };
}

function createRelation({ type, sourceId, targetId, confidence, source = "inferred", note = null }) {
  return {
    type,
    sourceId: String(sourceId),
    targetId: targetId === null ? null : String(targetId),
    confidence,
    source,
    note
  };
}

function addRelation(relations, relation) {
  const normalizedRelation = createRelation(relation);
  const key = createRelationKey(normalizedRelation);

  if (relations.some((item) => createRelationKey(item) === key)) {
    return;
  }

  relations.push(normalizedRelation);
}

function createRelationKey(relation) {
  return `${relation.type}:${relation.sourceId}:${relation.targetId ?? ""}`;
}

function normalizeRelationshipType(type) {
  const normalizedType = String(type ?? "").toLowerCase();

  if (normalizedType === COMPOSITION_RELATION_TYPES.READS) {
    return COMPOSITION_RELATION_TYPES.READS;
  }

  if (normalizedType === COMPOSITION_RELATION_TYPES.WRITES) {
    return COMPOSITION_RELATION_TYPES.WRITES;
  }

  if (normalizedType === COMPOSITION_RELATION_TYPES.SELECTS) {
    return COMPOSITION_RELATION_TYPES.SELECTS;
  }

  if (normalizedType === COMPOSITION_RELATION_TYPES.CONTROLS) {
    return COMPOSITION_RELATION_TYPES.CONTROLS;
  }

  if (normalizedType === COMPOSITION_RELATION_TYPES.SUMMARIZES) {
    return COMPOSITION_RELATION_TYPES.SUMMARIZES;
  }

  return COMPOSITION_RELATION_TYPES.DEPENDS_ON;
}

function findMainContentBlock(blocks) {
  return [...blocks].sort((left, right) => getBlockArea(right) - getBlockArea(left))[0] ?? null;
}

function findExplicitOrNearestTarget(block, targets) {
  const explicitTarget = targets.find((target) => block.dependencies.includes(target.id));

  return explicitTarget ?? findNearestBlock(block, targets);
}

function findNearestBlock(block, targets) {
  return [...targets].sort((left, right) => getDistance(block, left) - getDistance(block, right))[0] ?? null;
}

function getDistance(left, right) {
  return (
    Math.abs(getCenterX(left) - getCenterX(right)) +
    Math.abs(getCenterY(left) - getCenterY(right))
  );
}

function getCenterX(block) {
  return Number(block.area.x) + Number(block.area.w) / 2;
}

function getCenterY(block) {
  return Number(block.area.y) + Number(block.area.h) / 2;
}

function getBlockArea(block) {
  return Number(block.area.w) * Number(block.area.h);
}

function getBlockType(block) {
  return String(block.contentSchema?.type ?? "unknown");
}
