import { useEffect, useMemo, useRef, useState } from "react";
import {
  createAdaptiveGrid,
  getInitialAdaptiveGridMetrics
} from "../../adaptive-engine/core/index.js";
import {
  ADAPTER_BEHAVIOR_MODES,
  createNavigationHostState,
  createNavigationPageCommand,
  createPageTransitionSnapshot,
  createProjectSceneState,
  resolveSceneItemsUpdate,
  resolveProjectSceneWithVisibleItems,
  resolveItemsWithSidebarNavigationContent,
  resolveSidebarContentNavigationAction,
  resolveVisibleProjectSceneItems,
  splitPageTransitionItems
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
  useGridTelemetry,
  useGridOperationProbe
} from "../debug/index.js";
import {
  createInitialNavigationProbeModel,
  getInitialNavigationProbePageId,
  getWorkspaceIdByPageId,
  navigationProbeConfig,
} from "../debug/navigation/navigationProbeData.js";
import {
  createInitialNavigationProbeProjectScene,
  isNavigationProbeShellItem,
  resolveNavigationProbeProjectScene
} from "../debug/navigation/navigationProbeProjectScene.js";
import {
  loadStoredNavigationProbeModel,
  saveStoredNavigationProbeModel
} from "../debug/navigation/navigationProbeStorage.js";
import {
  loadStoredOperationProbeProjectScene,
  saveStoredOperationProbeProjectScene
} from "../debug/operations/operationProbeStorage.js";
import { layoutRules } from "./layoutRules.js";

