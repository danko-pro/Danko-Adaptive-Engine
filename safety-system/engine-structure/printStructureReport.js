export function printStructureReport({ result, assistantCount, traceEnabled }) {
  if (traceEnabled) {
    printTrace(result.trace);
  }

  if (result.errors.length > 0) {
    console.error("Проверка структуры движка не прошла.");
    console.error("engine structure check failed");
    printIssues("Ошибки", "errors", result.errors);
    printIssues("Предупреждения", "warnings", result.warnings);
    return false;
  }

  console.log(
    `Структура движка в порядке: слоев ${assistantCount}, проверок ${result.checks}, предупреждений ${result.warnings.length}.`
  );
  console.log(
    `engine structure check passed: assistants ${assistantCount}, checks ${result.checks}, warnings ${result.warnings.length}`
  );

  if (result.warnings.length > 0) {
    printIssues("Предупреждения", "warnings", result.warnings);
  }

  return true;
}

function printTrace(trace) {
  console.log("Трассировка структуры движка");
  console.log("engine structure trace");

  for (const entry of trace) {
    console.log(`${entry.assistant} > ${entry.label} > ${entry.target} > ${entry.status}`);
  }
}

function printIssues(russianTitle, technicalTitle, issues) {
  if (issues.length === 0) {
    return;
  }

  console.error(`${russianTitle}:`);
  console.error(`${technicalTitle}:`);

  for (const issue of issues) {
    console.error(`- ${issue.assistant}: ${issue.message}`);
  }
}
