import { NAVIGATION_ISSUE_SEVERITY } from "./contracts/navigationIssueSeverity.js";

export function createNavigationIssue({
  code,
  message,
  severity = NAVIGATION_ISSUE_SEVERITY.WARNING,
  targetId = null,
  details = {}
}) {
  return {
    code,
    message,
    severity,
    targetId,
    details
  };
}
