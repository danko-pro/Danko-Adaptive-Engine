// Grid rule profiles
// Именованные профили правил.
// Только enabled-профили могут реально менять расчет сетки.

import { defaultGridRules } from "./defaultGridRules.js";

export const GRID_RULE_PROFILES = {
  BASE: "base",
  NARROW: "narrow",
  SHORT: "short",
  TINY: "tiny"
};

export const GRID_RULE_PROFILE_STATUSES = {
  CALIBRATED: "calibrated",
  PLANNED: "planned"
};

export const gridRuleProfiles = {
  [GRID_RULE_PROFILES.BASE]: {
    name: GRID_RULE_PROFILES.BASE,
    status: GRID_RULE_PROFILE_STATUSES.CALIBRATED,
    enabled: true,
    description: "Базовый профиль, подтвержден ручной калибровкой.",
    rules: defaultGridRules
  },
  [GRID_RULE_PROFILES.NARROW]: {
    name: GRID_RULE_PROFILES.NARROW,
    status: GRID_RULE_PROFILE_STATUSES.PLANNED,
    enabled: false,
    description: "Будущий профиль для узкой рабочей области.",
    rules: defaultGridRules
  },
  [GRID_RULE_PROFILES.SHORT]: {
    name: GRID_RULE_PROFILES.SHORT,
    status: GRID_RULE_PROFILE_STATUSES.PLANNED,
    enabled: false,
    description: "Будущий профиль для низкой рабочей области.",
    rules: defaultGridRules
  },
  [GRID_RULE_PROFILES.TINY]: {
    name: GRID_RULE_PROFILES.TINY,
    status: GRID_RULE_PROFILE_STATUSES.PLANNED,
    enabled: false,
    description: "Будущий профиль для одновременно узкой и низкой рабочей области.",
    rules: defaultGridRules
  }
};
