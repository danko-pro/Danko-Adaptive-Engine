export function getImportPaths(source) {
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
