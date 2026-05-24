import assert from "node:assert/strict";
import {
  DEFAULT_SIDEBAR_CONTENT_GRID,
  DEFAULT_SIDEBAR_MOBILE_LAYOUT,
  DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY,
  DEFAULT_SIDEBAR_RESPONSIVE,
  SIDEBAR_ANIMATIONS,
  SIDEBAR_CONTENT_GEOMETRY_ERROR_CODES,
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_FONT_FAMILIES,
  SIDEBAR_CONTENT_ITEM_TYPES,
  SIDEBAR_CONTENT_TEXT_ALIGNS,
  SIDEBAR_CONTENT_TEXT_FIT_DIAGNOSTIC_CODES,
  SIDEBAR_CONTRACT_VERSION,
  SIDEBAR_DOCKS,
  SIDEBAR_LAYERS,
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_MOBILE_PRESENTATION_MODES,
  SIDEBAR_RENDER_MODES,
  SIDEBAR_STATES,
  SIDEBAR_TEXT_FIT_MODES,
  SIDEBAR_TRIGGERS,
  SIDEBAR_VIEWPORT_MODES,
  createSidebarElementFacade,
  resolveSidebarContentItemGeometryStatus,
  resolveSidebarContentTextFitDiagnostics,
  resolveSidebarContentRequiredGridSize,
  resolveSidebarMobileRenderStrategy,
  resolveSidebarMobilePresentation,
  resolveSidebarViewportModeFromMetrics,
  resolveSidebarRenderModel,
  clampIconStripBarAreaToMetrics
} from "../index.js";

const facade = createSidebarElementFacade();
const metrics = { columns: 24, rows: 16 };

const created = facade.createFromArea({
  item: {
    id: "sidebar-left",
    x: 1,
    y: 3,
    w: 4,
    h: 10,
    meta: {
      blockType: "sidebar",
      value: "Left sidebar"
    }
  },
  metrics
});

assert.equal(created.valid, true);
assert.equal(created.changed, true);
assert.equal(created.item.meta.sidebar.version, SIDEBAR_CONTRACT_VERSION);
assert.equal(created.item.meta.sidebar.state, SIDEBAR_STATES.OVERLAY);
assert.equal(created.item.meta.sidebar.dock, SIDEBAR_DOCKS.LEFT);
assert.deepEqual(created.item.meta.sidebar.expandedArea, { x: 1, y: 3, w: 4, h: 10 });
assert.deepEqual(created.item.meta.sidebar.collapsedSize, { w: 1, h: 1 });
assert.equal(created.item.meta.sidebar.trigger, SIDEBAR_TRIGGERS.CLICK);
assert.equal(created.item.meta.sidebar.animation, SIDEBAR_ANIMATIONS.SLIDE);
assert.equal(created.item.meta.sidebar.mobileRenderStrategy, DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY);
assert.deepEqual(created.item.meta.sidebar.mobileLayout, DEFAULT_SIDEBAR_MOBILE_LAYOUT);
assert.deepEqual(created.item.meta.sidebar.responsive, DEFAULT_SIDEBAR_RESPONSIVE);
assert.deepEqual(created.item.meta.sidebar.content, {
  grid: DEFAULT_SIDEBAR_CONTENT_GRID,
  items: []
});
assert.equal(facade.resolveLayer(created.item), SIDEBAR_LAYERS.OVERLAY);

assert.equal(
  resolveSidebarMobileRenderStrategy(SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON),
  SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
);
assert.equal(
  resolveSidebarMobileRenderStrategy(SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP),
  SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP
);
assert.equal(
  resolveSidebarMobileRenderStrategy("unknown-mobile-strategy"),
  DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY
);

assert.deepEqual(resolveSidebarContentRequiredGridSize({
  grid: {
    columns: 4,
    rows: 20
  },
  items: [
    {
      id: "nav-bottom",
      x: 2,
      y: 3,
      w: 2,
      h: 2
    }
  ]
}), {
  columns: 3,
  rows: 4
});

const fixed = facade.setState({
  item: created.item,
  state: SIDEBAR_STATES.FIXED
});

assert.equal(fixed.valid, true);
assert.equal(fixed.item.meta.sidebar.state, SIDEBAR_STATES.FIXED);
assert.deepEqual(fixed.item.meta.sidebar.expandedArea, { x: 1, y: 3, w: 4, h: 10 });
assert.deepEqual(fixed.item.meta.sidebar.content, created.item.meta.sidebar.content);
assert.equal(facade.resolveLayer(fixed.item), SIDEBAR_LAYERS.LAYOUT);

const configured = facade.setSettings({
  item: created.item,
  settings: {
    trigger: SIDEBAR_TRIGGERS.HOVER,
    animation: SIDEBAR_ANIMATIONS.FADE,
    collapsedSize: { w: 2, h: 3 },
    responsive: {
      narrow: SIDEBAR_STATES.OVERLAY,
      mobile: SIDEBAR_STATES.COLLAPSED
    }
  }
});

assert.equal(configured.valid, true);
assert.equal(configured.changed, true);
assert.equal(configured.item.meta.sidebar.trigger, SIDEBAR_TRIGGERS.HOVER);
assert.equal(configured.item.meta.sidebar.animation, SIDEBAR_ANIMATIONS.FADE);
assert.deepEqual(configured.item.meta.sidebar.collapsedSize, { w: 2, h: 3 });
assert.deepEqual(configured.item.meta.sidebar.responsive, {
  narrow: SIDEBAR_STATES.OVERLAY,
  mobile: SIDEBAR_STATES.COLLAPSED
});
assert.deepEqual(configured.item.meta.sidebar.expandedArea, { x: 1, y: 3, w: 4, h: 10 });

