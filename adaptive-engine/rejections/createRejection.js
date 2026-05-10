import { REJECTION_ERRORS } from "./rejectionErrorCodes.js";

// Create Rejection
// Создает единый объект отказа без попытки автоматически чинить layout.

export function createRejection({
  code = REJECTION_ERRORS.UNKNOWN_REJECTION,
  message = null,
  source = "adaptive-engine",
  targetId = null,
  blockerId = null,
  details = {},
  canSuggest = false,
  canAutoFix = false
} = {}) {
  return {
    valid: false,
    rejected: true,
    code,
    message: message ?? String(code),
    source,
    targetId,
    blockerId,
    details,
    canSuggest: Boolean(canSuggest),
    canAutoFix: Boolean(canAutoFix)
  };
}
