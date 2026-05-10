export const assistantStructureRules = [
  {
    name: "area",
    dir: "adaptive-engine/area",
    requiredFiles: [
      "index.js",
      "areaErrorCodes.js",
      "createArea.js",
      "validateArea.js",
      "resolveArea.js"
    ],
    indexExports: ["AREA_ERRORS", "createArea", "validateArea", "resolveArea"],
    coreExports: ["AREA_ERRORS", "createArea", "validateArea", "resolveArea"],
    tests: ["adaptive-engine/tests/areaCases.js"]
  },
  {
    name: "grid calculator",
    dir: "adaptive-engine/calculators/grid",
    requiredFiles: ["index.js", "calculateGridMetrics.js", "resolveGridTracks.js"],
    indexExports: ["calculateGridMetrics", "resolveGridTracks"],
    coreExports: ["calculateGridMetrics", "resolveGridTracks"],
    tests: ["adaptive-engine/tests/gridMetricsCases.js"]
  },
  {
    name: "fitting",
    dir: "adaptive-engine/fitting",
    requiredFiles: ["index.js", "fittingErrorCodes.js", "clampAreaToGrid.js"],
    indexExports: ["FITTING_ERRORS", "clampAreaToGrid"],
    coreExports: ["FITTING_ERRORS", "clampAreaToGrid"],
    tests: ["adaptive-engine/tests/fittingCases.js"]
  },
  {
    name: "config",
    dir: "adaptive-engine/config",
    requiredFiles: [
      "index.js",
      "defaultGridRules.js",
      "engineVersion.js",
      "gridRuleProfiles.js",
      "gridRuleWarnings.js",
      "resolveGridRules.js",
      "resolveWorkspaceState.js",
      "selectGridRuleProfile.js",
      "workspaceStateLimits.js"
    ],
    indexExports: [
      "defaultGridRules",
      "ENGINE_VERSION",
      "GRID_RULE_PROFILES",
      "GRID_RULE_WARNINGS",
      "resolveGridRules",
      "resolveWorkspaceState",
      "selectGridRuleProfile",
      "WORKSPACE_STATE_LIMITS"
    ],
    coreExports: [
      "defaultGridRules",
      "ENGINE_VERSION",
      "GRID_RULE_PROFILES",
      "GRID_RULE_WARNINGS",
      "resolveGridRules",
      "resolveWorkspaceState",
      "selectGridRuleProfile",
      "WORKSPACE_STATE_LIMITS"
    ],
    tests: [
      "adaptive-engine/tests/gridRulesResolveCases.js",
      "adaptive-engine/tests/workspaceStateCases.js"
    ]
  },
  {
    name: "coordinates",
    dir: "adaptive-engine/coordinates",
    requiredFiles: ["index.js", "createGridCoordinateSystem.js", "validateGridArea.js"],
    indexExports: ["createGridCoordinateSystem", "GRID_AREA_ERRORS", "validateGridArea"],
    coreExports: ["createGridCoordinateSystem", "GRID_AREA_ERRORS", "validateGridArea"],
    tests: ["adaptive-engine/tests/gridCoordinateCases.js"]
  },
  {
    name: "constraints",
    dir: "adaptive-engine/constraints",
    requiredFiles: [
      "index.js",
      "constraintErrorCodes.js",
      "createConstraint.js",
      "validateConstraint.js",
      "resolveConstraint.js"
    ],
    indexExports: [
      "CONSTRAINT_ERRORS",
      "createConstraint",
      "validateConstraint",
      "resolveConstraint"
    ],
    coreExports: [
      "CONSTRAINT_ERRORS",
      "createConstraint",
      "validateConstraint",
      "resolveConstraint"
    ],
    tests: ["adaptive-engine/tests/constraintCases.js"]
  },
  {
    name: "diagnostics",
    dir: "adaptive-engine/diagnostics",
    requiredFiles: [
      "index.js",
      "createDiagnosticIssue.js",
      "createDiagnosticsReport.js",
      "diagnosticCodes.js",
      "diagnosticMessages.js",
      "diagnosticSeverity.js",
      "diagnosticStatus.js"
    ],
    indexExports: [
      "DIAGNOSTIC_CODES",
      "createDiagnosticIssue",
      "createDiagnosticsReport",
      "diagnosticMessages",
      "DIAGNOSTIC_SEVERITY",
      "DIAGNOSTIC_STATUS",
      "resolveDiagnosticMessage",
      "resolveDiagnosticSeverity"
    ],
    coreExports: [
      "DIAGNOSTIC_CODES",
      "createDiagnosticIssue",
      "createDiagnosticsReport",
      "diagnosticMessages",
      "DIAGNOSTIC_SEVERITY",
      "DIAGNOSTIC_STATUS",
      "resolveDiagnosticMessage",
      "resolveDiagnosticSeverity"
    ],
    tests: ["adaptive-engine/tests/diagnosticsCases.js"]
  },
  {
    name: "intents",
    dir: "adaptive-engine/intents",
    requiredFiles: [
      "index.js",
      "intentErrorCodes.js",
      "intentTypes.js",
      "createAreaIntent.js",
      "validateAreaIntent.js",
      "resolveAreaIntent.js"
    ],
    indexExports: [
      "INTENT_ERRORS",
      "INTENT_TYPES",
      "createAreaIntent",
      "validateAreaIntent",
      "resolveAreaIntent"
    ],
    coreExports: [
      "INTENT_ERRORS",
      "INTENT_TYPES",
      "createAreaIntent",
      "validateAreaIntent",
      "resolveAreaIntent"
    ],
    tests: ["adaptive-engine/tests/intentCases.js"]
  },
  {
    name: "layout",
    dir: "adaptive-engine/layout",
    requiredFiles: [
      "index.js",
      "createLayoutError.js",
      "createLayoutReport.js",
      "detectAreaCollision.js",
      "layoutErrorCodes.js",
      "normalizeLayoutItem.js",
      "normalizeLayoutItems.js",
      "prepareLayoutItems.js",
      "processLayoutItems.js",
      "resolveLayoutItems.js",
      "validateLayoutItems.js"
    ],
    indexExports: [
      "createLayoutError",
      "createLayoutReport",
      "detectAreaCollision",
      "LAYOUT_ERRORS",
      "normalizeLayoutItem",
      "normalizeLayoutItems",
      "prepareLayoutItems",
      "processLayoutItems",
      "resolveLayoutItems",
      "validateLayoutItems"
    ],
    coreExports: [
      "createLayoutError",
      "createLayoutReport",
      "detectAreaCollision",
      "LAYOUT_ERRORS",
      "normalizeLayoutItem",
      "normalizeLayoutItems",
      "prepareLayoutItems",
      "processLayoutItems",
      "resolveLayoutItems",
      "validateLayoutItems"
    ],
    tests: [
      "adaptive-engine/tests/layoutValidationCases.js",
      "adaptive-engine/tests/layoutResolveCases.js",
      "adaptive-engine/tests/layoutReportCases.js",
      "adaptive-engine/tests/layoutProcessCases.js"
    ]
  },
  {
    name: "layout-map",
    dir: "adaptive-engine/layout-map",
    requiredFiles: [
      "index.js",
      "layoutMapErrorCodes.js",
      "createLayoutMap.js",
      "detectItemRelations.js",
      "resolveResponsiveMap.js"
    ],
    indexExports: [
      "LAYOUT_MAP_ERRORS",
      "createLayoutMap",
      "detectItemRelations",
      "resolveResponsiveMap"
    ],
    coreExports: [
      "LAYOUT_MAP_ERRORS",
      "createLayoutMap",
      "detectItemRelations",
      "resolveResponsiveMap"
    ],
    tests: ["adaptive-engine/tests/layoutMapCases.js"]
  },
  {
    name: "modes",
    dir: "adaptive-engine/modes",
    requiredFiles: ["index.js", "gridModeNames.js", "resolveGridMode.js"],
    indexExports: ["GRID_AXIS_MODES", "GRID_MODES", "resolveGridMode"],
    coreExports: ["GRID_AXIS_MODES", "GRID_MODES", "resolveGridMode"],
    tests: ["adaptive-engine/tests/gridModeCases.js"]
  },
  {
    name: "operations",
    dir: "adaptive-engine/operations",
    requiredFiles: [
      "index.js",
      "applyOperation.js",
      "createOperation.js",
      "createOperationError.js",
      "createOperationReport.js",
      "operationErrorCodes.js",
      "operationTypes.js",
      "validateOperation.js"
    ],
    indexExports: [
      "applyOperation",
      "createOperation",
      "createOperationError",
      "createOperationReport",
      "OPERATION_ERRORS",
      "OPERATION_TYPES",
      "validateOperation"
    ],
    coreExports: [
      "applyOperation",
      "createOperation",
      "createOperationError",
      "createOperationReport",
      "OPERATION_ERRORS",
      "OPERATION_TYPES",
      "validateOperation"
    ],
    tests: ["adaptive-engine/tests/operationCases.js"]
  },
  {
    name: "placement",
    dir: "adaptive-engine/placement",
    requiredFiles: [
      "index.js",
      "placementErrorCodes.js",
      "canPlaceArea.js",
      "findFreeArea.js"
    ],
    indexExports: ["PLACEMENT_ERRORS", "canPlaceArea", "findFreeArea"],
    coreExports: ["PLACEMENT_ERRORS", "canPlaceArea", "findFreeArea"],
    tests: ["adaptive-engine/tests/placementCases.js"]
  },
  {
    name: "rejections",
    dir: "adaptive-engine/rejections",
    requiredFiles: [
      "index.js",
      "rejectionErrorCodes.js",
      "createRejection.js",
      "explainRejection.js",
      "resolveRejection.js"
    ],
    indexExports: [
      "REJECTION_ERRORS",
      "createRejection",
      "explainRejection",
      "resolveRejection"
    ],
    coreExports: [
      "REJECTION_ERRORS",
      "createRejection",
      "explainRejection",
      "resolveRejection"
    ],
    tests: ["adaptive-engine/tests/rejectionCases.js"]
  },
  {
    name: "selection",
    dir: "adaptive-engine/selection",
    requiredFiles: [
      "index.js",
      "createSelectionResult.js",
      "resolveSelection.js",
      "selectionErrorCodes.js",
      "selectionTypes.js",
      "validateSelectionInput.js"
    ],
    indexExports: [
      "createSelectionResult",
      "resolveSelection",
      "SELECTION_ERRORS",
      "SELECTION_TYPES",
      "validateSelectionInput"
    ],
    coreExports: [
      "createSelectionResult",
      "resolveSelection",
      "SELECTION_ERRORS",
      "SELECTION_TYPES",
      "validateSelectionInput"
    ],
    tests: ["adaptive-engine/tests/selectionCases.js"]
  },
  {
    name: "validators",
    dir: "adaptive-engine/validators",
    requiredFiles: [
      "index.js",
      "assertGridMetrics.js",
      "validateGridMetrics.js",
      "validateGridRules.js"
    ],
    indexExports: ["assertGridMetrics", "validateGridMetrics", "validateGridRules"],
    coreExports: ["assertGridMetrics", "validateGridMetrics", "validateGridRules"],
    tests: ["adaptive-engine/tests/gridMetricsValidationCases.js"]
  }
];
