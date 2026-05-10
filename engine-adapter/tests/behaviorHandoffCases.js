import assert from "node:assert/strict";
import {
  ADAPTER_BEHAVIOR_MODES,
  resolveAdapterBehaviorMode,
  shouldPassBehaviorToV2,
  shouldUseAdapterSafetyProjection
} from "../index.js";

assert.equal(resolveAdapterBehaviorMode(), ADAPTER_BEHAVIOR_MODES.OFF);
assert.equal(resolveAdapterBehaviorMode("unknown"), ADAPTER_BEHAVIOR_MODES.OFF);

assert.equal(shouldUseAdapterSafetyProjection({}), false);
assert.equal(shouldPassBehaviorToV2({}), false);

assert.equal(
  shouldUseAdapterSafetyProjection({ behaviorMode: ADAPTER_BEHAVIOR_MODES.SAFE }),
  true
);
assert.equal(
  shouldPassBehaviorToV2({ behaviorMode: ADAPTER_BEHAVIOR_MODES.SAFE }),
  false
);

assert.equal(
  shouldUseAdapterSafetyProjection({ behaviorMode: ADAPTER_BEHAVIOR_MODES.SUGGEST }),
  false
);
assert.equal(
  shouldPassBehaviorToV2({ behaviorMode: ADAPTER_BEHAVIOR_MODES.SUGGEST }),
  true
);

assert.equal(
  shouldUseAdapterSafetyProjection({ behaviorMode: ADAPTER_BEHAVIOR_MODES.AUTO }),
  false
);
assert.equal(
  shouldPassBehaviorToV2({ behaviorMode: ADAPTER_BEHAVIOR_MODES.AUTO }),
  true
);

console.log("adapter behavior handoff tests passed");
