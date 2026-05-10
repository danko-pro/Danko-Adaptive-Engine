import path from "node:path";
import { assistantStructureRules } from "./assistantStructureRules.js";
import { checkAssistant } from "./checkAssistant.js";
import { checkEngineDoesNotImportSrc } from "./checkBoundaries.js";
import { createStructureResult } from "./createStructureResult.js";
import { printStructureReport } from "./printStructureReport.js";

export function runEngineStructureCheck({ rootDir, traceEnabled }) {
  const engineDir = path.join(rootDir, "adaptive-engine");
  const srcDir = path.join(rootDir, "src");
  const coreIndexPath = path.join(engineDir, "core", "index.js");
  const result = createStructureResult();

  for (const rule of assistantStructureRules) {
    checkAssistant({ result, rule, rootDir, coreIndexPath });
  }

  checkEngineDoesNotImportSrc({ result, rootDir, engineDir, srcDir });

  const ok = printStructureReport({
    result,
    assistantCount: assistantStructureRules.length,
    traceEnabled
  });

  if (!ok) {
    process.exit(1);
  }
}
