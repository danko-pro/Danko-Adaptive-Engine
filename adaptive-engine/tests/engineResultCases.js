import assert from "node:assert/strict";
import { createEngineResult } from "../contracts/index.js";

const okResult = createEngineResult({
  valid: true,
  action: "test-action",
  data: { value: 1 },
  meta: { received: 1 }
});

assert.equal(okResult.valid, true);
assert.equal(okResult.rejected, false);
assert.equal(okResult.action, "test-action");
assert.deepEqual(okResult.data, { value: 1 });
assert.deepEqual(okResult.errors, []);
assert.equal(okResult.rejection, null);
assert.equal(okResult.meta.errors, 0);
assert.equal(okResult.meta.received, 1);

const rejectedResult = createEngineResult({
  valid: false,
  action: "test-action",
  errors: [{ type: "TEST_ERROR" }],
  rejection: { rejected: true, code: "TEST_REJECTION" }
});

assert.equal(rejectedResult.valid, false);
assert.equal(rejectedResult.rejected, true);
assert.equal(rejectedResult.meta.errors, 1);
assert.equal(rejectedResult.rejection.code, "TEST_REJECTION");

console.log("engine result tests passed");
