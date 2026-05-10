import { applyOperation, resolveAreaIntent, resolveSelection } from "../../adaptive-engine/core/index.js";
import {
  formatAdapterErrorSummary,
  formatItemLabel,
  formatRejectionMessage
} from "../feedback/formatAdapterFeedback.js";
import { resolveBlockContentType } from "../contracts/blockContentTypes.js";

export function createAreaFromCellCommand({ cell, size = null, value, blockType, items, metrics }) {
  const intent = resolveAreaIntent({
    cell,
    size,
    value,
    meta: {
      blockType: resolveBlockContentType(blockType)
    }
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

  const result = applyOperation(items, intent.operation, metrics);

  if (!result.valid) {
    return {
      valid: false,
      items,
      selection: null,
      message: formatRejectionMessage(result.rejection),
      result
    };
  }

  return {
    valid: true,
    items: result.items,
    selection: resolveSelection({ cell, items: result.items, metrics }),
    message: `Создан блок ${formatItemLabel(result.items.at(-1)) || value}`,
    result
  };
}
