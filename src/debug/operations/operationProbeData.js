import { OPERATION_TYPES } from "../../../engine-adapter/index.js";

export const initialOperationProbeItems = [
  { id: "probe-a", x: 4, y: 4, w: 5, h: 4, meta: { value: "probe-a", blockType: "content" } },
  { id: "probe-b", x: 14, y: 8, w: 4, h: 4, meta: { value: "probe-b", blockType: "content" } }
];

export const initialOperationProbeForm = {
  type: OPERATION_TYPES.MOVE_AREA,
  targetId: "probe-a",
  x: 7,
  y: 13,
  w: 5,
  h: 4
};
