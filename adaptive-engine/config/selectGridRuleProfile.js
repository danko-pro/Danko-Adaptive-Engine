// Grid rule profile selector
// Выбирает профиль правил по состоянию workspace.
// Сейчас будущие профили выключены, поэтому selector может видеть candidate,
// но безопасно оставляет активным base.

import { GRID_RULE_PROFILES, gridRuleProfiles } from "./gridRuleProfiles.js";
import { WORKSPACE_STATES } from "./resolveWorkspaceState.js";

export function selectGridRuleProfile(workspaceState) {
  const candidate = resolveProfileCandidate(workspaceState);
  const candidateProfile = gridRuleProfiles[candidate];
  const baseProfile = gridRuleProfiles[GRID_RULE_PROFILES.BASE];

  if (candidate !== GRID_RULE_PROFILES.BASE && candidateProfile?.enabled) {
    return {
      profile: candidateProfile,
      candidate: candidateProfile.name,
      candidateEnabled: true,
      reason: "candidate-enabled"
    };
  }

  return {
    profile: baseProfile,
    candidate,
    candidateEnabled: false,
    reason: resolveSelectionReason(workspaceState, candidate)
  };
}

function resolveProfileCandidate(workspaceState) {
  if (workspaceState === WORKSPACE_STATES.NARROW) {
    return GRID_RULE_PROFILES.NARROW;
  }

  if (workspaceState === WORKSPACE_STATES.SHORT) {
    return GRID_RULE_PROFILES.SHORT;
  }

  if (workspaceState === WORKSPACE_STATES.TINY) {
    return GRID_RULE_PROFILES.TINY;
  }

  return GRID_RULE_PROFILES.BASE;
}

function resolveSelectionReason(workspaceState, candidate) {
  if (workspaceState === WORKSPACE_STATES.UNKNOWN) {
    return "fallback-base-profile";
  }

  if (candidate !== GRID_RULE_PROFILES.BASE) {
    return "candidate-disabled";
  }

  return "calibrating-base-profile";
}
