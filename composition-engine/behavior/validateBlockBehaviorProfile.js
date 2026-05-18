export function validateBlockBehaviorProfile(profile) {
  const issues = [];

  if (!profile || typeof profile !== "object") {
    return {
      valid: false,
      issues: [createIssue("INVALID_PROFILE", "Профиль поведения должен быть объектом.")]
    };
  }

  if (!profile.id) {
    issues.push(createIssue("MISSING_ID", "У профиля поведения должен быть id."));
  }

  if (!profile.role) {
    issues.push(createIssue("MISSING_ROLE", "У профиля поведения должна быть роль."));
  }

  if (!isPositiveInteger(profile.minSize?.w) || !isPositiveInteger(profile.minSize?.h)) {
    issues.push(createIssue("INVALID_MIN_SIZE", "Минимальный размер профиля должен быть положительным числом ячеек."));
  }

  if (!Array.isArray(profile.anchors) || profile.anchors.length === 0) {
    issues.push(createIssue("INVALID_ANCHORS", "Профиль должен описывать хотя бы один якорь."));
  }

  if (!Array.isArray(profile.fallbackOrder) || profile.fallbackOrder.length === 0) {
    issues.push(createIssue("INVALID_FALLBACKS", "Профиль должен описывать порядок запасных решений."));
  }

  if (!profile.layout || typeof profile.layout !== "object") {
    issues.push(createIssue("INVALID_LAYOUT_BEHAVIOR", "Профиль должен описывать участие блока в раскладке."));
  } else {
    for (const field of ["reservesSpace", "affectsContentFlow"]) {
      if (typeof profile.layout[field] !== "boolean") {
        issues.push(createIssue("INVALID_LAYOUT_FLAG", `Поле layout.${field} должно быть boolean.`));
      }
    }
  }

  if (profile.sidebar) {
    validateSidebarBehavior(profile.sidebar, issues);
  }

  for (const field of ["canMove", "canResize", "canShrink", "canGrow", "canWrap", "canStack", "canDetachFromGroup"]) {
    if (typeof profile[field] !== "boolean") {
      issues.push(createIssue("INVALID_FLAG", `Поле ${field} должно быть boolean.`));
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

function validateSidebarBehavior(sidebar, issues) {
  if (!Array.isArray(sidebar.modes) || sidebar.modes.length === 0) {
    issues.push(createIssue("INVALID_SIDEBAR_MODES", "Sidebar должен описывать допустимые режимы."));
  }

  if (!Array.isArray(sidebar.docks) || sidebar.docks.length === 0) {
    issues.push(createIssue("INVALID_SIDEBAR_DOCKS", "Sidebar должен описывать допустимые стороны стыковки."));
  }

  if (!isPositiveInteger(sidebar.collapsedSize?.w) || !isPositiveInteger(sidebar.collapsedSize?.h)) {
    issues.push(createIssue("INVALID_SIDEBAR_COLLAPSED_SIZE", "Свернутый sidebar должен иметь валидный размер."));
  }

  for (const mode of sidebar.modes ?? []) {
    if (!mode.id) {
      issues.push(createIssue("INVALID_SIDEBAR_MODE", "У режима sidebar должен быть id."));
    }

    for (const field of ["reservesSpace", "affectsContentFlow"]) {
      if (typeof mode[field] !== "boolean") {
        issues.push(createIssue("INVALID_SIDEBAR_MODE_FLAG", `Поле sidebar.mode.${field} должно быть boolean.`));
      }
    }
  }
}

function isPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

function createIssue(code, message) {
  return { code, message };
}
