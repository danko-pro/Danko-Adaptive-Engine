import { collectCheckFailure } from "./collectCheckFailure.js";
import { createOpenAiPatchPrompt } from "./createOpenAiPatchPrompt.js";
import { extractPatchBlock } from "./extractPatchBlock.js";
import { loadEnvFile } from "./loadEnvFile.js";
import { requestOpenAiSuggestion } from "./requestOpenAiSuggestion.js";
import { saveAiSuggestion } from "./saveAiSuggestion.js";

const rootDir = process.cwd();
loadEnvFile(rootDir);

console.log("running npm run check...");

const check = collectCheckFailure({ rootDir });

if (check.ok) {
  console.log("npm run check passed. No AI fix suggestion needed.");
  process.exit(0);
}

console.log("npm run check failed. Creating AI repair prompt...");

const prompt = createOpenAiPatchPrompt({
  rootDir,
  checkOutput: check.output
});

const response = await requestOpenAiSuggestion({ prompt });

if (!response.ok) {
  const saved = saveAiSuggestion({
    rootDir,
    prompt,
    suggestion: [
      `OpenAI request failed.`,
      `model: ${response.model}`,
      `status: ${response.status ?? "none"}`,
      `error: ${response.error}`
    ].join("\n"),
    patch: ""
  });

  console.error(`AI suggestion failed: ${response.error}`);
  console.error(`Prompt saved: ${saved.promptPath}`);
  process.exit(1);
}

const patch = extractPatchBlock(response.text);
const saved = saveAiSuggestion({
  rootDir,
  prompt,
  suggestion: response.text,
  patch
});

console.log(`AI suggestion saved: ${saved.suggestionPath}`);

if (saved.patchPath) {
  console.log(`Patch suggestion saved: ${saved.patchPath}`);
} else {
  console.log("No patch block found in AI response.");
}
