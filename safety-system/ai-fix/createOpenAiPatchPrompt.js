import { promptPolicy } from "../knowledge/promptPolicy.js";
import { readKnowledgeContext } from "../knowledge/readKnowledgeContext.js";

export function createOpenAiPatchPrompt({ rootDir, checkOutput }) {
  const knowledge = readKnowledgeContext({ rootDir, checkOutput });
  const selectedDocs = knowledge.docs.map((doc) => `- ${doc.id}: ${doc.path}`).join("\n");
  const focusedCheckOutput = createFocusedCheckOutput(checkOutput);

  return [
    "Ты AI-помощник для локального JavaScript/React проекта.",
    "Задача: по выводу npm run check предложить минимальный patch, который чинит проблему и не ломает архитектуру.",
    "",
    promptPolicy,
    "",
    "Выбранные документы knowledge layer:",
    selectedDocs || "- документов нет",
    "",
    "Контекст проекта из выбранных документов:",
    knowledge.text || "Контекст не найден.",
    "",
    "Вывод npm run check:",
    "```text",
    truncateText(focusedCheckOutput, 3500),
    "```"
  ].join("\n");
}

function createFocusedCheckOutput(checkOutput) {
  const lines = checkOutput.split(/\r?\n/);
  const failedIndex = lines.findIndex((line) =>
    /Проверка остановлена|завершилась с кодом|failed|не прошла/i.test(line)
  );

  if (failedIndex === -1) {
    return checkOutput;
  }

  const start = Math.max(0, failedIndex - 22);
  const end = Math.min(lines.length, failedIndex + 24);

  return [
    "[сокращенный вывод: оставлен участок вокруг ошибки]",
    ...lines.slice(start, end)
  ].join("\n");
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n\n[truncated: ${text.length - maxLength} chars omitted]`;
}
