import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { engineFreezeConfig } from "./engineFreezeConfig.js";

const snapshot = {
  version: 1,
  createdAt: new Date().toISOString(),
  root: "adaptive-engine",
  files: collectEngineFiles(engineFreezeConfig.engineRoot)
};

fs.mkdirSync(path.dirname(engineFreezeConfig.snapshotPath), { recursive: true });
fs.writeFileSync(engineFreezeConfig.snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(
  `Слепок движка обновлен: файлов ${snapshot.files.length}. Теперь adaptive-engine считается замороженным.`
);

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
