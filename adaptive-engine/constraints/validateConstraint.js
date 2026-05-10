import { CONSTRAINT_ERRORS } from "./constraintErrorCodes.js";

// Validate Constraint
// Проверяет, что ограничение области описано в понятной для движка форме.

export function validateConstraint(constraint) {
  if (!constraint || typeof constraint !== "object") {
    return {
      valid: false,
      error: CONSTRAINT_ERRORS.INVALID_CONSTRAINT
    };
  }

  if (!isPositiveNumber(constraint.minW) || !isPositiveNumber(constraint.minH)) {
    return {
      valid: false,
      error: CONSTRAINT_ERRORS.INVALID_LIMITS
    };
  }

  if (constraint.maxW !== null && !isPositiveNumber(constraint.maxW)) {
    return {
      valid: false,
      error: CONSTRAINT_ERRORS.INVALID_LIMITS
    };
  }

  if (constraint.maxH !== null && !isPositiveNumber(constraint.maxH)) {
    return {
      valid: false,
      error: CONSTRAINT_ERRORS.INVALID_LIMITS
    };
  }

  if (constraint.maxW !== null && constraint.maxW < constraint.minW) {
    return {
      valid: false,
      error: CONSTRAINT_ERRORS.INVALID_LIMITS
    };
  }

  if (constraint.maxH !== null && constraint.maxH < constraint.minH) {
    return {
      valid: false,
      error: CONSTRAINT_ERRORS.INVALID_LIMITS
    };
  }

  return {
    valid: true,
    error: null
  };
}

function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}
