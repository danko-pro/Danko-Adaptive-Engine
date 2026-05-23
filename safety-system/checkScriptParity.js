// Keeps package.json scripts aligned with safety-system/runAllChecks.js.

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
);
const runAllChecksSource = fs.readFileSync(
  path.join(rootDir, "safety-system/runAllChecks.js"),
  "utf8"
);

const runAllEntries = [...runAllChecksSource.matchAll(
  /\[\s*"([^"]+)",\s*"[^"]+",\s*"([^"]+)"/g
)].map((match) => ({
  name: match[1],
  entryPath: match[2]
}));

const runAllNames = runAllEntries.map((entry) => entry.name);
const excludedPackageScripts = new Set(["test", "test:all", "check"]);
const packageScriptNames = Object.keys(packageJson.scripts).filter((scriptName) => (
  (scriptName.startsWith("test:") || scriptName.startsWith("check:"))
  && !excludedPackageScripts.has(scriptName)
));

const missingInPackage = runAllNames.filter((name) => !packageJson.scripts[name]);
const missingInRunAll = packageScriptNames.filter((name) => !runAllNames.includes(name));

const duplicateEntryPaths = runAllEntries
  .map((entry) => entry.entryPath)
  .filter((entryPath, index, allPaths) => allPaths.indexOf(entryPath) !== index);

const errors = [];

if (missingInPackage.length > 0) {
  errors.push(
    `runAllChecks references scripts missing in package.json: ${missingInPackage.join(", ")}`
  );
}

if (missingInRunAll.length > 0) {
  errors.push(
    `package.json scripts missing from runAllChecks: ${missingInRunAll.join(", ")}`
  );
}

if (duplicateEntryPaths.length > 0) {
  errors.push(
    `runAllChecks runs the same entry twice: ${[...new Set(duplicateEntryPaths)].join(", ")}`
  );
}

if (errors.length > 0) {
  console.error("Проверка parity package.json / runAllChecks не прошла.");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Parity package.json и runAllChecks в порядке.");
console.log("script parity check passed");
