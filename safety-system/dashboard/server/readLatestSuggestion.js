import fs from "node:fs";
import path from "node:path";

export function readLatestSuggestion(rootDir) {
  const suggestionsDir = path.join(rootDir, ".ai-suggestions");
  const fixPath = path.join(suggestionsDir, "latest-fix.md");
  const patchPath = path.join(suggestionsDir, "latest.patch");
  const promptPath = path.join(suggestionsDir, "latest-prompt.md");

  return {
    hasSuggestion: fs.existsSync(fixPath),
    suggestion: readOptionalFile(fixPath),
    patch: readOptionalFile(patchPath),
    prompt: readOptionalFile(promptPath)
  };
}

function readOptionalFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}