const configuredMobileStrategy = facade.setSettings({
  item: configured.item,
  settings: {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP
  }
});

assert.equal(configuredMobileStrategy.valid, true);
assert.equal(configuredMobileStrategy.changed, true);
assert.equal(
  configuredMobileStrategy.item.meta.sidebar.mobileRenderStrategy,
  SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP
);
assert.deepEqual(configuredMobileStrategy.item.meta.sidebar.responsive, configured.item.meta.sidebar.responsive);

const unknownMobileStrategy = facade.setSettings({
  item: configuredMobileStrategy.item,
  settings: {
    mobileRenderStrategy: "unknown-mobile-strategy"
  }
});

assert.equal(unknownMobileStrategy.valid, true);
assert.equal(
  unknownMobileStrategy.item.meta.sidebar.mobileRenderStrategy,
  DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY
);

const configuredMobileLayout = facade.setSettings({
  item: configuredMobileStrategy.item,
  settings: {
    mobileLayout: {
      compactButtonArea: {
        x: "4.6",
        y: 1.2,
        w: 2.4,
        h: "2"
      }
    }
  }
});

assert.equal(configuredMobileLayout.valid, true);
assert.equal(configuredMobileLayout.changed, true);
assert.deepEqual(configuredMobileLayout.item.meta.sidebar.mobileLayout, {
  compactBarArea: null,
  compactButtonArea: {
    x: 5,
    y: 1,
    w: 2,
    h: 2
  },
  iconStrip: {
    barArea: null,
    itemsById: {}
  }
});
assert.deepEqual(configuredMobileLayout.item.meta.sidebar.responsive, configuredMobileStrategy.item.meta.sidebar.responsive);
assert.equal(configuredMobileLayout.item.meta.sidebar.dock, configuredMobileStrategy.item.meta.sidebar.dock);
assert.equal(
  configuredMobileLayout.item.meta.sidebar.mobileRenderStrategy,
  configuredMobileStrategy.item.meta.sidebar.mobileRenderStrategy
);

const invalidMobileLayout = facade.setSettings({
  item: configuredMobileLayout.item,
  settings: {
    mobileLayout: {
      compactButtonArea: {
        x: "bad",
        y: 1,
        w: 2,
        h: 2
      }
    }
  }
});

assert.equal(invalidMobileLayout.valid, true);
assert.deepEqual(invalidMobileLayout.item.meta.sidebar.mobileLayout, DEFAULT_SIDEBAR_MOBILE_LAYOUT);

const configuredContent = facade.setSettings({
  item: created.item,
  settings: {
    content: {
      grid: {
        columns: 3,
        rows: 4
      },
      items: [
        {
          id: "nav-main",
          type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
          x: 0,
          y: 1,
          w: 10,
          h: 1,
          text: "Main",
          action: {
            type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
            pageId: "layout-page"
          },
          style: {
            fontSize: "18",
            fontWeight: "bold",
            align: SIDEBAR_CONTENT_TEXT_ALIGNS.LEFT,
            textColor: "#ABCDEF",
            backgroundColor: "#123456",
            borderColor: "#654321",
            borderWidth: "2",
            fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.MONO,
            lineHeight: "1.55",
            textOpacity: "0.55",
            backgroundOpacity: "0.35"
          },
          textFit: SIDEBAR_TEXT_FIT_MODES.SHRINK
        },
        {
          id: "nav-main",
          type: "unknown-type",
          x: 3,
          y: 6,
          w: 2,
          h: 2,
          text: null,
          action: {
            type: "unknown-action",
            pageId: "ignored-page"
          },
          style: {
            fontSize: 200,
            fontWeight: 77,
            align: "unknown-align",
            textColor: "not-a-color",
            backgroundColor: "rgb(1, 2, 3)",
            borderColor: "transparent",
            borderWidth: 99,
            fontFamily: "unknown-family",
            lineHeight: 4,
            textOpacity: 0,
            backgroundOpacity: 7
          },
          textFit: "unknown-fit"
        }
      ]
    }
  }
});

assert.equal(configuredContent.valid, true);
assert.equal(configuredContent.changed, true);
assert.deepEqual(configuredContent.item.meta.sidebar.content.grid, {
  columns: 3,
  rows: 4
});
assert.deepEqual(configuredContent.item.meta.sidebar.content.items[0], {
  id: "nav-main",
  type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
  x: 1,
  y: 1,
  w: 3,
  h: 1,
  text: "Main",
  action: {
    type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
    pageId: "layout-page",
    routeId: null,
    workspaceId: null
  },
  style: {
    fontSize: 18,
    fontWeight: 700,
    align: SIDEBAR_CONTENT_TEXT_ALIGNS.LEFT,
    textColor: "#abcdef",
    backgroundColor: "#123456",
    borderColor: "#654321",
    borderWidth: 2,
    fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.MONO,
    lineHeight: 1.55,
    textOpacity: 0.55,
    backgroundOpacity: 0.35
  },
  textFit: SIDEBAR_TEXT_FIT_MODES.SHRINK
});
assert.deepEqual(configuredContent.item.meta.sidebar.content.items[1], {
  id: "nav-main-2",
  type: SIDEBAR_CONTENT_ITEM_TYPES.BUTTON,
  x: 3,
  y: 4,
  w: 1,
  h: 1,
  text: "",
  action: {
    type: SIDEBAR_CONTENT_ACTION_TYPES.NONE
  },
  style: {
    fontSize: 96,
    fontWeight: 100,
    fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM,
    lineHeight: 2,
    align: SIDEBAR_CONTENT_TEXT_ALIGNS.CENTER,
    borderWidth: 8,
    textOpacity: 0.1,
    backgroundOpacity: 1
  },
  textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
});

