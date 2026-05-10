import fs from "node:fs";
import path from "node:path";

const forbiddenPaths = [
  {
    target: "adaptive-engine/behavior",
    reason: "V2 behavior не должен возвращаться внутрь V1 adaptive-engine."
  },
  {
    target: "adaptive-engine/tests/behaviorCases.js",
    reason: "Тесты V2 behavior не должны жить в тестовом наборе V1."
  },
  {
    target: "engine-adapter/behavior",
    reason: "V2 behavior должен быть отдельным слоем и фасадом, а не скрытой частью V1 adapter."
  }
];

const forbiddenCoreMentions = [
  {
    file: "adaptive-engine/core/index.js",
    patterns: ["behavior", "BlockBehavior", "resolveBlockBehavior"],
    reason: "Публичный фасад V1 не должен экспортировать V2 behavior."
  },
  {
    file: "engine-adapter/index.js",
    patterns: ["behavior", "BlockBehavior", "resolveBlockBehavior"],
    reason: "Adapter V1 не должен экспортировать V2 behavior."
  }
];

const errors = [];

for (const rule of forbiddenPaths) {
  const absolutePath = path.resolve(process.cwd(), rule.target);

  if (fs.existsSync(absolutePath)) {
    errors.push(`${rule.target}: ${rule.reason}`);
  }
}

for (const rule of forbiddenCoreMentions) {
  const absolutePath = path.resolve(process.cwd(), rule.file);

  if (!fs.existsSync(absolutePath)) {
    errors.push(`${rule.file}: файл не найден для проверки V1 guardrails.`);
    continue;
  }

  const source = fs.readFileSync(absolutePath, "utf8");
  const matchedPattern = rule.patterns.find((pattern) => source.includes(pattern));

  if (matchedPattern) {
    errors.push(`${rule.file}: найдено "${matchedPattern}". ${rule.reason}`);
  }
}

if (errors.length > 0) {
  console.error("V1 guardrails не прошли.");
  console.error("v1 guardrails check failed");
  console.error("Ошибки:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("V1 guardrails в порядке: V2 behavior не примешан к рабочей V1.");
console.log("v1 guardrails check passed");
