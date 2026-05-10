import fs from "node:fs";
import path from "node:path";

export function loadEnvFile(rootDir) {
  const envPath = path.join(rootDir, ".env");

  if (!fs.existsSync(envPath)) {
    return false;
  }

  const source = fs.readFileSync(envPath, "utf8");

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = unwrapEnvValue(rawValue);
  }

  return true;
}

function unwrapEnvValue(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
