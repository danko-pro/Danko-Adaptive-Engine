import { CONSTRAINT_ERRORS } from "./constraintErrorCodes.js";
import { createConstraint } from "./createConstraint.js";
import { validateConstraint } from "./validateConstraint.js";

// Resolve Constraint
// Применяет ограничение к области и возвращает понятный результат без падения.

export function resolveConstraint(area, inputConstraint = {}) {
  const constraint = createConstraint(inputConstraint);
  const validation = validateConstraint(constraint);
  const proposedArea = {
    ...area,
    ...(inputConstraint.nextArea ?? {}),
    x: inputConstraint.nextX ?? inputConstraint.nextArea?.x ?? area.x,
    y: inputConstraint.nextY ?? inputConstraint.nextArea?.y ?? area.y,
    w: inputConstraint.nextW ?? inputConstraint.nextArea?.w ?? area.w,
    h: inputConstraint.nextH ?? inputConstraint.nextArea?.h ?? area.h
  };

  if (!validation.valid) {
    return {
      valid: false,
      changed: false,
      area,
      constraint,
      error: validation.error
    };
  }

  if (!constraint.canMove && proposedArea.x !== area.x) {
    return createRejectedResult(area, constraint, CONSTRAINT_ERRORS.MOVE_LOCKED);
  }

  if (!constraint.canMove && proposedArea.y !== area.y) {
    return createRejectedResult(area, constraint, CONSTRAINT_ERRORS.MOVE_LOCKED);
  }

  if (!constraint.canResize && proposedArea.w !== area.w) {
    return createRejectedResult(area, constraint, CONSTRAINT_ERRORS.RESIZE_LOCKED);
  }

  if (!constraint.canResize && proposedArea.h !== area.h) {
    return createRejectedResult(area, constraint, CONSTRAINT_ERRORS.RESIZE_LOCKED);
  }

  const nextArea = {
    ...proposedArea,
    w: clampSize(proposedArea.w, constraint.minW, constraint.maxW),
    h: clampSize(proposedArea.h, constraint.minH, constraint.maxH)
  };

  const error = resolveSizeError(proposedArea, nextArea, constraint);

  return {
    valid: error === null,
    changed: nextArea.x !== area.x || nextArea.y !== area.y || nextArea.w !== area.w || nextArea.h !== area.h,
    area: nextArea,
    constraint,
    error
  };
}

function createRejectedResult(area, constraint, error) {
  return {
    valid: false,
    changed: false,
    area,
    constraint,
    error
  };
}

function clampSize(value, min, max) {
  const limitedByMin = Math.max(value, min);
  return max === null ? limitedByMin : Math.min(limitedByMin, max);
}

function resolveSizeError(area, nextArea, constraint) {
  if (area.w < constraint.minW || area.h < constraint.minH) {
    return CONSTRAINT_ERRORS.AREA_BELOW_MIN_SIZE;
  }

  if (
    (constraint.maxW !== null && area.w > constraint.maxW) ||
    (constraint.maxH !== null && area.h > constraint.maxH)
  ) {
    return CONSTRAINT_ERRORS.AREA_ABOVE_MAX_SIZE;
  }

  if (nextArea.w < constraint.minW || nextArea.h < constraint.minH) {
    return CONSTRAINT_ERRORS.AREA_BELOW_MIN_SIZE;
  }

  return null;
}
