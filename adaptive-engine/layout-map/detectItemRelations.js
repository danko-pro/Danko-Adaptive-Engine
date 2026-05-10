// Ищет отношения между блоками: кто справа, слева, выше или ниже.
// Сейчас это не автолейаут, а снимок связей, на который позже можно опереться.

export function detectItemRelations(items) {
  const relations = [];

  for (const source of items) {
    relations.push(...detectNearestRelations(source, items));
  }

  return relations;
}

function detectNearestRelations(source, items) {
  const candidates = {
    left: null,
    right: null,
    top: null,
    bottom: null
  };

  for (const target of items) {
    if (String(source.id) === String(target.id)) {
      continue;
    }

    updateHorizontalCandidate(candidates, source, target);
    updateVerticalCandidate(candidates, source, target);
  }

  return Object.values(candidates).filter(Boolean);
}

function updateHorizontalCandidate(candidates, source, target) {
  const sourceRight = source.x + source.w - 1;
  const targetRight = target.x + target.w - 1;
  const overlapsY = rangesOverlap(source.y, source.y + source.h - 1, target.y, target.y + target.h - 1);

  if (!overlapsY) {
    return;
  }

  if (targetRight < source.x) {
    const gap = source.x - targetRight - 1;
    candidates.left = chooseNearest(candidates.left, {
      type: "left-neighbor",
      from: source.id,
      to: target.id,
      gap
    });
  }

  if (target.x > sourceRight) {
    const gap = target.x - sourceRight - 1;
    candidates.right = chooseNearest(candidates.right, {
      type: "right-neighbor",
      from: source.id,
      to: target.id,
      gap
    });
  }
}

function updateVerticalCandidate(candidates, source, target) {
  const sourceRight = source.x + source.w - 1;
  const sourceBottom = source.y + source.h - 1;
  const targetRight = target.x + target.w - 1;
  const targetBottom = target.y + target.h - 1;
  const overlapsX = rangesOverlap(source.x, sourceRight, target.x, targetRight);

  if (!overlapsX) {
    return;
  }

  if (targetBottom < source.y) {
    const gap = source.y - targetBottom - 1;
    candidates.top = chooseNearest(candidates.top, {
      type: "top-neighbor",
      from: source.id,
      to: target.id,
      gap
    });
  }

  if (target.y > sourceBottom) {
    const gap = target.y - sourceBottom - 1;
    candidates.bottom = chooseNearest(candidates.bottom, {
      type: "bottom-neighbor",
      from: source.id,
      to: target.id,
      gap
    });
  }
}

function chooseNearest(current, candidate) {
  if (!current || candidate.gap < current.gap) {
    return candidate;
  }

  return current;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA <= endB && startB <= endA;
}
