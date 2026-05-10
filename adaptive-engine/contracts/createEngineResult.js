// Контракт результата движка
// Создает стабильную публичную форму результата для host-проектов.

export function createEngineResult({
  valid = false,
  action = null,
  data = null,
  errors = [],
  rejection = null,
  report = null,
  meta = {},
  details = {}
} = {}) {
  const normalizedErrors = Array.isArray(errors) ? errors : [];

  return {
    valid: Boolean(valid),
    rejected: Boolean(rejection),
    action,
    data,
    errors: normalizedErrors,
    rejection,
    report,
    meta: {
      errors: normalizedErrors.length,
      ...meta
    },
    details
  };
}
