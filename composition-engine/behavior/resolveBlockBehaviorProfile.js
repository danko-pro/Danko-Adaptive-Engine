import {
  getCompositionBehaviorProfile,
  resolveCompositionBehaviorProfileId
} from "./compositionBehaviorProfiles.js";
import { validateBlockBehaviorProfile } from "./validateBlockBehaviorProfile.js";

export function resolveBlockBehaviorProfile({ block, role, contentSchema } = {}) {
  const profileId = resolveCompositionBehaviorProfileId({ block, role, contentSchema });
  const profile = getCompositionBehaviorProfile(profileId);
  const override = normalizeBehaviorOverride(contentSchema?.behavior ?? block?.contentSchema?.behavior);
  const resolved = mergeProfile(profile, override);
  const validation = validateBlockBehaviorProfile(resolved);

  return {
    ...resolved,
    valid: validation.valid,
    issues: validation.issues,
    source: override ? "profile+schema" : "profile",
    resolvedFor: {
      blockId: block?.id ?? null,
      contentType: contentSchema?.type ?? block?.contentSchema?.type ?? null,
      role: role ?? block?.role ?? null
    }
  };
}

function normalizeBehaviorOverride(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value;
}

function mergeProfile(profile, override) {
  if (!override) {
    return profile;
  }

  return {
    ...profile,
    ...override,
    minSize: {
      ...profile.minSize,
      ...(override.minSize ?? {})
    },
    layout: {
      ...profile.layout,
      ...(override.layout ?? {})
    },
    sidebar: mergeSidebarBehavior(profile.sidebar, override.sidebar),
    anchors: Array.isArray(override.anchors) ? [...override.anchors] : [...profile.anchors],
    fallbackOrder: Array.isArray(override.fallbackOrder) ? [...override.fallbackOrder] : [...profile.fallbackOrder],
    v4: {
      ...profile.v4,
      ...(override.v4 ?? {})
    }
  };
}

function mergeSidebarBehavior(profileSidebar, overrideSidebar) {
  if (!profileSidebar && !overrideSidebar) {
    return undefined;
  }

  if (!profileSidebar) {
    return {
      ...overrideSidebar,
      modes: Array.isArray(overrideSidebar?.modes) ? overrideSidebar.modes.map((mode) => ({ ...mode })) : [],
      docks: Array.isArray(overrideSidebar?.docks) ? [...overrideSidebar.docks] : [],
      collapsedSize: { ...(overrideSidebar?.collapsedSize ?? {}) }
    };
  }

  if (!overrideSidebar) {
    return profileSidebar;
  }

  return {
    ...profileSidebar,
    ...overrideSidebar,
    modes: Array.isArray(overrideSidebar.modes)
      ? overrideSidebar.modes.map((mode) => ({ ...mode }))
      : profileSidebar.modes.map((mode) => ({ ...mode })),
    docks: Array.isArray(overrideSidebar.docks) ? [...overrideSidebar.docks] : [...profileSidebar.docks],
    collapsedSize: {
      ...profileSidebar.collapsedSize,
      ...(overrideSidebar.collapsedSize ?? {})
    }
  };
}
