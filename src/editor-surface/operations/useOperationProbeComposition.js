import { useEffect, useState } from "react";
import {
  applyCompositionFixCommand,
  ADAPTER_BEHAVIOR_MODES,
  evaluateCompositionPlanCommand,
  fitItemsToGridCommand,
  shouldPassBehaviorToV2,
  shouldUseAdapterSafetyProjection
} from "../../../engine-adapter/index.js";
import { operationCompositionPolicy } from "./operationCompositionPolicy.js";
import {
  areSameItems,
  createContentSchemasFromItems,
  createDependenciesFromItems
} from "./operationProbeSceneData.js";

export function useOperationProbeComposition({
  items,
  metrics,
  behaviorMode,
  interaction,
  sidebarContentInteraction,
  sidebarMobileButtonInteraction,
  sidebarIconStripBarAreaInteraction,
  sidebarCompactBarAreaInteraction,
  sourceItemsRef,
  sourceMetricsRef,
  onProjectItems
}) {
  const [compositionPlan, setCompositionPlan] = useState(null);
  const [compositionStatus, setCompositionStatus] = useState("V2: анализ еще не выполнялся");
  const [showCompositionOverlay, setShowCompositionOverlay] = useState(false);
  const layoutInteractionPaused = Boolean(
    interaction ||
    sidebarContentInteraction ||
    sidebarMobileButtonInteraction ||
    sidebarIconStripBarAreaInteraction ||
    sidebarCompactBarAreaInteraction
  );

  useEffect(() => {
    if (layoutInteractionPaused) {
      return;
    }

    if (shouldUseAdapterSafetyProjection({ behaviorMode })) {
      const command = fitItemsToGridCommand({
        items: sourceItemsRef.current,
        metrics,
        sourceMetrics: sourceMetricsRef.current,
        contentSchemas: createContentSchemasFromItems(sourceItemsRef.current)
      });

      if (!command.valid) {
        return;
      }

      const compositionCommand = evaluateCompositionItems(command.items, metrics);

      if (!compositionCommand.valid) {
        applyCompositionCommand(compositionCommand);
        return;
      }

      if (!command.changed && areSameItems(items, command.items)) {
        return;
      }

      onProjectItems(command.items, metrics, "Блоки вписаны в текущую сетку");
      applyCompositionCommand(compositionCommand);
      return;
    }

    if (!shouldPassBehaviorToV2({ behaviorMode })) {
      return;
    }

    if (behaviorMode === ADAPTER_BEHAVIOR_MODES.SUGGEST) {
      applyCompositionCommand(evaluateCompositionItems(sourceItemsRef.current, metrics));
      return;
    }

    const command = applyCompositionFixCommand({
      items: sourceItemsRef.current,
      metrics,
      sourceMetrics: sourceMetricsRef.current,
      policy: operationCompositionPolicy,
      contentSchemas: createContentSchemasFromItems(sourceItemsRef.current),
      dependencies: createDependenciesFromItems(sourceItemsRef.current),
      mode: behaviorMode
    });

    applyCompositionCommand(command);

    if (!command.valid) {
      return;
    }

    if (!command.changed && areSameItems(items, command.items)) {
      return;
    }

    onProjectItems(command.items, metrics, command.message);
  }, [metrics.columns, metrics.rows, behaviorMode]);

  useEffect(() => {
    if (layoutInteractionPaused) {
      return;
    }

    applyCompositionCommand(evaluateCompositionItems(items, metrics));
  }, [items, metrics.columns, metrics.rows]);

  function inspectComposition() {
    const command = evaluateCompositionItems(items, metrics);

    applyCompositionCommand(command);
    setShowCompositionOverlay((current) => !current);
    console.log("composition-engine plan", command.plan);
  }

  function applyCompositionFix() {
    const command = applyCompositionFixCommand({
      items: sourceItemsRef.current,
      metrics,
      sourceMetrics: sourceMetricsRef.current,
      policy: operationCompositionPolicy,
      contentSchemas: createContentSchemasFromItems(sourceItemsRef.current),
      dependencies: createDependenciesFromItems(sourceItemsRef.current)
    });

    applyCompositionCommand(command);

    if (!command.valid) {
      return;
    }

    if (!command.changed && areSameItems(items, command.items)) {
      return;
    }

    onProjectItems(command.items, metrics, command.message);
  }

  function evaluateCompositionItems(nextItems, nextMetrics) {
    return evaluateCompositionPlanCommand({
      mode: shouldPassBehaviorToV2({ behaviorMode })
        ? behaviorMode
        : ADAPTER_BEHAVIOR_MODES.SUGGEST,
      items: nextItems,
      metrics: nextMetrics,
      sourceMetrics: sourceMetricsRef.current,
      policy: operationCompositionPolicy,
      contentSchemas: createContentSchemasFromItems(nextItems),
      dependencies: createDependenciesFromItems(nextItems)
    });
  }

  function applyCompositionCommand(command) {
    const plan = command.plan;

    if (!plan) {
      setCompositionPlan(null);
      setCompositionStatus(command.message ?? "V2: план не создан.");
      return;
    }

    const prefix = command.statusMessage ? `${command.statusMessage} ` : "";

    setCompositionPlan(plan);
    setCompositionStatus(
      command.valid
        ? `${prefix}V2 видит: ${plan.summary.blocks} блоков, ${plan.summary.groups} групп, ${plan.summary.relations} связей, ${plan.summary.issues} сигналов, ${plan.summary.proposals} предложений`
        : `${command.message} ${plan.summary.issues} сигналов, ${plan.summary.proposals} предложений`
    );
  }

  return {
    compositionPlan,
    compositionStatus,
    showCompositionOverlay,
    inspectComposition,
    applyCompositionFix,
    evaluateCompositionItems,
    applyCompositionCommand
  };
}
