import { spawnSync } from "node:child_process";
import path from "node:path";

export function collectCheckFailure({ rootDir }) {
  const result = spawnSync(process.execPath, [path.join(rootDir, "safety-system", "runAllChecks.js")], {
    cwd: rootDir,
    encoding: "utf8",
    shell: false
  });

  const output = [
    result.error ? `spawn error: ${result.error.message}` : "",
    result.stdout ?? "",
    result.stderr ?? ""
  ].join("\n").trim();

  return {
    ok: result.status === 0,
    status: result.status,
    output
  };
}
