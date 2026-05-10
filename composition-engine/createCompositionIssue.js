import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";

export function createCompositionIssue({
  code,
  message,
  severity = COMPOSITION_ISSUE_SEVERITY.INFO,
  blockId = null,
  details = {}
}) {
  return {
    code,
    message,
    severity,
    blockId,
    details
  };
}
