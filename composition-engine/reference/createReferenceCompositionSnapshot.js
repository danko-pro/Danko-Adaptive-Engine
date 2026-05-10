export function createReferenceCompositionSnapshot({ blocks = [], groups = [], relations = [], context = {}, workspace = null } = {}) {
  const referenceBlocks = blocks.map(createReferenceBlock).sort(compareBlocks);
  const horizontalGaps = createAxisGaps({
    blocks: referenceBlocks,
    axis: "horizontal"
  });
  const verticalGaps = createAxisGaps({
    blocks: referenceBlocks,
    axis: "vertical"
  });

  return {
    type: "reference-composition-snapshot",
    version: "0.1.0",
    source: {
      columns: normalizeNumber(context.metrics?.columns),
      rows: normalizeNumber(context.metrics?.rows),
      workspaceState: context.workspaceState ?? null,
      activeRoute: context.activeRoute ?? null,
      workspaceId: context.workspaceId ?? null
    },
    workspace,
    blockCount: referenceBlocks.length,
    groupCount: groups.length,
    relationCount: relations.length,
    blocks: referenceBlocks,
    groups: groups.map(createReferenceGroup),
    relations: relations.map(createReferenceRelation),
    gaps: {
      horizontal: horizontalGaps,
      vertical: verticalGaps
    }
  };
}

function createReferenceBlock(block) {
  return {
    id: String(block.id),
    type: String(block.contentSchema?.type ?? "unknown"),
    role: block.role ?? null,
    area: {
      x: Number(block.area.x),
      y: Number(block.area.y),
      w: Number(block.area.w),
      h: Number(block.area.h),
      right: Number(block.area.right),
      bottom: Number(block.area.bottom)
    },
    anchors: createAnchors(block),
    workspacePosition: block.workspacePosition ?? null,
    dependencies: Array.isArray(block.dependencies) ? block.dependencies.map(String) : []
  };
}

function createReferenceGroup(group) {
  return {
    id: String(group.id),
    type: group.type,
    blockIds: Array.isArray(group.blockIds) ? group.blockIds.map(String) : [],
    roles: Array.isArray(group.roles) ? [...group.roles] : [],
    contentTypes: Array.isArray(group.contentTypes) ? [...group.contentTypes] : [],
    bounds: group.bounds ? { ...group.bounds } : null,
    density: group.density ? { ...group.density } : null
  };
}

function createReferenceRelation(relation) {
  return {
    type: relation.type,
    sourceId: relation.sourceId,
    targetId: relation.targetId,
    confidence: relation.confidence,
    source: relation.source ?? null
  };
}

function createAnchors(block) {
  const anchors = [];

  if (block.edges?.left) {
    anchors.push("left");
  }

  if (block.edges?.right) {
    anchors.push("right");
  }

  if (block.edges?.top) {
    anchors.push("top");
  }

  if (block.edges?.bottom) {
    anchors.push("bottom");
  }

  if (block.edges?.fullWidth) {
    anchors.push("full-width");
  }

  if (block.edges?.fullHeight) {
    anchors.push("full-height");
  }

  return anchors;
}

function createAxisGaps({ blocks, axis }) {
  const gaps = [];

  for (const source of blocks) {
    const candidates = blocks
      .filter((target) => source.id !== target.id)
      .map((target) => createGap({ source, target, axis }))
      .filter(Boolean)
      .sort((left, right) => left.gap - right.gap);

    const before = candidates.find((gap) => gap.direction === "before");
    const after = candidates.find((gap) => gap.direction === "after");

    if (before) {
      gaps.push(before);
    }

    if (after) {
      gaps.push(after);
    }
  }

  return dedupeGaps(gaps).sort(compareGaps);
}

function createGap({ source, target, axis }) {
  if (axis === "horizontal") {
    if (!rangesOverlap(source.area.y, source.area.bottom, target.area.y, target.area.bottom)) {
      return null;
    }

    if (target.area.right < source.area.x) {
      return {
        axis,
        direction: "before",
        fromId: target.id,
        toId: source.id,
        gap: source.area.x - target.area.right - 1
      };
    }

    if (source.area.right < target.area.x) {
      return {
        axis,
        direction: "after",
        fromId: source.id,
        toId: target.id,
        gap: target.area.x - source.area.right - 1
      };
    }

    return null;
  }

  if (!rangesOverlap(source.area.x, source.area.right, target.area.x, target.area.right)) {
    return null;
  }

  if (target.area.bottom < source.area.y) {
    return {
      axis,
      direction: "before",
      fromId: target.id,
      toId: source.id,
      gap: source.area.y - target.area.bottom - 1
    };
  }

  if (source.area.bottom < target.area.y) {
    return {
      axis,
      direction: "after",
      fromId: source.id,
      toId: target.id,
      gap: target.area.y - source.area.bottom - 1
    };
  }

  return null;
}

function dedupeGaps(gaps) {
  const seen = new Set();
  const result = [];

  for (const gap of gaps) {
    const key = `${gap.axis}:${gap.fromId}:${gap.toId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(gap);
  }

  return result;
}

function compareBlocks(left, right) {
  if (left.area.y !== right.area.y) {
    return left.area.y - right.area.y;
  }

  return left.area.x - right.area.x;
}

function compareGaps(left, right) {
  if (left.axis !== right.axis) {
    return left.axis.localeCompare(right.axis);
  }

  if (left.fromId !== right.fromId) {
    return left.fromId.localeCompare(right.fromId);
  }

  return left.toId.localeCompare(right.toId);
}

function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return Number(firstStart) <= Number(secondEnd) && Number(secondStart) <= Number(firstEnd);
}

function normalizeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}
