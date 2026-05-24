import { spawn } from "node:child_process";
import path from "node:path";

const checks = [
  ["check:imports", "Проверка границ импортов", "safety-system/checkImportBoundaries.js"],
  ["check:src-layer", "Проверка слоя src", "safety-system/checkSrcLayerImports.js"],
  ["check:script-parity", "Проверка parity package.json и runAllChecks", "safety-system/checkScriptParity.js"],
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
  ["test:layout-map", "Тесты карты layout", "adaptive-engine/tests/layoutMapCases.js"],
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
  ["test:adapter-scene-occupancy", "Тесты layout occupancy fixed sidebar", "engine-adapter/tests/sceneLayoutOccupancyCases.js"],
  ["test:adapter-feedback", "Тесты сообщений adapter", "engine-adapter/tests/adapterFeedbackCases.js"],
  ["test:adapter-source-projection", "Тесты source/projection contract adapter", "engine-adapter/tests/sceneSourceProjectionStateCases.js"],
  ["test:adapter-project-scene", "Тесты project scene adapter", "engine-adapter/tests/projectSceneStateCases.js"],
  ["test:adapter-pointer", "Тесты pointer-операций adapter", "engine-adapter/tests/pointerOperationAdapterCases.js"],
  ["test:adapter-sidebar-matrix", "Матрица состояний sidebar adapter", "engine-adapter/tests/sidebarStateBehaviorMatrixCases.js"],
  ["test:adapter-handoff", "Проверка границы передачи V2", "engine-adapter/tests/behaviorHandoffCases.js"],
  ["test:adapter-navigation", "Проверка navigation host adapter", "engine-adapter/tests/navigationHostStateCases.js"],
  ["test:adapter-navigation-page", "Проверка adapter создания navigation page", "engine-adapter/tests/navigationPageCommandCases.js"],
  ["test:adapter-page-transition", "Проверка adapter page transition contract", "engine-adapter/tests/pageTransitionStateCases.js"],
  ["test:adapter-sidebar-content-action", "Проверка adapter action внутренних sidebar-кнопок", "engine-adapter/tests/sidebarContentNavigationActionCases.js"],
  ["test:adapter-navigation-sidebar-content", "Проверка adapter navigation -> sidebar content", "engine-adapter/tests/navigationSidebarContentCases.js"],
  ["test:adapter-content-schemas", "Проверка adapter content schemas", "engine-adapter/tests/contentSchemasFromItemsCases.js"],
  ["test:adapter-composition", "Проверка отказа V2 на уровне adapter", "engine-adapter/tests/compositionPlanCommandCases.js"],
  ["test:adapter-composition-fix", "Проверка ручного V2 fix на уровне adapter", "engine-adapter/tests/compositionFixCommandCases.js"],
  ["test:adapter-scene-gateway", "Тесты scene gateway adapter", "engine-adapter/tests/sceneOperationGatewayCases.js"],
  ["test:adapter-scene-wrappers", "Тесты scene command wrappers", "engine-adapter/tests/sceneCommandWrapperCases.js"],
  ["test:layout-relations", "Тесты layout relation contract", "engine-adapter/layout-relations/layoutRelationCases.js"],
  ["test:layout-relation-projection", "Тесты layout relation projection", "engine-adapter/layout-relations/layoutRelationProjectionCases.js"],
  ["test:layout-relation-projection-command", "Тесты layout relation projection adapter command", "engine-adapter/layout-relations/layoutRelationProjectionCommandCases.js"],
  ["test:layout-relation-manual-area", "Тесты layout relation manual area command", "engine-adapter/layout-relations/layoutRelationManualAreaCommandCases.js"],
  ["test:layout-relation-manual-target", "Тесты layout relation manual target resolver", "engine-adapter/layout-relations/layoutRelationManualTargetCases.js"],
  ["test:layout-relation-child-order", "Тесты role-based порядка layout relation children", "engine-adapter/layout-relations/layoutRelationChildOrderCases.js"],
  ["test:layout-relation-child-order-viewport", "Тесты viewport-specific порядка layout relation children", "engine-adapter/layout-relations/layoutRelationChildOrderForViewportCases.js"],
  ["test:sidebar-element", "Тесты sidebar-element", "sidebar-element/tests/sidebarElementFacadeCases.js"],
  ["test:debug-source-state", "Тесты source/projection debug state", "src/editor-surface/operations/operationProbeSourceStateCases.js"],
  ["test:debug-relation-projection", "Тесты debug relation projection bridge", "src/editor-surface/operations/resolveOperationRelationProjectionCases.js"],
  ["test:debug-relation-manual-move", "Тесты relation manual move bridge", "src/editor-surface/operations/resolveRelationManualMoveCommandCases.js"],
  ["test:debug-relation-manual-resize", "Тесты relation manual resize bridge", "src/editor-surface/operations/resolveRelationManualResizeCommandCases.js"],
  ["test:debug-navigation-project-scene", "Тесты debug navigation project scene", "src/editor-surface/navigation/navigationProbeProjectSceneCases.js"],
  ["test:debug-render-layers", "Тесты debug render layers", "sidebar-element/tests/resolveOperationRenderLayersCases.js"],
  ["test:debug-sidebar-internal-grid", "Тесты внутренней сетки sidebar", "src/editor-surface/operations/resolveSidebarInternalGridStyleCases.js"],
  ["test:debug-menu-position", "Тесты позиционирования debug menu", "src/editor-surface/operations/resolveOperationMenuPositionCases.js"],
  ["test:debug-menu-interaction", "Тесты поведения debug menu", "src/editor-surface/operations/operationMenuInteractionCases.js"],
  ["test:debug-internal-selection", "Тесты внутреннего выбора sidebar", "src/editor-surface/operations/operationInternalSelectionCases.js"],
  ["test:debug-flags", "Тесты debug flags dev/prod профилей", "src/editor-surface/config/resolveDebugFlagsCases.js"],
  ["test:app-surface", "Тесты выбора app surface dev/prod", "src/app/resolveAppSurfaceModeCases.js"],
  ["test:mobile-sidebar-runtime", "Тесты runtime state mobile sidebar", "sidebar-element/tests/mobileSidebarRuntimeStateCases.js"],
  ["test:mobile-sidebar-presentation", "Тесты mobile sidebar presentation UI", "src/editor-surface/operations/mobileSidebarPresentationCases.js"],
  ["test:mobile-sidebar-panel", "Тесты compact mobile sidebar panel", "sidebar-element/tests/mobileSidebarMenuPanelStateCases.js"],
  ["test:mobile-sidebar-button-activation", "Тесты delayed compact mobile sidebar button activation", "sidebar-element/tests/mobileSidebarButtonActivationStateCases.js"],
  ["test:mobile-sidebar-button-edit-mode", "Тесты compact mobile sidebar button edit mode", "sidebar-element/tests/mobileSidebarButtonEditModeStateCases.js"],
  ["test:mobile-sidebar-button-area", "Тесты compact mobile sidebar button area", "engine-adapter/tests/sidebarMobileButtonAreaOperationCases.js"],
  ["test:icon-strip-contract", "Тесты контракта icon strip (мир 3)", "sidebar-element/tests/iconStripContractCases.js"],
  ["test:mobile-icon-strip-content", "Тесты resolve/write icon strip content", "sidebar-element/tests/mobileIconStripContentCases.js"],
  ["test:mobile-icon-strip-bar-area", "Тесты mobile icon strip shell barArea", "engine-adapter/tests/sidebarIconStripBarAreaOperationCases.js"],
  ["test:icon-strip-shell-viewport", "Тесты icon strip shell viewport transition", "sidebar-element/tests/iconStripShellViewportTransitionCases.js"],
  ["test:mobile-icon-strip-presentation", "Тесты presentation icon strip item", "sidebar-element/tests/mobileIconStripItemPresentationCases.js"],
  ["test:mobile-icon-strip-area", "Тесты grid-area icon strip item", "sidebar-element/tests/mobileIconStripItemAreaStyleCases.js"],
  ["test:mobile-icon-strip-settings", "Тесты chrome настроек icon strip", "sidebar-element/tests/mobileIconStripSettingsChromeCases.js"],
  ["test:mobile-sidebar-render-strategy", "Тесты переключателя mobile render strategy", "sidebar-element/tests/mobileSidebarRenderStrategyToggleCases.js"],
  ["test:sidebar-pointer", "Тесты sidebar internal pointer geometry", "sidebar-element/tests/sidebarContentItemPointerOperationCases.js"],
  ["test:sidebar-operation-items", "Тесты sidebar content operation source items", "src/editor-surface/operations/resolveSidebarContentOperationItemsCases.js"],
  ["test:sidebar-button-state", "Тесты sidebar content button state", "sidebar-element/tests/resolveSidebarContentButtonStateCases.js"],
  ["test:sidebar-number-field", "Тесты sidebar number field draft input", "src/editor-surface/operations/sidebarNumberFieldDraftCases.js"],
  ["test:runtime", "Проверка runtime-моста", "engine-runtime/tests/runtimeBridgeCases.js"],
  ["test:runtime-candidate", "Проверка runtime-кандидатов V2", "engine-runtime/tests/runtimeCandidateCases.js"],
  ["test:composition-behavior", "Тесты профилей поведения V2", "composition-engine/tests/compositionBehaviorCases.js"],
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