const updatedContentItem = facade.setContentItem({
  item: configuredContent.item,
  contentItemId: "nav-main",
  patch: {
    id: "nav-renamed",
    x: 2,
    y: 2,
    w: 10,
    h: 2,
    text: "Updated",
    action: {
      type: SIDEBAR_CONTENT_ACTION_TYPES.NONE
    },
    style: {
      fontSize: 4,
      fontWeight: 865,
      align: SIDEBAR_CONTENT_TEXT_ALIGNS.RIGHT,
      textColor: "#0F766E",
      backgroundColor: "#DCFCE7",
      borderColor: "#14532D",
      borderWidth: 12,
      fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.SERIF,
      lineHeight: 0.2,
      textOpacity: 1.5,
      backgroundOpacity: -1
    },
    textFit: SIDEBAR_TEXT_FIT_MODES.TRUNCATE
  }
});

assert.equal(updatedContentItem.valid, true);
assert.equal(updatedContentItem.changed, true);
assert.deepEqual(updatedContentItem.contentItem, {
  id: "nav-main",
  type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
  x: 2,
  y: 2,
  w: 3,
  h: 2,
  text: "Updated",
  action: {
    type: SIDEBAR_CONTENT_ACTION_TYPES.NONE
  },
  style: {
    fontSize: 6,
    fontWeight: 900,
    align: SIDEBAR_CONTENT_TEXT_ALIGNS.RIGHT,
    textColor: "#0f766e",
    backgroundColor: "#dcfce7",
    borderColor: "#14532d",
    borderWidth: 8,
    fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.SERIF,
    lineHeight: 0.8,
    textOpacity: 1,
    backgroundOpacity: 0.1
  },
  textFit: SIDEBAR_TEXT_FIT_MODES.TRUNCATE
});
assert.equal(updatedContentItem.item.meta.sidebar.content.items[1].id, "nav-main-2");

const disabledContentItem = facade.setContentItem({
  item: updatedContentItem.item,
  contentItemId: "nav-main",
  patch: {
    disabled: true,
    variant: "primary"
  }
});

assert.equal(disabledContentItem.valid, true);
assert.equal(disabledContentItem.contentItem.disabled, true);
assert.equal(disabledContentItem.contentItem.variant, "primary");

const geometryStatus = resolveSidebarContentItemGeometryStatus({
  content: {
    grid: {
      columns: 3,
      rows: 4
    },
    items: [
      { id: "nav-main", x: 1, y: 1, w: 2, h: 1 },
      { id: "nav-secondary", x: 2, y: 1, w: 1, h: 1 }
    ]
  },
  contentItemId: "nav-main"
});

assert.equal(geometryStatus.valid, false);
assert.equal(geometryStatus.reason, SIDEBAR_CONTENT_GEOMETRY_ERROR_CODES.CONTENT_ITEM_OVERLAP);
assert.deepEqual(geometryStatus.collisions, [
  {
    contentItemId: "nav-secondary",
    area: { x: 2, y: 1, w: 1, h: 1 }
  }
]);
assert.equal(
  facade.resolveContentItemGeometryStatus({
    content: {
      items: [
        { id: "nav-main", x: 1, y: 1, w: 1, h: 1 },
        { id: "nav-secondary", x: 2, y: 1, w: 1, h: 1 }
      ]
    },
    contentItemId: "nav-main"
  }).valid,
  true
);

const overlappingContentItem = facade.setContentItem({
  item: configuredContent.item,
  contentItemId: "nav-main",
  patch: {
    x: 3,
    y: 4,
    w: 1,
    h: 1
  }
});

assert.equal(overlappingContentItem.valid, false);
assert.equal(overlappingContentItem.reason, SIDEBAR_CONTENT_GEOMETRY_ERROR_CODES.CONTENT_ITEM_OVERLAP);
assert.deepEqual(overlappingContentItem.details.collisions, [
  {
    contentItemId: "nav-main-2",
    area: { x: 3, y: 4, w: 1, h: 1 }
  }
]);

const wideSidebarContentMove = facade.setContentItem({
  item: {
    ...configuredContent.item,
    w: 8,
    meta: {
      ...configuredContent.item.meta,
      sidebar: {
        ...configuredContent.item.meta.sidebar,
        expandedArea: {
          ...configuredContent.item.meta.sidebar.expandedArea,
          w: 8
        }
      }
    }
  },
  contentItemId: "nav-main",
  patch: {
    x: 5,
    y: 1,
    w: 4,
    h: 1
  }
});

assert.equal(wideSidebarContentMove.valid, true);
assert.deepEqual(wideSidebarContentMove.content.grid, {
  columns: 8,
  rows: 10
});
assert.deepEqual(pickContentItemArea(wideSidebarContentMove.contentItem), {
  x: 5,
  y: 1,
  w: 4,
  h: 1
});

