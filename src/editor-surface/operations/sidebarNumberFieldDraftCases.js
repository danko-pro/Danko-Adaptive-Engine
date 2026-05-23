import assert from "node:assert/strict";

import { resolveSidebarNumberFieldCommit } from "./sidebarNumberFieldDraft.js";

assert.deepEqual(
  resolveSidebarNumberFieldCommit({
    draftValue: "",
    fallbackValue: 24,
    min: 6,
    max: 96
  }),
  {
    valid: false,
    value: 24,
    modelValue: 24,
    draftValue: "24"
  }
);

assert.deepEqual(
  resolveSidebarNumberFieldCommit({
    draftValue: "2",
    fallbackValue: 14,
    min: 6,
    max: 96
  }),
  {
    valid: true,
    value: 6,
    modelValue: 6,
    draftValue: "6"
  }
);

assert.deepEqual(
  resolveSidebarNumberFieldCommit({
    draftValue: "4",
    fallbackValue: 14,
    min: 6,
    max: 96
  }),
  {
    valid: true,
    value: 6,
    modelValue: 6,
    draftValue: "6"
  }
);

assert.deepEqual(
  resolveSidebarNumberFieldCommit({
    draftValue: "2",
    fallbackValue: 14,
    min: 6,
    max: 96
  }).modelValue,
  6
);

assert.deepEqual(
  resolveSidebarNumberFieldCommit({
    draftValue: "1.",
    fallbackValue: 1.2,
    min: 0.8,
    max: 2
  }),
  {
    valid: true,
    value: 1,
    modelValue: 1,
    draftValue: "1"
  }
);

assert.deepEqual(
  resolveSidebarNumberFieldCommit({
    draftValue: "0.",
    fallbackValue: 1.2,
    min: 0.8,
    max: 2
  }),
  {
    valid: true,
    value: 0.8,
    modelValue: 0.8,
    draftValue: "0.8"
  }
);

assert.deepEqual(
  resolveSidebarNumberFieldCommit({
    draftValue: "70",
    fallbackValue: 100,
    min: 10,
    max: 100,
    transform: (value) => value / 100
  }),
  {
    valid: true,
    value: 70,
    modelValue: 0.7,
    draftValue: "70"
  }
);

console.log("sidebar number field draft tests passed");
