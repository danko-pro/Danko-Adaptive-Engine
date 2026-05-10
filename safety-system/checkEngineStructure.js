import { runEngineStructureCheck } from "./engine-structure/runEngineStructureCheck.js";

runEngineStructureCheck({
  rootDir: process.cwd(),
  traceEnabled: process.argv.includes("--trace")
});
