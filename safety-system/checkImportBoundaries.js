// Import boundary check
// Запрещает внешним слоям импортировать внутренние файлы движков напрямую.

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const adaptiveDir = path.join(rootDir, "adaptive-engine");
const srcDir = path.join(rootDir, "src");
const adapterDir = path.join(rootDir, "engine-adapter");
const runtimeDir = path.join(rootDir, "engine-runtime");
const compositionDir = path.join(rootDir, "composition-engine");
const navigationDir = path.join(rootDir, "navigation-engine");
const sidebarDir = path.join(rootDir, "sidebar-element");
const publicImportBoundaries = [
  {
    packageName: "adaptive-engine",
    allowedImport: "adaptive-engine/core/index.js"
  },
  {
    packageName: "engine-adapter",
    allowedImport: "engine-adapter/index.js"
  },
  {
    packageName: "sidebar-element",
    allowedImport: "sidebar-element/index.js"
  },
  {
    packageName: "composition-engine",
    allowedImport: "composition-engine/index.js"
  },
  {
    packageName: "engine-runtime",
    allowedImport: "engine-runtime/index.js"
  },
  {
    packageName: "navigation-engine",
    allowedImport: "navigation-engine/index.js"
  }
];
const sourceExtensions = new Set([".js", ".jsx"]);
const violations = [];

for (const filePath of [
  ...walkFiles(adaptiveDir),
  ...walkFiles(srcDir),
  ...walkFiles(adapterDir),
  ...walkFiles(runtimeDir),
  ...walkFiles(compositionDir),
  ...walkFiles(navigationDir),
  ...walkFiles(sidebarDir)
]) {
  if (!sourceExtensions.has(path.extname(filePath))) {
    continue;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const importPaths = getImportPaths(source);

  for (const importPath of importPaths) {
    const normalizedImport = importPath.replaceAll("\\", "/");
    const boundary = publicImportBoundaries.find((currentBoundary) => (
      normalizedImport.includes(currentBoundary.packageName)
    ));

    if (!boundary) {
      continue;
    }

    if (!normalizedImport.endsWith(boundary.allowedImport)) {
      violations.push({
        file: path.relative(rootDir, filePath),
        importPath,
        allowedImport: boundary.allowedImport
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Проверка границ импортов не прошла.");
  console.error("Import boundary violations found:");

  for (const violation of violations) {
    console.error(`- ${violation.file} imports ${violation.importPath}`);
    console.error(`  Нужно импортировать через ${violation.allowedImport}.`);
    console.error(`  Use ${violation.allowedImport} instead.`);
  }

  process.exit(1);
}

console.log("Границы импортов в порядке: внешние слои не обходят публичные фасады движков.");
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
