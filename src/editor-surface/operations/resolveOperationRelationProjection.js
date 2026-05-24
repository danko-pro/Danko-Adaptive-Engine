import { applyLayoutRelationProjectionCommand } from "../../../engine-adapter/index.js";
import { hasLayoutRelationItems } from "./hasLayoutRelations.js";

export function resolveOperationRelationProjection({
  items = [],
  metrics,
  sourceMetrics = metrics
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];

  if (!hasLayoutRelationItems(sourceItems)) {
    return {
      shouldProject: false,
      items: sourceItems,
      message: "",
      command: null
    };
  }

  const command = applyLayoutRelationProjectionCommand({
    items: sourceItems,
    metrics,
    sourceMetrics
  });
  const shouldProject = command.ok === true && command.data?.changed === true;

  return {
    shouldProject,
    items: shouldProject ? command.data.items : sourceItems,
    message: command.message ?? "",
    command
  };
}