export function LayoutCanvas() {
  const workspaceRef = useRef(null);
  const [gridMetrics, setGridMetrics] = useState(() =>
    getInitialAdaptiveGridMetrics(layoutRules)
  );
  const [projectScene, setProjectScene] = useState(() =>
    resolveNavigationProbeProjectScene(
      loadStoredOperationProbeProjectScene(createInitialNavigationProbeProjectScene())
    )
  );
  const [navigationModel, setNavigationModel] = useState(() =>
    loadStoredNavigationProbeModel(createInitialNavigationProbeModel())
  );
  const activePageId = projectScene.activePageId ?? navigationModel.pages[0]?.id ?? getInitialNavigationProbePageId();
  const activeWorkspaceId = projectScene.activeWorkspaceId ?? getWorkspaceIdByPageId(activePageId, navigationModel.pages);
  const [debugOperationItems, setDebugOperationItems] = useState(() =>
    resolveVisibleProjectSceneItems({ projectScene })
  );
  const [debugSelection, setDebugSelection] = useState(null);
  const [operationPanelCollapsed, setOperationPanelCollapsed] = useState(true);
  const [pageTransition, setPageTransition] = useState(null);
  const navigationState = useMemo(() => createNavigationHostState({
    metrics: gridMetrics,
    activePageId,
    pages: navigationModel.pages,
    routes: navigationModel.routes,
    workspaces: navigationModel.workspaces,
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
  }), [activePageId, gridMetrics, navigationModel]);
  const debugRenderItems = useMemo(() => resolveItemsWithSidebarNavigationContent({
    items: debugOperationItems,
    navigationState
  }).items, [debugOperationItems, navigationState]);
  const pageTransitionView = useMemo(() => resolvePageTransitionView({
    pageTransition,
    renderItems: debugRenderItems,
    shellItems: projectScene.shellItems
  }), [debugRenderItems, pageTransition, projectScene.shellItems]);
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
    saveStoredOperationProbeProjectScene(projectScene);
  }, [projectScene]);

  useEffect(() => {
    saveStoredNavigationProbeModel(navigationModel);
  }, [navigationModel]);

  useEffect(() => {
    setDebugSelection(null);
    setDebugOperationItems(resolveVisibleProjectSceneItems({ projectScene }));
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!pageTransition?.active) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPageTransition((currentTransition) => (
        currentTransition?.id === pageTransition.id ? null : currentTransition
      ));
    }, pageTransition.durationMs + 40);

    return () => window.clearTimeout(timeoutId);
  }, [pageTransition]);

  function updateDebugOperationItems(nextItems, options = {}) {
    setDebugOperationItems((currentItems) => {
      const { visibleItems, shouldCommitSource } = resolveSceneItemsUpdate({
        nextItems,
        currentItems,
        options
      });

      if (shouldCommitSource) {
        setProjectScene((currentScene) => resolveProjectSceneWithVisibleItems({
          projectScene: currentScene,
          visibleItems,
          isShellItem: isNavigationProbeShellItem
        }));
      }

      return visibleItems;
    });
  }

  function selectNavigationPage(pageId) {
    if (pageId === activePageId) {
      return;
    }

    const nextWorkspaceId = getWorkspaceIdByPageId(pageId, navigationModel.pages);
    const nextScene = resolveNavigationProbeProjectScene(
      createProjectSceneState({
        ...projectScene,
        activePageId: pageId,
        activeWorkspaceId: nextWorkspaceId
      })
    );

    setPageTransition(createWorkspacePageTransition({
      toPageId: pageId,
      toWorkspaceId: nextWorkspaceId
    }));
    setDebugSelection(null);
    setProjectScene(nextScene);
    setDebugOperationItems(resolveVisibleProjectSceneItems({ projectScene: nextScene }));
  }

  function activateSidebarContentItem({ contentItem } = {}) {
    const action = resolveSidebarContentNavigationAction({
      contentItem,
      pages: navigationModel.pages,
      routes: navigationModel.routes,
      workspaces: navigationModel.workspaces
    });

    if (!action.valid) {
      return;
    }

    selectNavigationPage(action.pageId);
  }

  function createNavigationPage() {
    const command = createNavigationPageCommand(navigationModel);

    if (!command.valid) {
      return;
    }

    const nextNavigationModel = {
      pages: command.pages,
      routes: command.routes,
      workspaces: command.workspaces
    };
    const nextScene = resolveNavigationProbeProjectScene(
      createProjectSceneState({
        ...projectScene,
        activePageId: command.activePageId,
        activeWorkspaceId: command.activeWorkspaceId,
        workspaceItemsById: {
          ...projectScene.workspaceItemsById,
          [command.activeWorkspaceId]: projectScene.workspaceItemsById?.[command.activeWorkspaceId] ?? []
        }
      })
    );

    setPageTransition(createWorkspacePageTransition({
      toPageId: command.activePageId,
      toWorkspaceId: command.activeWorkspaceId,
      pages: nextNavigationModel.pages
    }));
    setNavigationModel(nextNavigationModel);
    setDebugSelection(null);
    setProjectScene(nextScene);
    setDebugOperationItems(resolveVisibleProjectSceneItems({ projectScene: nextScene }));
  }

  function createWorkspacePageTransition({
    toPageId,
    toWorkspaceId,
    pages = navigationModel.pages
  }) {
    const snapshot = createPageTransitionSnapshot({
      fromPageId: activePageId,
      toPageId,
      fromWorkspaceId: activeWorkspaceId,
      toWorkspaceId,
      pages,
      transition: navigationProbeConfig.transition
    });

    if (!snapshot.active) {
      return null;
    }

    const { workspaceItems } = splitPageTransitionItems({
      items: debugRenderItems,
      shellItems: projectScene.shellItems,
      isShellItem: isNavigationProbeShellItem
    });

    return {
      ...snapshot,
      id: `${snapshot.fromWorkspaceId}->${snapshot.toWorkspaceId}:${Date.now()}`,
      exitingItems: workspaceItems
    };
  }

  return (
    <div className="layout-stage">
      {debugFlags.showOperationProbe && (
        <GridOperationProbePanel
          {...operationProbe.panelProps}
          collapsed={operationPanelCollapsed}
          onToggleCollapsed={() => setOperationPanelCollapsed((current) => !current)}
        />
      )}
      <section className="layout-workspace" ref={workspaceRef}>
        <div className="layout-canvas" style={gridMetrics.cssVariables}>
          {debugFlags.showAreaProbe && <GridDebugAreaProbe metrics={gridMetrics} />}
          {debugFlags.showOperationProbe && (
            <GridOperationProbeItems
              {...operationProbe.itemProps}
              renderItems={debugRenderItems}
              pageTransition={pageTransitionView}
              onActivateSidebarContentItem={activateSidebarContentItem}
            />
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
        pages={navigationModel.pages}
        onCreatePage={createNavigationPage}
        onSelectPage={selectNavigationPage}
      />
    </div>
  );
}

function resolvePageTransitionView({
  pageTransition,
  renderItems,
  shellItems
}) {
  if (!pageTransition?.active) {
    return null;
  }

  const { workspaceItems } = splitPageTransitionItems({
    items: renderItems,
    shellItems,
    isShellItem: isNavigationProbeShellItem
  });

  return {
    ...pageTransition,
    enterItemIds: workspaceItems.map((item) => String(item.id))
  };
}
