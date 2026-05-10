import { spawn } from "node:child_process";
import path from "node:path";

const checks = [
  ["check:imports", "Проверка границ импортов", "safety-system/checkImportBoundaries.js"],
  ["check:engine-structure", "Проверка структуры движка", "safety-system/checkEngineStructure.js"],
  ["check:engine-freeze", "Проверка заморозки движка", "safety-system/checkEngineFreeze.js"],
  ["check:v1-guardrails", "Проверка защитных правил V1", "safety-system/checkV1Guardrails.js"],
  ["test:area", "Тесты слоя area", "adaptive-engine/tests/areaCases.js"],
  ["test:fitting", "Тесты слоя fitting", "adaptive-engine/tests/fittingCases.js"],
  ["test:grid", "Тесты расчета сетки", "adaptive-engine/tests/gridMetricsCases.js"],
  ["test:grid-mode", "Тесты режимов сетки", "adaptive-engine/tests/gridModeCases.js"],
  ["test:grid-rules", "Тесты правил сетки", "adaptive-engine/tests/gridRulesResolveCases.js"],
  ["test:workspace-state", "Тесты состояния рабочей области", "adaptive-engine/tests/workspaceStateCases.js"],
  ["test:metrics-validation", "Тесты валидации метрик сетки", "adaptive-engine/tests/gridMetricsValidationCases.js"],
  ["test:coordinates", "Тесты координатной системы", "adaptive-engine/tests/gridCoordinateCases.js"],
  ["test:constraints", "Тесты ограничений", "adaptive-engine/tests/constraintCases.js"],
  ["test:intents", "Тесты намерений", "adaptive-engine/tests/intentCases.js"],
  ["test:layout", "Тесты валидации layout", "adaptive-engine/tests/layoutValidationCases.js"],
  ["test:resolve", "Тесты разрешения layout", "adaptive-engine/tests/layoutResolveCases.js"],
  ["test:report", "Тесты отчетов layout", "adaptive-engine/tests/layoutReportCases.js"],
  ["test:process", "Тесты обработки layout", "adaptive-engine/tests/layoutProcessCases.js"],
  ["test:snapshot", "Тесты снимка движка", "adaptive-engine/tests/engineSnapshotCases.js"],
  ["test:engine-result", "Тесты результата движка", "adaptive-engine/tests/engineResultCases.js"],
  ["test:diagnostics", "Тесты диагностики", "adaptive-engine/tests/diagnosticsCases.js"],
  ["test:operations", "Тесты операций", "adaptive-engine/tests/operationCases.js"],
  ["test:placement", "Тесты размещения", "adaptive-engine/tests/placementCases.js"],
  ["test:rejections", "Тесты отказов", "adaptive-engine/tests/rejectionCases.js"],
  ["test:selection", "Тесты выбора", "adaptive-engine/tests/selectionCases.js"],
  ["test:adapter-fit", "Тесты защитной подгонки adapter", "engine-adapter/tests/fitItemsToGridCommandCases.js"],
  ["test:adapter-handoff", "Проверка границы передачи V2", "engine-adapter/tests/behaviorHandoffCases.js"],
  ["test:adapter-composition", "Проверка отказа V2 на уровне adapter", "engine-adapter/tests/compositionPlanCommandCases.js"],
  ["test:adapter-composition-fix", "Проверка ручного V2 fix на уровне adapter", "engine-adapter/tests/compositionFixCommandCases.js"],
  ["test:runtime", "Проверка runtime-моста", "engine-runtime/tests/runtimeBridgeCases.js"],
  ["test:runtime-candidate", "Проверка runtime-кандидатов V2", "engine-runtime/tests/runtimeCandidateCases.js"],
  ["test:composition", "Тесты V2 composition-engine", "composition-engine/tests/compositionPlanCases.js"],
  ["test:navigation", "Тесты V3 navigation-engine", "navigation-engine/tests/navigationPlanCases.js"],
  ["build", "Сборка тестового UI", "node_modules/vite/bin/vite.js", "build"]
];

console.log("Система безопасности: запускаю полный цикл проверки проекта.");

try {
  for (const [checkName, title, entryPath, ...args] of checks) {
    await runCheck(checkName, title, entryPath, args);
  }

  console.log("\nГотово: проверка прошла, ошибок нет.");
} catch (error) {
  console.error(`\nПроверка остановлена: ${error.message}`);
  process.exit(1);
}

function runCheck(checkName, title, entryPath, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n> Проверка: ${title}`);
    console.log(`> safety check: ${checkName}`);

    const child = spawn(process.execPath, [path.resolve(process.cwd(), entryPath), ...args], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false
    });

    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        console.log(`Пройдено: ${title}`);
        resolve();
        return;
      }

      reject(new Error(`${title} завершилась с кодом ${exitCode}`));
    });
  });
}
