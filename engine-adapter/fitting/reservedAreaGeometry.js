export function createReservedAreaBlocks(reservedArea, metrics) {
  const columns = normalizeLimit(metrics?.columns);
  const rows = normalizeLimit(metrics?.rows);
  const area = normalizeReservedArea(reservedArea);
  const blocks = [];

  if (columns < 1 || rows < 1) {
    return blocks;
  }

  if (area.left > 0) {
    blocks.push(createBlock("__reserved-left", 1, 1, area.left, rows));
  }

  if (area.right > 0) {
    blocks.push(createBlock("__reserved-right", columns - area.right + 1, 1, area.right, rows));
  }

  if (area.top > 0) {
    blocks.push(createBlock("__reserved-top", 1, 1, columns, area.top));
  }

  if (area.bottom > 0) {
    blocks.push(createBlock("__reserved-bottom", 1, rows - area.bottom + 1, columns, area.bottom));
  }

  return blocks;
}

export function validateItemsAgainstReservedArea({
  items = [],
  metrics,
  reservedArea,
  reservedItemIds = []
} = {}) {
  const reservedBlocks = createReservedAreaBlocks(reservedArea, metrics);
  const allowedIds = new Set(reservedItemIds.map(String));

  if (reservedBlocks.length === 0) {
    return {
      valid: true,
      errors: []
    };
  }

  const errors = [];

  for (const item of Array.isArray(items) ? items : []) {
    if (allowedIds.has(String(item?.id))) {
      continue;
    }

    const reservedBlock = reservedBlocks.find((block) => detectAreaCollision(block, item));

    if (!reservedBlock) {
      continue;
    }

    errors.push({
      type: "NO_SPACE_AFTER_FIXED_SIDEBAR",
      itemId: item?.id ?? null,
      details: {
        reservedBlockId: reservedBlock.id
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function createBlock(id, x, y, w, h) {
  return {
    id,
    x,
    y,
    w,
    h
  };
}

function normalizeReservedArea(reservedArea) {
  return {
    left: normalizeSize(reservedArea?.left),
    right: normalizeSize(reservedArea?.right),
    top: normalizeSize(reservedArea?.top),
    bottom: normalizeSize(reservedArea?.bottom)
  };
}

function normalizeLimit(value) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function normalizeSize(value) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function detectAreaCollision(firstItem, secondItem) {
  const firstRight = Number(firstItem.x) + Number(firstItem.w) - 1;
  const firstBottom = Number(firstItem.y) + Number(firstItem.h) - 1;
  const secondRight = Number(secondItem.x) + Number(secondItem.w) - 1;
  const secondBottom = Number(secondItem.y) + Number(secondItem.h) - 1;

  return !(
    firstRight < Number(secondItem.x) ||
    secondRight < Number(firstItem.x) ||
    firstBottom < Number(secondItem.y) ||
    secondBottom < Number(firstItem.y)
  );
}
