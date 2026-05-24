import assert from "node:assert/strict";
import { resolveMobileIconStripItemAreaStyle } from "../render/resolveMobileIconStripItemAreaStyle.js";

assert.deepEqual(
  resolveMobileIconStripItemAreaStyle({ x: 2, y: 1, w: 3, h: 2 }),
  {
    gridColumn: "2 / span 3",
    gridRow: "1 / span 2"
  }
);

console.log("mobile icon strip item area style tests passed");
