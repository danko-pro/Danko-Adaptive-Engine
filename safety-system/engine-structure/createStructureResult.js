export function createStructureResult() {
  return {
    checks: 0,
    errors: [],
    warnings: [],
    trace: []
  };
}

export function recordStructureError(result, issue) {
  result.checks += 1;
  result.errors.push(issue);
  recordStructureTrace(result, { ...issue, status: "fail" });
}

export function recordStructureTrace(result, entry) {
  if (entry.status === "ok") {
    result.checks += 1;
  }

  result.trace.push(entry);
}
