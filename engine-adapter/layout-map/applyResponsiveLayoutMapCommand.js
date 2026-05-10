import { resolveResponsiveMap } from "../../adaptive-engine/core/index.js";
import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import { createAdapterResult } from "../contracts/createAdapterResult.js";

export function applyResponsiveLayoutMapCommand({ layoutMap, metrics }) {
  const result = resolveResponsiveMap(layoutMap, metrics);

  if (!result.valid) {
    return createAdapterResult({
      status: ADAPTER_STATUS.ERROR,
      message: `Карта не применена: ${result.reason}`,
      data: {
        items: []
      },
      engineResult: result
    });
  }

  return createAdapterResult({
    status: ADAPTER_STATUS.OK,
    message: `Карта применена: ${result.items.length} блоков пересчитано.`,
    data: {
      items: result.items
    },
    engineResult: result
  });
}
