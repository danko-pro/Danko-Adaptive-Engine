export function resolveSidebarMobileButtonRelativeArea({
  absoluteArea,
  renderArea
} = {}) {
  const absolute = normalizeArea(absoluteArea);
  const render = normalizeArea(renderArea);

  if (!absolute || !render) {
    return null;
  }

  const w = Math.min(absolute.w, render.w);
  const h = Math.min(absolute.h, render.h);
  const x = clampNumber(absolute.x, render.x, render.x + render.w - w);
  const y = clampNumber(absolute.y, render.y, render.y + render.h - h);

  return {
    x: x - render.x + 1,
    y: y - render.y + 1,
    w,
    h
  };
}

export function resolveSidebarMobileButtonAbsoluteArea({
  relativeArea,
  renderArea
} = {}) {
  const relative = normalizeArea(relativeArea);
  const render = normalizeArea(renderArea);

  if (!relative || !render) {
    return null;
  }

  const relativeAreaClamped = resolveSidebarMobileButtonRelativeArea({
    absoluteArea: {
      x: render.x + relative.x - 1,
      y: render.y + relative.y - 1,
      w: relative.w,
      h: relative.h
    },
    renderArea: render
  });

  if (!relativeAreaClamped) {
    return null;
  }

  return {
    x: render.x + relativeAreaClamped.x - 1,
    y: render.y + relativeAreaClamped.y - 1,
    w: relativeAreaClamped.w,
    h: relativeAreaClamped.h
  };
}

function normalizeArea(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const area = {
    x: normalizeGridNumber(value.x),
    y: normalizeGridNumber(value.y),
    w: normalizeGridNumber(value.w),
    h: normalizeGridNumber(value.h)
  };

  if ([area.x, area.y, area.w, area.h].some((number) => number === null)) {
    return null;
  }

  return {
    x: Math.max(1, area.x),
    y: Math.max(1, area.y),
    w: Math.max(1, area.w),
    h: Math.max(1, area.h)
  };
}

function normalizeGridNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.round(number) : null;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
