import fs from "node:fs";
import path from "node:path";

export function saveAiSuggestion({ rootDir, prompt, suggestion, patch }) {
  const dir = path.join(rootDir, ".ai-suggestions");
  fs.mkdirSync(dir, { recursive: true });

  const promptPath = path.join(dir, "latest-prompt.md");
  const suggestionPath = path.join(dir, "latest-fix.md");
  const patchPath = path.join(dir, "latest.patch");

  fs.writeFileSync(promptPath, prompt, "utf8");
  fs.writeFileSync(suggestionPath, suggestion, "utf8");

  if (patch) {
    fs.writeFileSync(patchPath, patch, "utf8");
  } else if (fs.existsSync(patchPath)) {
    fs.rmSync(patchPath);
  }

  return {
    promptPath,
    suggestionPath,
    patchPath: patch ? patchPath : null
  };
}
