// Grid rules resolver
// Готовит итоговые правила перед расчетом метрик.
// Сейчас получает базовый профиль без изменения поведения сетки.
// Важно: calculator не должен знать, почему выбран именно этот набор правил.

import { GRID_RULE_PROFILES } from "./gridRuleProfiles.js";
import { GRID_RULE_WARNINGS } from "./gridRuleWarnings.js";
import { resolveWorkspaceState, WORKSPACE_STATES } from "./resolveWorkspaceState.js";
import { selectGridRuleProfile } from "./selectGridRuleProfile.js";
import { validateGridRules } from "../validators/validateGridRules.js";

/**
 * @param {Partial<import("../contracts/gridTypes.js").WorkspaceSnapshot>} workspaceSnapshot
 * @param {Partial<import("../contracts/gridTypes.js").GridRules>} rules
 * @returns {{rules: import("../contracts/gridTypes.js").GridRules, meta: {source: string, profile: string, profileStatus: string, profileEnabled: boolean, candidate: string, candidateEnabled: boolean, reason: string, selectionReason: string, workspaceState: string, warnings: string[]}}}
 */
export function resolveGridRules(workspaceSnapshot, rules) {
  const workspaceState = resolveWorkspaceState(workspaceSnapshot);
  const selectedProfile = selectGridRuleProfile(workspaceState);
  const profile = selectedProfile.profile;
  const safeRules = validateGridRules({
    ...profile.rules,
    ...rules
  });

  return {
    rules: safeRules,
    meta: {
      source: "grid-rule-profile",
      profile: profile.name,
      profileStatus: profile.status,
      profileEnabled: profile.enabled,
      candidate: selectedProfile.candidate,
      candidateEnabled: selectedProfile.candidateEnabled,
      reason: workspaceSnapshot ? "workspace-measured" : "initial-fallback",
      selectionReason: selectedProfile.reason,
      workspaceState,
      warnings: collectGridRuleWarnings(workspaceState, profile.name)
    }
  };
}

function collectGridRuleWarnings(workspaceState, profileName) {
  const warnings = [];

  if (profileName === GRID_RULE_PROFILES.BASE) {
    warnings.push(GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION);
  }

  if (workspaceState === WORKSPACE_STATES.UNKNOWN) {
    warnings.push(GRID_RULE_WARNINGS.WORKSPACE_MISSING);
  }

  if (workspaceState === WORKSPACE_STATES.EMPTY) {
    warnings.push(GRID_RULE_WARNINGS.WORKSPACE_EMPTY);
  }

  if (workspaceState === WORKSPACE_STATES.TINY) {
    warnings.push(GRID_RULE_WARNINGS.WORKSPACE_TINY);
  }

  if (workspaceState === WORKSPACE_STATES.NARROW) {
    warnings.push(GRID_RULE_WARNINGS.WORKSPACE_NARROW);
  }

  if (workspaceState === WORKSPACE_STATES.SHORT) {
    warnings.push(GRID_RULE_WARNINGS.WORKSPACE_SHORT);
  }

  return warnings;
}
