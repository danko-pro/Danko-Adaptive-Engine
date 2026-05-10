import fs from "node:fs";
import { recordStructureError, recordStructureTrace } from "./createStructureResult.js";

export function checkExports({ result, assistant, label, filePath, target, symbols }) {
  if (!fs.existsSync(filePath)) {
    recordStructureError(result, {
      assistant,
      label,
      target,
      message: `${target} is missing, exports cannot be checked`
    });
    return;
  }

  const source = fs.readFileSync(filePath, "utf8");

  for (const symbol of symbols) {
    if (source.includes(symbol)) {
      recordStructureTrace(result, {
        assistant,
        label,
        target: `${target} > ${symbol}`,
        status: "ok"
      });
      continue;
    }

    recordStructureError(result, {
      assistant,
      label,
      target: `${target} > ${symbol}`,
      message: `${target} does not export or mention ${symbol}`
    });
  }
}