const textFitDiagnostics = facade.resolveContentTextFitDiagnostics({
  content: {
    grid: {
      columns: 3,
      rows: 4
    },
    items: [
      {
        id: "short-text",
        x: 1,
        y: 1,
        w: 3,
        h: 1,
        text: "Ok",
        style: {
          fontSize: 14
        },
        textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
      },
      {
        id: "long-wrap",
        x: 1,
        y: 2,
        w: 1,
        h: 1,
        text: "Very long sidebar item label",
        style: {
          fontSize: 20
        },
        textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
      },
      {
        id: "long-truncate",
        x: 1,
        y: 3,
        w: 1,
        h: 1,
        text: "Very long sidebar item label",
        style: {
          fontSize: 20
        },
        textFit: SIDEBAR_TEXT_FIT_MODES.TRUNCATE
      },
      {
        id: "request-resize",
        x: 1,
        y: 4,
        w: 1,
        h: 1,
        text: "Resize this label",
        style: {
          fontSize: 18
        },
        textFit: SIDEBAR_TEXT_FIT_MODES.REQUEST_RESIZE
      }
    ]
  },
  cellSize: 24
});

assert.equal(textFitDiagnostics.valid, true);
assert.equal(textFitDiagnostics.summary.items, 4);
assert.deepEqual(
  textFitDiagnostics.diagnostics.map((diagnostic) => diagnostic.itemId),
  ["long-wrap", "request-resize"]
);
assert.deepEqual(
  textFitDiagnostics.diagnostics.map((diagnostic) => diagnostic.code),
  [
    SIDEBAR_CONTENT_TEXT_FIT_DIAGNOSTIC_CODES.TEXT_OVERFLOW,
    SIDEBAR_CONTENT_TEXT_FIT_DIAGNOSTIC_CODES.REQUEST_RESIZE
  ]
);
assert.equal(
  textFitDiagnostics.diagnostics[0].message,
  "Текст не помещается. Увеличьте кнопку, сайдбар или уменьшите шрифт."
);
assert.equal(typeof textFitDiagnostics.diagnostics[0].details.requiredLines, "number");
assert.equal(typeof textFitDiagnostics.diagnostics[0].details.availableLines, "number");
assert.equal(
  resolveSidebarContentTextFitDiagnostics({
    content: {
      items: [
        {
          id: "large-text",
          x: 1,
          y: 1,
          w: 4,
          h: 2,
          text: "Enough room",
          style: {
            fontSize: 14
          },
          textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
        }
      ]
    },
    cellSize: 24
  }).diagnostics.length,
  0
);

const contentProtectedSidebar = facade.setSettings({
  item: {
    ...created.item,
    h: 2,
    meta: {
      ...created.item.meta,
      sidebar: {
        ...created.item.meta.sidebar,
        expandedArea: {
          ...created.item.meta.sidebar.expandedArea,
          h: 2
        }
      }
    }
  },
  settings: {
    content: {
      grid: {
        columns: 3,
        rows: 4
      },
      items: [
        {
          id: "nav-bottom",
          x: 1,
          y: 4,
          w: 3,
          h: 1,
          text: "Bottom"
        }
      ]
    }
  }
});

assert.equal(contentProtectedSidebar.valid, true);
assert.equal(contentProtectedSidebar.item.h, 4);
assert.deepEqual(contentProtectedSidebar.item.meta.sidebar.expandedArea, { x: 1, y: 3, w: 4, h: 4 });

const missingContentItem = facade.setContentItem({
  item: configuredContent.item,
  contentItemId: "missing-nav",
  patch: {
    text: "Missing"
  }
});

assert.equal(missingContentItem.valid, false);
assert.equal(missingContentItem.reason, "content-item-not-found");

const invalidContentSidebar = facade.setContentItem({
  item: {
    id: "content-block",
    meta: {
      blockType: "content"
    }
  },
  contentItemId: "nav-main",
  patch: {
    text: "Invalid"
  }
});

assert.equal(invalidContentSidebar.valid, false);
assert.equal(invalidContentSidebar.reason, "item-is-not-sidebar");

const responsiveFixedFallback = facade.setSettings({
  item: created.item,
  settings: {
    responsive: {
      narrow: SIDEBAR_STATES.FIXED,
      mobile: SIDEBAR_STATES.FIXED
    }
  }
});

assert.deepEqual(responsiveFixedFallback.item.meta.sidebar.responsive, DEFAULT_SIDEBAR_RESPONSIVE);

const defaultRenderModel = resolveSidebarRenderModel(created.item, { metrics });

assert.equal(defaultRenderModel.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.NONE);
assert.equal(defaultRenderModel.mobilePresentation.buttonArea, null);
assert.equal(defaultRenderModel.areaMode, "expanded");
assert.deepEqual(defaultRenderModel.renderArea, { x: 1, y: 3, w: 4, h: 10 });

const collapsedRenderModel = resolveSidebarRenderModel({
  ...created.item,
  meta: {
    ...created.item.meta,
    sidebar: {
      ...created.item.meta.sidebar,
      state: SIDEBAR_STATES.COLLAPSED
    }
  }
});

assert.equal(collapsedRenderModel.areaMode, "collapsed");
assert.equal(collapsedRenderModel.renderMode, SIDEBAR_RENDER_MODES.COLLAPSED);
assert.deepEqual(collapsedRenderModel.expandedArea, { x: 1, y: 3, w: 4, h: 10 });
assert.deepEqual(collapsedRenderModel.renderArea, { x: 1, y: 3, w: 1, h: 1 });

const hiddenRenderModel = resolveSidebarRenderModel({
  ...created.item,
  meta: {
    ...created.item.meta,
    sidebar: {
      ...created.item.meta.sidebar,
      state: SIDEBAR_STATES.HIDDEN
    }
  }
});

