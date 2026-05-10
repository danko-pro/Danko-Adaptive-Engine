import path from "node:path";

export const engineFreezeConfig = {
  engineRoot: path.resolve(process.cwd(), "adaptive-engine"),
  snapshotPath: path.resolve(
    process.cwd(),
    "safety-system",
    "engine-freeze",
    "engine-freeze.snapshot.json"
  )
};
