// UI host must reach engines only through engine-adapter (and sidebar-element for sidebar domain).

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const forbiddenPackages = [
  "adaptive-engine",
  "composition-engine",
  "navigation-engine",
  "engine-runtime"
];
const sourceExtensions = new Set([".js", ".jsx"]);
const violations = [];

for (const filePath of walkFiles(srcDir)) {
  if (!sourceExtensions.has(path.extname(filePath))) {
    continue;
  }

  const source = fs.readFileSync(filePath, "utf8");

  for (const importPath of getImportPaths(source)) {
    const normalizedImport = importPath.replaceAll("\\", "/");
    const forbiddenPackage = forbiddenPackages.find((packageName) => (
      normalizedImport.includes(packageName)
    ));

    if (forbiddenPackage) {
      violations.push({
        file: path.relative(rootDir, filePath),
        importPath,
        forbiddenPackage
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Проверка слоя src не прошла.");
  console.error("src must not import engine packages directly:");

  for (const violation of violations) {
    console.error(`- ${violation.file} imports ${violation.importPath}`);
    console.error(`  Use engine-adapter/index.js instead of ${violation.forbiddenPackage}.`);
  }

  process.exit(1);
}

console.log("Слой src в порядке: UI host импортирует движки только через engine-adapter.");
console.log("src layer import check passed");

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
