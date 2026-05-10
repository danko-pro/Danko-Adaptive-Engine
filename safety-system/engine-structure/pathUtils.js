import path from "node:path";

export function isInsideDir(targetPath, dirPath) {
  const relativePath = path.relative(dirPath, targetPath);
  return relativePath !== "" && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}
