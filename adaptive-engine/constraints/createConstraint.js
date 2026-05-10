// Create Constraint
// Создает базовое описание ограничений для области.

export function createConstraint(input = {}) {
  return {
    id: input.id ?? null,
    minW: input.minW ?? 1,
    minH: input.minH ?? 1,
    maxW: input.maxW ?? null,
    maxH: input.maxH ?? null,
    canMove: input.canMove ?? true,
    canResize: input.canResize ?? true
  };
}
