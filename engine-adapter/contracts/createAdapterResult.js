import { ADAPTER_STATUS } from "./adapterStatus.js";

export function createAdapterResult({
  status = ADAPTER_STATUS.IDLE,
  message = "",
  data = null,
  engineResult = null
} = {}) {
  return {
    ok: status !== ADAPTER_STATUS.ERROR,
    status,
    message,
    data,
    engineResult
  };
}