assert.equal(hiddenRenderModel.areaMode, "hidden");
assert.equal(hiddenRenderModel.renderMode, SIDEBAR_RENDER_MODES.HIDDEN);
assert.equal(hiddenRenderModel.hidden, false);
assert.deepEqual(hiddenRenderModel.renderArea, { x: 1, y: 3, w: 1, h: 1 });

const narrowRenderModel = resolveSidebarRenderModel(created.item, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.NARROW
});
const mobileRenderModel = resolveSidebarRenderModel(created.item, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE
});

assert.equal(narrowRenderModel.state, SIDEBAR_STATES.COLLAPSED);
assert.deepEqual(narrowRenderModel.renderArea, { x: 1, y: 3, w: 1, h: 1 });
assert.equal(mobileRenderModel.state, SIDEBAR_STATES.COLLAPSED);
assert.equal(mobileRenderModel.hidden, false);
assert.deepEqual(mobileRenderModel.renderArea, { x: 1, y: 3, w: 1, h: 1 });
assert.equal(mobileRenderModel.mobileRenderStrategy, DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY);
assert.equal(
  mobileRenderModel.mobilePresentation.mode,
  SIDEBAR_MOBILE_PRESENTATION_MODES.COMPACT_MENU_BUTTON
);
assert.deepEqual(mobileRenderModel.mobilePresentation.buttonArea, { x: 1, y: 3, w: 1, h: 1 });
assert.equal(mobileRenderModel.mobilePresentation.contentArea, null);

const iconStripRenderModel = resolveSidebarRenderModel(configuredMobileStrategy.item, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE
});

assert.equal(iconStripRenderModel.mobileRenderStrategy, SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP);
assert.equal(iconStripRenderModel.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.ICON_STRIP);
assert.equal(iconStripRenderModel.mobilePresentation.buttonArea, null);
assert.equal(iconStripRenderModel.mobilePresentation.contentArea, null);
assert.equal(iconStripRenderModel.state, SIDEBAR_STATES.COLLAPSED);
assert.deepEqual(iconStripRenderModel.renderArea, { x: 1, y: 3, w: 2, h: 3 });

const iconStripManualButtonRenderModel = resolveSidebarRenderModel(configuredMobileLayout.item, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE
});

assert.equal(iconStripManualButtonRenderModel.mobileRenderStrategy, SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP);
assert.equal(iconStripManualButtonRenderModel.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.ICON_STRIP);
assert.equal(iconStripManualButtonRenderModel.mobilePresentation.buttonArea, null);

const fixedMobileRenderModel = resolveSidebarRenderModel(fixed.item, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics
});

assert.equal(fixedMobileRenderModel.state, SIDEBAR_STATES.FIXED);
assert.equal(fixedMobileRenderModel.hidden, false);
assert.equal(fixedMobileRenderModel.viewportLayout.mode, "top-bar");
assert.equal(fixedMobileRenderModel.viewportLayout.dock, SIDEBAR_DOCKS.TOP);
assert.equal(fixedMobileRenderModel.viewportLayout.sourceDock, SIDEBAR_DOCKS.LEFT);
assert.deepEqual(fixedMobileRenderModel.renderArea, { x: 1, y: 1, w: 24, h: 2 });
assert.equal(
  fixedMobileRenderModel.mobilePresentation.mode,
  SIDEBAR_MOBILE_PRESENTATION_MODES.COMPACT_MENU_BUTTON
);
assert.deepEqual(fixedMobileRenderModel.mobilePresentation.buttonArea, { x: 1, y: 1, w: 2, h: 2 });

for (const [dock, expectedButtonArea] of [
  [SIDEBAR_DOCKS.RIGHT, { x: 23, y: 1, w: 2, h: 2 }],
  [SIDEBAR_DOCKS.TOP, { x: 23, y: 1, w: 2, h: 2 }],
  [SIDEBAR_DOCKS.BOTTOM, { x: 23, y: 1, w: 2, h: 2 }]
]) {
  const dockedFixedMobileRenderModel = resolveSidebarRenderModel(createFixedDockedSidebarItem(dock), {
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    metrics
  });

  assert.equal(dockedFixedMobileRenderModel.state, SIDEBAR_STATES.FIXED);
  assert.equal(dockedFixedMobileRenderModel.viewportLayout.mode, "top-bar");
  assert.equal(dockedFixedMobileRenderModel.viewportLayout.sourceDock, dock);
  assert.deepEqual(dockedFixedMobileRenderModel.renderArea, { x: 1, y: 1, w: 24, h: 2 });
  assert.equal(
    dockedFixedMobileRenderModel.mobilePresentation.mode,
    SIDEBAR_MOBILE_PRESENTATION_MODES.COMPACT_MENU_BUTTON
  );
  assert.deepEqual(dockedFixedMobileRenderModel.mobilePresentation.buttonArea, expectedButtonArea);
}

assert.deepEqual(
  resolveSidebarMobilePresentation({
    state: SIDEBAR_STATES.FIXED,
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    areaMode: "expanded",
    renderArea: { x: 1, y: 1, w: 12, h: 2 },
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
  }).buttonArea,
  { x: 11, y: 1, w: 2, h: 2 }
);

const fixedManualButtonRenderModel = resolveSidebarRenderModel(createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
  mobileLayout: {
    compactButtonArea: {
      x: 10,
      y: 1,
      w: 2,
      h: 2
    }
  }
}), {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics
});

