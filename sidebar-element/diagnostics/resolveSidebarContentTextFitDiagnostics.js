import {
  DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE,
  SIDEBAR_TEXT_FIT_MODES,
  normalizeSidebarContent
} from "../contracts/sidebarContent.js";

export const SIDEBAR_CONTENT_TEXT_FIT_DIAGNOSTIC_CODES = {
  TEXT_OVERFLOW: "sidebar-content-text-overflow",
  REQUEST_RESIZE: "sidebar-content-text-request-resize"
};

const DEFAULT_CELL_SIZE = 24;
const DEFAULT_MIN_FONT_SIZE = 8;
const DEFAULT_HORIZONTAL_PADDING = 8;
const DEFAULT_VERTICAL_PADDING = 2;
const DEFAULT_AVERAGE_GLYPH_WIDTH_RATIO = 0.56;
const DEFAULT_LINE_HEIGHT_RATIO = 1.15;

export function resolveSidebarContentTextFitDiagnostics({
  content = {},
  cellSize = DEFAULT_CELL_SIZE,
  minFontSize = DEFAULT_MIN_FONT_SIZE
} = {}) {
  const normalizedContent = normalizeSidebarContent(content);
  const safeCellSize = normalizePositiveNumber(cellSize, DEFAULT_CELL_SIZE);
  const safeMinFontSize = normalizePositiveNumber(minFontSize, DEFAULT_MIN_FONT_SIZE);
  const diagnostics = normalizedContent.items
    .map((item) => resolveSidebarContentItemTextFitDiagnostic({
      item,
      cellSize: safeCellSize,
      minFontSize: safeMinFontSize
    }))
    .filter(Boolean);

  return {
    valid: true,
    diagnostics,
    summary: {
      items: normalizedContent.items.length,
      diagnostics: diagnostics.length
    }
  };
}

function resolveSidebarContentItemTextFitDiagnostic({ item, cellSize, minFontSize }) {
  if (!item?.text || item.textFit === SIDEBAR_TEXT_FIT_MODES.TRUNCATE) {
    return null;
  }

  const fontSize = normalizePositiveNumber(
    item.style?.fontSize,
    DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE.fontSize
  );
  const availableWidth = Math.max(1, item.w * cellSize - DEFAULT_HORIZONTAL_PADDING);
  const availableHeight = Math.max(1, item.h * cellSize - DEFAULT_VERTICAL_PADDING);
  const requiredLines = resolveRequiredLineCount({
    text: item.text,
    availableWidth,
    fontSize
  });
  const availableLines = Math.max(1, Math.floor(availableHeight / resolveLineHeight(fontSize)));

  if (requiredLines <= availableLines) {
    return null;
  }

  const suggestedFontSize = resolveSuggestedFontSize({
    text: item.text,
    availableWidth,
    availableHeight,
    currentFontSize: fontSize,
    minFontSize
  });

  return {
    code: item.textFit === SIDEBAR_TEXT_FIT_MODES.REQUEST_RESIZE
      ? SIDEBAR_CONTENT_TEXT_FIT_DIAGNOSTIC_CODES.REQUEST_RESIZE
      : SIDEBAR_CONTENT_TEXT_FIT_DIAGNOSTIC_CODES.TEXT_OVERFLOW,
    severity: "warning",
    itemId: item.id,
    message: "Текст не помещается. Увеличьте кнопку, сайдбар или уменьшите шрифт.",
    details: {
      textFit: item.textFit,
      fontSize,
      minFontSize,
      suggestedFontSize,
      availableLines,
      requiredLines,
      availableWidth,
      availableHeight
    }
  };
}

function resolveRequiredLineCount({ text, availableWidth, fontSize }) {
  const safeFontSize = normalizePositiveNumber(fontSize, DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE.fontSize);
  const charsPerLine = Math.max(
    1,
    Math.floor(availableWidth / (safeFontSize * DEFAULT_AVERAGE_GLYPH_WIDTH_RATIO))
  );

  return String(text)
    .split(/\r?\n/)
    .reduce((lineCount, line) => (
      lineCount + Math.max(1, Math.ceil(Array.from(line).length / charsPerLine))
    ), 0);
}

function resolveSuggestedFontSize({
  text,
  availableWidth,
  availableHeight,
  currentFontSize,
  minFontSize
}) {
  const safeCurrentFontSize = normalizePositiveNumber(
    currentFontSize,
    DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE.fontSize
  );
  const safeMinFontSize = normalizePositiveNumber(minFontSize, DEFAULT_MIN_FONT_SIZE);

  for (let fontSize = Math.floor(safeCurrentFontSize); fontSize >= safeMinFontSize; fontSize -= 1) {
    const requiredLines = resolveRequiredLineCount({ text, availableWidth, fontSize });
    const requiredHeight = requiredLines * resolveLineHeight(fontSize);

    if (requiredHeight <= availableHeight) {
      return fontSize;
    }
  }

  return null;
}

function resolveLineHeight(fontSize) {
  return fontSize * DEFAULT_LINE_HEIGHT_RATIO;
}

function normalizePositiveNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
}
