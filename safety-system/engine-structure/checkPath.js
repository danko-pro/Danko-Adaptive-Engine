import fs from "node:fs";
import { recordStructureError, recordStructureTrace } from "./createStructureResult.js";

export function checkPath({ result, assistant, label, target, absolutePath, type }) {
  const exists = type === "directory"
    ? fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()
    : fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();

  if (exists) {
    recordStructureTrace(result, { assistant, label, target, status: "ok" });
    return;
  }

  recordStructureError(result, {
    assistant,
    label,
    target,
    message: `${target} is missing`
  });
}