assert.deepEqual(fixedManualButtonRenderModel.renderArea, { x: 1, y: 1, w: 24, h: 2 });
assert.deepEqual(fixedManualButtonRenderModel.mobilePresentation.buttonArea, { x: 10, y: 1, w: 2, h: 2 });

assert.deepEqual(
  resolveSidebarMobilePresentation({
    state: SIDEBAR_STATES.FIXED,
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    areaMode: "expanded",
    renderArea: { x: 1, y: 1, w: 12, h: 2 },
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    mobileLayout: {
      compactButtonArea: {
        x: 99,
        y: 1,
        w: 2,
        h: 2
      }
    },
    sourceDock: SIDEBAR_DOCKS.LEFT
  }).buttonArea,
  { x: 11, y: 1, w: 2, h: 2 }
);
assert.deepEqual(
  resolveSidebarMobilePresentation({
    state: SIDEBAR_STATES.FIXED,
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    areaMode: "expanded",
    renderArea: { x: 1, y: 1, w: 12, h: 2 },
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    mobileLayout: {
      compactButtonArea: {
        x: 1,
        y: 99,
        w: 2,
        h: 2
      }
    },
    sourceDock: SIDEBAR_DOCKS.LEFT
  }).buttonArea,
  { x: 1, y: 1, w: 2, h: 2 }
);
assert.deepEqual(
  resolveSidebarMobilePresentation({
    state: SIDEBAR_STATES.FIXED,
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    areaMode: "expanded",
    renderArea: { x: 1, y: 1, w: 1, h: 1 },
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    mobileLayout: {
      compactButtonArea: {
        x: 5,
        y: 5,
        w: 2,
        h: 2
      }
    },
    sourceDock: SIDEBAR_DOCKS.RIGHT
  }).buttonArea,
  { x: 1, y: 1, w: 1, h: 1 }
);

const fixedDefaultRenderModel = resolveSidebarRenderModel(fixed.item, { metrics });

assert.equal(fixedDefaultRenderModel.viewportLayout.mode, "declared");
assert.deepEqual(fixedDefaultRenderModel.renderArea, { x: 1, y: 3, w: 4, h: 10 });
assert.equal(fixedDefaultRenderModel.mobileRenderStrategy, DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY);
assert.equal(fixedDefaultRenderModel.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.NONE);
assert.equal(fixedDefaultRenderModel.mobilePresentation.buttonArea, null);

assert.equal(
  resolveSidebarViewportModeFromMetrics({
    debug: {
      mode: "minimum",
      horizontalMode: "normal",
      verticalMode: "min-limit"
    }
  }),
  SIDEBAR_VIEWPORT_MODES.DEFAULT
);
assert.equal(
  resolveSidebarViewportModeFromMetrics({
    debug: {
      mode: "compact-width",
      horizontalMode: "compact",
      verticalMode: "normal"
    }
  }),
  SIDEBAR_VIEWPORT_MODES.NARROW
);
assert.equal(
  resolveSidebarViewportModeFromMetrics({
    debug: {
      mode: "minimum",
      horizontalMode: "min-limit",
      verticalMode: "normal"
    }
  }),
  SIDEBAR_VIEWPORT_MODES.MOBILE
);

const fixedPolicy = facade.resolveStatePolicy(fixed.item);
const overlayPolicy = facade.resolveStatePolicy(created.item);
const collapsedPolicy = facade.resolveStatePolicy(SIDEBAR_STATES.COLLAPSED);
const hiddenPolicy = facade.resolveStatePolicy(SIDEBAR_STATES.HIDDEN);

assert.equal(fixedPolicy.layer, SIDEBAR_LAYERS.LAYOUT);
assert.equal(fixedPolicy.reservesSpace, true);
assert.equal(fixedPolicy.allowsWorkspaceBlocksUnder, false);
assert.equal(fixedPolicy.reflowOnEnter, true);
assert.equal(overlayPolicy.layer, SIDEBAR_LAYERS.OVERLAY);
assert.equal(overlayPolicy.reservesSpace, false);
assert.equal(overlayPolicy.allowsWorkspaceBlocksUnder, true);
assert.equal(collapsedPolicy.renderMode, SIDEBAR_RENDER_MODES.COLLAPSED);
assert.equal(collapsedPolicy.allowsWorkspaceBlocksUnder, true);
assert.equal(hiddenPolicy.renderMode, SIDEBAR_RENDER_MODES.HIDDEN);
assert.equal(hiddenPolicy.reservesSpace, false);

const topFixed = facade.createFromArea({
  item: {
    id: "sidebar-top",
    x: 2,
    y: 1,
    w: 12,
    h: 2,
    meta: {
      blockType: "sidebar",
      value: "Top bar",
      sidebar: {
        state: SIDEBAR_STATES.FIXED
      }
    }
  },
  metrics
});

const overlayRight = facade.createFromArea({
  item: {
    id: "sidebar-right-overlay",
    x: 21,
    y: 2,
    w: 4,
    h: 10,
    meta: {
      blockType: "sidebar",
      value: "Overlay right"
    }
  },
  metrics
});

const scene = [
  fixed.item,
  topFixed.item,
  overlayRight.item,
  { id: "content-main", x: 6, y: 4, w: 12, h: 10, meta: { blockType: "content" } }
];
const layerProjection = facade.projectScene(scene);

assert.equal(layerProjection.layoutItems.length, 3);
assert.equal(layerProjection.overlayItems.length, 1);
assert.equal(layerProjection.overlayItems[0].id, "sidebar-right-overlay");

