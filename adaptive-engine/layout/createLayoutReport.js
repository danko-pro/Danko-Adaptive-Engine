// Layout report creator
// Формирует диагностический отчет по результату resolveLayoutItems.

export function createLayoutReport(resolveResult, sourceItems = []) {
  const errorsByType = countErrorsByType(resolveResult.errors);

  return {
    valid: resolveResult.valid,
    summary: {
      total: sourceItems.length,
      resolved: resolveResult.items.length,
      errors: resolveResult.errors.length
    },
    errorsByType,
    errors: resolveResult.errors
  };
}

function countErrorsByType(errors) {
  return errors.reduce((accumulator, error) => {
    accumulator[error.type] = (accumulator[error.type] ?? 0) + 1;

    return accumulator;
  }, {});
}
