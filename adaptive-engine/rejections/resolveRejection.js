import { createRejection } from "./createRejection.js";
import { explainRejection } from "./explainRejection.js";
import { REJECTION_ERRORS } from "./rejectionErrorCodes.js";

// Resolve Rejection
// Собирает отказ из ошибки/конфликта другого слоя в единый формат движка.

export function resolveRejection(input = {}) {
  const code = normalizeCode(input.code ?? input.type ?? input.error);
  const details = {
    ...(input.details ?? {}),
    targetId: input.targetId ?? input.details?.targetId ?? null,
    blockerId: input.blockerId ?? input.details?.blockerId ?? null
  };

  return createRejection({
    code,
    message: input.message ?? explainRejection(code, details),
    source: input.source ?? "adaptive-engine",
    targetId: details.targetId,
    blockerId: details.blockerId,
    details,
    canSuggest: input.canSuggest ?? canSuggestForCode(code),
    canAutoFix: input.canAutoFix ?? false
  });
}

function normalizeCode(code) {
  if (Object.values(REJECTION_ERRORS).includes(code)) {
    return code;
  }

  return REJECTION_ERRORS.UNKNOWN_REJECTION;
}

function canSuggestForCode(code) {
  return [
    REJECTION_ERRORS.AREA_COLLISION,
    REJECTION_ERRORS.AREA_OUT_OF_BOUNDS,
    REJECTION_ERRORS.NO_FREE_SPACE
  ].includes(code);
}
