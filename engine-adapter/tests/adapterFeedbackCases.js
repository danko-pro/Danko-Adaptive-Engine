import assert from "node:assert/strict";
import { formatAdapterErrorMessage } from "../index.js";

assert.equal(
  formatAdapterErrorMessage("SIDEBAR_CONTENT_ITEM_INVALID"),
  "Внутренний элемент sidebar описан некорректно."
);
assert.equal(
  formatAdapterErrorMessage("SIDEBAR_CONTENT_ITEM_NOT_FOUND"),
  "Внутренний элемент sidebar не найден."
);
assert.equal(
  formatAdapterErrorMessage(null),
  "Ошибка обработки действия: код ошибки не передан."
);

console.log("adapter feedback tests passed");
