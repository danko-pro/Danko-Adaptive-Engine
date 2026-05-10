import fs from "node:fs";
import path from "node:path";
import { recordStructureError, recordStructureTrace } from "./createStructureResult.js";
import { isInsideDir } from "./pathUtils.js";
import { getImportPaths } from "./readImports.js";
import { walkFiles } from "./walkFiles.js";

const sourceExtensions = new Set([".js", ".jsx"]);

export function checkEngineDoesNotImportSrc({ result, rootDir, engineDir, srcDir }) {
  for (const filePath of walkFiles(engineDir)) {
    if (!sourceExtensions.has(path.extname(filePath))) {
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");
    const importPaths = getImportPaths(source);
    const relativeFilePath = path.relative(rootDir, filePath);
    let hasSrcImport = false;

    for (const importPath of importPaths) {
      if (!importPath.startsWith(".")) {
        continue;
      }

      const resolvedImport = path.resolve(path.dirname(filePath), importPath);

      if (!isInsideDir(resolvedImport, srcDir)) {
        continue;
      }

      hasSrcImport = true;
      recordStructureError(result, {
        assistant: "engine-boundary",
        label: "no-src-import",
        target: relativeFilePath,
        message: `adaptive-engine must not import from src: ${importPath}`
      });
    }

    if (!hasSrcImport) {
      recordStructureTrace(result, {
        assistant: "engine-boundary",
        label: "no-src-import",
        target: relativeFilePath,
        status: "ok"
      });
    }
  }
}