const hiddenSidebar = facade.setState({
  item: overlayRight.item,
  state: SIDEBAR_STATES.HIDDEN
});
const projection = facade.projectScene([
  fixed.item,
  hiddenSidebar.item,
  { id: "content-projected", x: 6, y: 4, w: 12, h: 10, meta: { blockType: "content" } }
]);

assert.deepEqual(
  projection.layoutItems.map((item) => item.id),
  ["sidebar-left", "content-projected"]
);
assert.deepEqual(
  projection.overlayItems.map((item) => item.id),
  ["sidebar-right-overlay"]
);
assert.deepEqual(
  projection.hiddenItems.map((item) => item.id),
  []
);
assert.deepEqual(
  projection.renderItems.map((item) => item.id),
  ["sidebar-left", "sidebar-right-overlay", "content-projected"]
);

const legacyProjection = facade.projectScene([
  { id: "legacy-sidebar", x: 1, y: 1, w: 4, h: 8, meta: { blockType: "sidebar" } },
  { id: "legacy-content", x: 6, y: 1, w: 4, h: 8, meta: { blockType: "content" } }
]);

assert.deepEqual(
  legacyProjection.layoutItems.map((item) => item.id),
  ["legacy-sidebar", "legacy-content"]
);
assert.deepEqual(legacyProjection.overlayItems, []);

const legacyReserved = facade.resolveReservedArea({
  items: legacyProjection.layoutItems,
  metrics
});

assert.deepEqual(legacyReserved.reservedArea, {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
});
assert.deepEqual(legacyReserved.participants, []);

const reserved = facade.resolveReservedArea({ items: scene, metrics });

assert.deepEqual(reserved.reservedArea, {
  left: 4,
  right: 0,
  top: 2,
  bottom: 0
});
assert.equal(reserved.participants.length, 2);

const narrowReserved = facade.resolveReservedArea({
  items: scene,
  metrics: {
    ...metrics,
    debug: {
      mode: "compact-width",
      horizontalMode: "compact"
    }
  }
});

assert.deepEqual(narrowReserved.reservedArea, {
  left: 0,
  right: 0,
  top: 2,
  bottom: 0
});
assert.deepEqual(
  narrowReserved.participants.map((participant) => participant.dock),
  [SIDEBAR_DOCKS.TOP, SIDEBAR_DOCKS.TOP]
);

const normalizedLegacySidebar = facade.createFromArea({
  item: {
    id: "legacy-contract-sidebar",
    x: 20,
    y: 4,
    w: 4,
    h: 8,
    meta: {
      blockType: "sidebar",
      sidebar: {
        state: "unknown-state",
        trigger: "unknown-trigger",
        animation: "unknown-animation",
        responsive: {
          narrow: "unknown-responsive-state"
        }
      }
    }
  },
  metrics
});

assert.equal(normalizedLegacySidebar.valid, true);
assert.equal(normalizedLegacySidebar.item.meta.sidebar.state, SIDEBAR_STATES.OVERLAY);
assert.equal(normalizedLegacySidebar.item.meta.sidebar.dock, SIDEBAR_DOCKS.RIGHT);
assert.deepEqual(normalizedLegacySidebar.item.meta.sidebar.expandedArea, { x: 20, y: 4, w: 4, h: 8 });
assert.deepEqual(normalizedLegacySidebar.item.meta.sidebar.collapsedSize, { w: 1, h: 1 });
assert.equal(normalizedLegacySidebar.item.meta.sidebar.trigger, SIDEBAR_TRIGGERS.CLICK);
assert.equal(normalizedLegacySidebar.item.meta.sidebar.animation, SIDEBAR_ANIMATIONS.SLIDE);
assert.deepEqual(normalizedLegacySidebar.item.meta.sidebar.responsive, DEFAULT_SIDEBAR_RESPONSIVE);

const migratedOldMobileHiddenSidebar = facade.createFromArea({
  item: {
    id: "old-mobile-hidden-sidebar",
    x: 1,
    y: 1,
    w: 4,
    h: 8,
    meta: {
      blockType: "sidebar",
      sidebar: {
        version: 1,
        state: SIDEBAR_STATES.OVERLAY,
        responsive: {
          narrow: SIDEBAR_STATES.COLLAPSED,
          mobile: SIDEBAR_STATES.HIDDEN
        }
      }
    }
  },
  metrics
});

assert.equal(migratedOldMobileHiddenSidebar.valid, true);
assert.equal(migratedOldMobileHiddenSidebar.item.meta.sidebar.version, SIDEBAR_CONTRACT_VERSION);
assert.equal(migratedOldMobileHiddenSidebar.item.meta.sidebar.responsive.mobile, SIDEBAR_STATES.COLLAPSED);

assert.equal(created.item.meta.sidebar.mobileLayout.iconStrip.barArea, null);

const configuredIconStripBarArea = facade.setSettings({
  item: fixed.item,
  settings: {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    mobileLayout: {
      iconStrip: {
        barArea: {
          x: 1.4,
          y: 1,
          w: 12,
          h: 4
        }
      }
    }
  }
});

assert.equal(configuredIconStripBarArea.valid, true);
assert.deepEqual(
  configuredIconStripBarArea.item.meta.sidebar.mobileLayout.iconStrip.barArea,
  { x: 1, y: 1, w: 12, h: 4 }
);

const invalidIconStripBarArea = facade.setSettings({
  item: configuredIconStripBarArea.item,
  settings: {
    mobileLayout: {
      iconStrip: {
        barArea: {
          x: 0,
          y: 1,
          w: 2,
          h: 2
        }
      }
    }
  }
});

