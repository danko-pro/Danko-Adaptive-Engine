// Area creator
// Создает безопасную область { x, y, w, h } из raw-значений.

export function createArea(input = {}) {
  return {
    x: toTrack(input.x, 1),
    y: toTrack(input.y, 1),
    w: toTrack(input.w, 1),
    h: toTrack(input.h, 1)
  };
}

function toTrack(value, fallback) {
  const number = Number.parseFloat(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(Math.floor(number), 1);
}
