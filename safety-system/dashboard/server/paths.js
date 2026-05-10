import path from "node:path";
import { fileURLToPath } from "node:url";

const dashboardDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export const dashboardPaths = {
  dashboardDir,
  clientDir: path.join(dashboardDir, "client"),
  rootDir: path.resolve(dashboardDir, "..", "..")
};
