import { resolveAreaIntent } from "../../adaptive-engine/core/index.js";
import { resolveAdapterSelection } from "../selection/resolveAdapterSelection.js";
import { SIDEBAR_STATES } from "../../sidebar-element/index.js";
import { BLOCK_CONTENT_TYPES, resolveBlockContentType } from "../contracts/blockContentTypes.js";
import { formatAdapterErrorSummary, formatItemLabel, formatRejectionMessage } from "../feedback/formatAdapterFeedback.js";
import { applySceneOperationCommand } from "./applySceneOperationCommand.js";

export function createAreaFromCellCommand({ cell, size = null, value, blockType, items, metrics, meta = {} }) {
  const resolvedBlockType = resolveBlockContentType(blockType);
  const intent = resolveAreaIntent({
    cell,
    size,
    value,
    meta: createIntentMeta(resolvedBlockType, meta)
  });

  if (!intent.valid) {
    return {
      valid: false,
      items,
      selection: null,
      message: formatAdapterErrorSummary(intent.errors),
      result: null
    };
  }

  const command = applySceneOperationCommand({
    items,
    operation: intent.operation,
    metrics
  });

  if (!command.valid) {
    return {
      valid: false,
      items,
      selection: null,
      message: formatRejectionMessage(command.result.rejection),
      result: command.result
    };
  }

  return {
    valid: true,
    items: command.items,
    selection: resolveAdapterSelection({ cell, items: command.items, metrics }),
    message: `Создан блок ${formatItemLabel(command.items.at(-1)) || value}`,
    result: command.result
  };
}

function createIntentMeta(blockType, meta = {}) {
  const extraMeta = isPlainObject(meta) ? { ...meta } : {};

  if (blockType !== BLOCK_CONTENT_TYPES.SIDEBAR) {
    return {
      ...extraMeta,
      blockType
    };
  }

  return {
    ...extraMeta,
    blockType,
    sidebar: {
      state: SIDEBAR_STATES.OVERLAY,
      ...(isPlainObject(extraMeta.sidebar) ? extraMeta.sidebar : {})
    }
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