assert.equal(invalidIconStripBarArea.valid, true);
assert.equal(
  invalidIconStripBarArea.item.meta.sidebar.mobileLayout.iconStrip.barArea,
  null
);

const fixedIconStripWithoutBarArea = resolveSidebarRenderModel(
  createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    content: {
      grid: DEFAULT_SIDEBAR_CONTENT_GRID,
      items: [{ id: "nav-layout", x: 1, y: 1, w: 4, h: 1, text: "Layout" }]
    }
  }),
  {
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    metrics
  }
);

assert.deepEqual(fixedIconStripWithoutBarArea.renderArea, { x: 1, y: 1, w: 24, h: 2 });
assert.deepEqual(fixedIconStripWithoutBarArea.expandedArea, { x: 1, y: 3, w: 4, h: 10 });

const fixedIconStripWithBarArea = resolveSidebarRenderModel(
  createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    mobileLayout: {
      iconStrip: {
        barArea: { x: 1, y: 1, w: 12, h: 4 },
        itemsById: {}
      }
    },
    content: {
      grid: DEFAULT_SIDEBAR_CONTENT_GRID,
      items: [{ id: "nav-layout", x: 1, y: 1, w: 4, h: 1, text: "Layout" }]
    }
  }),
  {
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    metrics
  }
);

assert.deepEqual(fixedIconStripWithBarArea.renderArea, { x: 1, y: 1, w: 12, h: 4 });
assert.deepEqual(fixedIconStripWithBarArea.expandedArea, { x: 1, y: 3, w: 4, h: 10 });

const desktopWithIconStripBarArea = resolveSidebarRenderModel(
  createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    mobileLayout: {
      iconStrip: {
        barArea: { x: 1, y: 1, w: 12, h: 4 },
        itemsById: {}
      }
    }
  }),
  {
    viewportMode: SIDEBAR_VIEWPORT_MODES.DEFAULT,
    metrics
  }
);

assert.deepEqual(desktopWithIconStripBarArea.renderArea, { x: 1, y: 3, w: 4, h: 10 });

const compactWithIconStripBarArea = resolveSidebarRenderModel(
  createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    mobileLayout: {
      iconStrip: {
        barArea: { x: 1, y: 1, w: 12, h: 4 },
        itemsById: {}
      }
    }
  }),
  {
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    metrics
  }
);

assert.deepEqual(compactWithIconStripBarArea.renderArea, { x: 1, y: 1, w: 24, h: 2 });

const fixedCompactWithoutBarArea = resolveSidebarRenderModel(
  createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
  }),
  {
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    metrics
  }
);

assert.deepEqual(fixedCompactWithoutBarArea.renderArea, { x: 1, y: 1, w: 24, h: 2 });
assert.deepEqual(fixedCompactWithoutBarArea.expandedArea, { x: 1, y: 3, w: 4, h: 10 });

const fixedCompactWithBarArea = resolveSidebarRenderModel(
  createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    mobileLayout: {
      compactBarArea: { x: 1, y: 1, w: 12, h: 4 },
      compactButtonArea: { x: 1, y: 1, w: 2, h: 2 }
    }
  }),
  {
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    metrics
  }
);

assert.deepEqual(fixedCompactWithBarArea.renderArea, { x: 1, y: 1, w: 12, h: 4 });
assert.deepEqual(fixedCompactWithBarArea.mobilePresentation.buttonArea, { x: 1, y: 1, w: 2, h: 2 });
assert.deepEqual(fixedCompactWithBarArea.expandedArea, { x: 1, y: 3, w: 4, h: 10 });

const iconStripWithCompactBarArea = resolveSidebarRenderModel(
  createFixedDockedSidebarItem(SIDEBAR_DOCKS.LEFT, {
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    mobileLayout: {
      compactBarArea: { x: 1, y: 1, w: 12, h: 4 },
      iconStrip: {
        barArea: { x: 1, y: 1, w: 12, h: 3 },
        itemsById: {}
      }
    }
  }),
  {
    viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
    metrics
  }
);

assert.deepEqual(iconStripWithCompactBarArea.renderArea, { x: 1, y: 1, w: 12, h: 3 });

assert.deepEqual(
  clampIconStripBarAreaToMetrics({ x: 20, y: 1, w: 20, h: 20 }, { columns: 12, rows: 16 }),
  { x: 1, y: 1, w: 12, h: 16 }
);

console.log("sidebar-element facade tests passed");

function pickContentItemArea(contentItem) {
  return {
    x: contentItem.x,
    y: contentItem.y,
    w: contentItem.w,
    h: contentItem.h
  };
}

function createFixedDockedSidebarItem(dock, sidebarPatch = {}) {
  return {
    id: `fixed-${dock}`,
    x: dock === SIDEBAR_DOCKS.RIGHT ? 21 : 1,
    y: dock === SIDEBAR_DOCKS.BOTTOM ? 13 : 3,
    w: dock === SIDEBAR_DOCKS.LEFT || dock === SIDEBAR_DOCKS.RIGHT ? 4 : 12,
    h: dock === SIDEBAR_DOCKS.TOP || dock === SIDEBAR_DOCKS.BOTTOM ? 2 : 10,
    meta: {
      blockType: "sidebar",
      sidebar: {
        dock,
        state: SIDEBAR_STATES.FIXED,
        ...sidebarPatch
      }
    }
  };
}
