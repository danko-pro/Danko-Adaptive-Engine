import path from "node:path";
import { checkExports } from "./checkExports.js";
import { checkPath } from "./checkPath.js";

export function checkAssistant({ result, rule, rootDir, coreIndexPath }) {
  const assistantDir = path.join(rootDir, rule.dir);

  checkPath({
    result,
    assistant: rule.name,
    label: "folder",
    target: rule.dir,
    absolutePath: assistantDir,
    type: "directory"
  });

  for (const fileName of rule.requiredFiles) {
    checkPath({
      result,
      assistant: rule.name,
      label: "required-file",
      target: path.join(rule.dir, fileName),
      absolutePath: path.join(assistantDir, fileName),
      type: "file"
    });
  }

  for (const testPath of rule.tests) {
    checkPath({
      result,
      assistant: rule.name,
      label: "test-file",
      target: testPath,
      absolutePath: path.join(rootDir, testPath),
      type: "file"
    });
  }

  checkExports({
    result,
    assistant: rule.name,
    label: "index-export",
    filePath: path.join(assistantDir, "index.js"),
    target: path.join(rule.dir, "index.js"),
    symbols: rule.indexExports
  });

  checkExports({
    result,
    assistant: rule.name,
    label: "core-export",
    filePath: coreIndexPath,
    target: "adaptive-engine/core/index.js",
    symbols: rule.coreExports
  });
}
