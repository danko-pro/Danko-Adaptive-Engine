import { createLayoutMap } from "../../adaptive-engine/core/index.js";
import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import { createAdapterResult } from "../contracts/createAdapterResult.js";

export function createAdapterLayoutMap({ items, metrics }) {
  const result = createLayoutMap(items, metrics);

  if (!result.valid) {
    return createAdapterResult({
      status: ADAPTER_STATUS.ERROR,
      message: `Карта не создана: ${result.reason}`,
      engineResult: result
    });
  }

  return createAdapterResult({
    status: ADAPTER_STATUS.OK,
    message: `Карта создана: ${result.map.items.length} блоков, ${result.map.relations.length} связей.`,
    data: {
      map: result.map
    },
    engineResult: result
  });
}
