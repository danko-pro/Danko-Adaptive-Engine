import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { engineFreezeConfig } from "./engine-freeze/engineFreezeConfig.js";

if (!fs.existsSync(engineFreezeConfig.snapshotPath)) {
  console.error("Проверка заморозки движка не прошла.");
  console.error("Нет слепка adaptive-engine.");
  console.error("Создайте его командой: npm run freeze:engine");
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(engineFreezeConfig.snapshotPath, "utf8"));
const currentFiles = collectEngineFiles(engineFreezeConfig.engineRoot);
const report = compareSnapshots(snapshot.files, currentFiles);

if (!report.valid) {
  console.error("Проверка заморозки движка не прошла.");
  console.error("adaptive-engine изменился, хотя текущий этап должен трогать только adapter/UI.");

  printGroup("Добавлены файлы", report.added);
  printGroup("Удалены файлы", report.removed);
  printGroup("Изменены файлы", report.changed);

  console.error("\nЕсли изменение движка осознанное, сначала обсудите разморозку.");
  console.error("После принятия решения обновите слепок: npm run freeze:engine");
  process.exit(1);
}

console.log(`Заморозка движка в порядке: файлов ${currentFiles.length}, изменений нет.`);
console.log("engine freeze check passed");

function compareSnapshots(expectedFiles, actualFiles) {
  const expectedByPath = new Map(expectedFiles.map((file) => [file.path, file]));
  const actualByPath = new Map(actualFiles.map((file) => [file.path, file]));
  const added = [];
  const removed = [];
  const changed = [];

  for (const file of actualFiles) {
    const expected = expectedByPath.get(file.path);

    if (!expected) {
      added.push(file.path);
      continue;
    }

    if (expected.sha256 !== file.sha256 || expected.size !== file.size) {
      changed.push(file.path);
    }
  }

  for (const file of expectedFiles) {
    if (!actualByPath.has(file.path)) {
      removed.push(file.path);
    }
  }

  return {
    valid: added.length === 0 && removed.length === 0 && changed.length === 0,
    added,
    removed,
    changed
  };
}

function collectEngineFiles(root) {
  return walkFiles(root)
    .map((filePath) => createFileRecord(root, filePath))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function walkFiles(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function createFileRecord(root, filePath) {
  const content = fs.readFileSync(filePath);

  return {
    path: toProjectPath(path.relative(root, filePath)),
    size: content.length,
    sha256: createHash("sha256").update(content).digest("hex")
  };
}

function toProjectPath(value) {
  return value.split(path.sep).join("/");
}

function printGroup(title, items) {
  if (items.length === 0) {
    return;
  }

  console.error(`\n${title}:`);

  for (const item of items) {
    console.error(`- adaptive-engine/${item}`);
  }
}
