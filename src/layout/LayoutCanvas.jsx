import { useEffect, useMemo, useRef, useState } from "react";
import {
  createAdaptiveGrid,
  getInitialAdaptiveGridMetrics
} from "../../adaptive-engine/core/index.js";
import {
  ADAPTER_BEHAVIOR_MODES,
  createNavigationHostState
} from "../../engine-adapter/index.js";
import {
  debugFlags,
  GridDebugAreaProbe,
  GridDebugCellHighlight,
  GridDebugHoverCell,
  GridLayoutMapOverlay,
  GridDebugOverlay,
  GridDebugSelectedCell,
  GridNavigationProbe,
  GridTelemetryPanel,
  GridIntentCellCreator,
  GridOperationProbeItems,
  GridOperationProbePanel,
  initialOperationProbeItems,
  useGridTelemetry,
  useGridOperationProbe
} from "../debug/index.js";
import {
  getInitialNavigationProbePageId,
  getWorkspaceIdByPageId,
  initialNavigationProbeItemsByWorkspace,
  navigationProbeConfig,
  navigationProbePages,
  navigationProbeRoutes,
  navigationProbeWorkspaces
} from "../debug/navigation/navigationProbeData.js";
import {
  loadStoredOperationProbeItems,
  saveStoredOperationProbeItems
} from "../debug/operations/operationProbeStorage.js";
import { layoutRules } from "./layoutRules.js";

export function LayoutCanvas() {
  const workspaceRef = useRef(null);
  const [gridMetrics, setGridMetrics] = useState(() =>
    getInitialAdaptiveGridMetrics(layoutRules)
  );
  const [activePageId, setActivePageId] = useState(getInitialNavigationProbePageId);
  const activeWorkspaceId = getWorkspaceIdByPageId(activePageId);
  const [itemsByWorkspaceId, setItemsByWorkspaceId] = useState(() => ({
    ...initialNavigationProbeItemsByWorkspace,
    [activeWorkspaceId]: loadStoredOperationProbeItems(
      initialNavigationProbeItemsByWorkspace[activeWorkspaceId]
    )
  }));
  const [debugOperationItems, setDebugOperationItems] = useState(() =>
    itemsByWorkspaceId[activeWorkspaceId] ?? initialOperationProbeItems
  );
  const [debugSelection, setDebugSelection] = useState(null);
  const navigationState = useMemo(() => createNavigationHostState({
    metrics: gridMetrics,
    activePageId,
    pages: navigationProbePages,
    routes: navigationProbeRoutes,
    workspaces: navigationProbeWorkspaces,
    navigation: navigationProbeConfig,
    shell: {
      reservedArea: { left: 0, right: 0, top: 0, bottom: 0 }
    },
    usableWorkspace: {
      x: 1,
      y: 1,
      columns: gridMetrics.columns,
      rows: gridMetrics.rows
    }
  }), [activePageId, gridMetrics]);
  const telemetry = useGridTelemetry({
    metrics: gridMetrics,
    items: debugOperationItems,
    selection: debugSelection
  });
  const operationProbe = useGridOperationProbe({
    items: debugOperationItems,
    setItems: updateDebugOperationItems,
    metrics: gridMetrics,
    selection: debugSelection,
    setSelection: setDebugSelection,
    behaviorMode: ADAPTER_BEHAVIOR_MODES.AUTO
  });

  useEffect(() => {
    if (!workspaceRef.current) {
      return undefined;
    }

    return createAdaptiveGrid(workspaceRef.current, layoutRules, setGridMetrics);
  }, []);

  useEffect(() => {
    saveStoredOperationProbeItems(debugOperationItems);
  }, [debugOperationItems]);

  useEffect(() => {
    setDebugSelection(null);
    setDebugOperationItems(itemsByWorkspaceId[activeWorkspaceId] ?? []);
  }, [activeWorkspaceId]);

  function updateDebugOperationItems(nextItems) {
    setDebugOperationItems((currentItems) => {
      const resolvedItems = typeof nextItems === "function"
        ? nextItems(currentItems)
        : nextItems;

      setItemsByWorkspaceId((currentMap) => ({
        ...currentMap,
        [activeWorkspaceId]: resolvedItems
      }));

      return resolvedItems;
    });
  }

  function selectNavigationPage(pageId) {
    if (pageId === activePageId) {
      return;
    }

    setDebugSelection(null);
    setActivePageId(pageId);
  }

  return (
    <div className="layout-stage">
      {debugFlags.showOperationProbe && (
        <GridOperationProbePanel {...operationProbe.panelProps} />
      )}
      <section className="layout-workspace" ref={workspaceRef}>
        <div className="layout-canvas" style={gridMetrics.cssVariables}>
          {debugFlags.showAreaProbe && <GridDebugAreaProbe metrics={gridMetrics} />}
          {debugFlags.showOperationProbe && (
            <GridOperationProbeItems {...operationProbe.itemProps} />
          )}
          {operationProbe.layoutMapOverlayProps.enabled && (
            <GridLayoutMapOverlay {...operationProbe.layoutMapOverlayProps} />
          )}
          {debugFlags.showRandomCell && <GridDebugCellHighlight metrics={gridMetrics} />}
          {debugFlags.showHoverCell && <GridDebugHoverCell metrics={gridMetrics} />}
          {debugFlags.showSelectedCell && (
            <GridDebugSelectedCell items={debugOperationItems} metrics={gridMetrics} />
          )}
          {debugFlags.showIntentCellCreator && (
            <GridIntentCellCreator
              items={debugOperationItems}
              setItems={updateDebugOperationItems}
              metrics={gridMetrics}
              selection={debugSelection}
              setSelection={setDebugSelection}
              blockType={operationProbe.panelProps.activeBlockType}
            />
          )}
        </div>
      </section>
      {debugFlags.showMetricsOverlay && <GridDebugOverlay metrics={gridMetrics} />}
      {debugFlags.showTelemetryPanel && <GridTelemetryPanel telemetry={telemetry} />}
      <GridNavigationProbe
        activePageId={activePageId}
        navigationState={navigationState}
        pages={navigationProbePages}
        onSelectPage={selectNavigationPage}
      />
    </div>
  );
}
