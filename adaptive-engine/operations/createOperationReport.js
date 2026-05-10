// Создание отчета operation
// Формирует компактный диагностический отчет по результату applyOperation.

export function createOperationReport({
  valid,
  sourceItems = [],
  resultItems = [],
  operation,
  errors = [],
  rejection = null
}) {
  return {
    valid,
    type: operation?.type ?? null,
    targetId: operation?.targetId ?? null,
    rejected: Boolean(rejection),
    rejectionCode: rejection?.code ?? null,
    canSuggest: Boolean(rejection?.canSuggest),
    changed: hasItemsChanged(sourceItems, resultItems),
    beforeCount: sourceItems.length,
    afterCount: resultItems.length,
    errors: errors.length,
    errorsByType: countErrorsByType(errors)
  };
}

function hasItemsChanged(sourceItems, resultItems) {
  return JSON.stringify(sourceItems) !== JSON.stringify(resultItems);
}

function countErrorsByType(errors) {
  return errors.reduce((accumulator, error) => {
    const type = error.type ?? "UNKNOWN_OPERATION_ERROR";
    accumulator[type] = (accumulator[type] ?? 0) + 1;

    return accumulator;
  }, {});
}
