// Import boundary check
// Запрещает UI-слою импортировать внутренние файлы adaptive-engine напрямую.

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const adapterDir = path.join(rootDir, "engine-adapter");
const runtimeDir = path.join(rootDir, "engine-runtime");
const allowedAdaptiveImport = "adaptive-engine/core/index.js";
const sourceExtensions = new Set([".js", ".jsx"]);
const violations = [];

for (const filePath of [...walkFiles(srcDir), ...walkFiles(adapterDir), ...walkFiles(runtimeDir)]) {
  if (!sourceExtensions.has(path.extname(filePath))) {
    continue;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const importPaths = getImportPaths(source);

  for (const importPath of importPaths) {
    if (!importPath.includes("adaptive-engine")) {
      continue;
    }

    const normalizedImport = importPath.replaceAll("\\", "/");

    if (!normalizedImport.endsWith(allowedAdaptiveImport)) {
      violations.push({
        file: path.relative(rootDir, filePath),
        importPath
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Проверка границ импортов не прошла.");
  console.error("Import boundary violations found:");

  for (const violation of violations) {
    console.error(`- ${violation.file} imports ${violation.importPath}`);
    console.error(`  Нужно импортировать через ${allowedAdaptiveImport}.`);
    console.error(`  Use ${allowedAdaptiveImport} instead.`);
  }

  process.exit(1);
}

console.log("Границы импортов в порядке: UI не лезет во внутренние файлы движка.");
console.log("import boundary check passed");

function* walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walkFiles(entryPath);
      continue;
    }

    yield entryPath;
  }
}

function getImportPaths(source) {
  const imports = [];
  const staticImportRegex = /import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportRegex = /import\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of source.matchAll(staticImportRegex)) {
    imports.push(match[1]);
  }

  for (const match of source.matchAll(dynamicImportRegex)) {
    imports.push(match[1]);
  }

  return imports;
}
