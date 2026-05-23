import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  CloseIcon,
  ControlIcon,
  CopyIcon,
  EditIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TrashIcon,
  WarningIcon
} from "../icons/GridDebugIcons.jsx";
import { BLOCK_CONTENT_TYPES } from "../../../engine-adapter/index.js";
import {
  SIDEBAR_CONTENT_FONT_FAMILIES,
  SIDEBAR_CONTENT_TEXT_ALIGNS,
  SIDEBAR_CONTENT_BUTTON_VARIANTS,
  SIDEBAR_STATES
} from "../../../sidebar-element/index.js";
import {
  isSidebarContentOperationMenuTarget,
  resolveSidebarContentOperationMenuTargetItem
} from "./operationMenuTarget.js";
import {
  formatSidebarNumberDraft,
  resolveSidebarNumberFieldCommit
} from "./sidebarNumberFieldDraft.js";
import { SidebarSettingsMenu } from "./SidebarSettingsMenu.jsx";

export function ItemActionMenu({
  target,
  item,
  mode,
  renameValue,
  floating = false,
  onClose,
  onCopy,
  onCreateLinkedBlock,
  onDelete,
  onRename,
  onRenameSidebarContentItem,
  onSetSidebarState,
  onStartRenameSidebarContentItem,
  onStartRename,
  onUpdateRenameValue,
  onUpdateSidebarContentItemGeometry,
  onUpdateSidebarContentItemPatch,
  onUpdateSidebarContentItemStyle
}) {
  const sidebarContentTarget = isSidebarContentOperationMenuTarget(target);
  const sidebarItem = isSidebar(item);
  const serviceItem = isServiceItem(item);
  const sidebarContentItem = resolveSidebarContentOperationMenuTargetItem({ target, item });
  const sidebarContentItemStyle = resolveSidebarContentItemStyle(sidebarContentItem);
  const sidebarSettings = resolveSidebarSettings(item);
  const menuClassName = [
    "grid-operation-item-menu",
    sidebarItem ? "is-sidebar" : "",
    sidebarContentTarget ? "is-sidebar-content" : "",
    !serviceItem && !sidebarItem ? "has-linked-actions" : "",
    floating ? "is-floating" : ""
  ].filter(Boolean).join(" ");

  if (sidebarContentTarget) {
    return (
      <div
        className={menuClassName}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid-operation-item-menu-actions is-sidebar-content">
          <span className="grid-operation-sidebar-content-kind">sidebar button</span>
          <button
            type="button"
            title={mode === "rename" ? "Сохранить название кнопки" : "Изменить название кнопки"}
            aria-label={mode === "rename" ? "Сохранить название кнопки" : "Изменить название кнопки"}
            disabled={!sidebarContentItem}
            onClick={(event) => (
              mode === "rename"
                ? onRenameSidebarContentItem?.(event, item, sidebarContentItem)
                : onStartRenameSidebarContentItem?.(event, item, sidebarContentItem)
            )}
          >
            {mode === "rename" ? <CheckIcon /> : <EditIcon />}
          </button>
          <button type="button" title="Закрыть меню" aria-label="Закрыть меню" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <SidebarContentNamePanel
          item={item}
          contentItem={sidebarContentItem}
          mode={mode}
          renameValue={renameValue}
          style={sidebarContentItemStyle}
          onClose={onClose}
          onRename={onRenameSidebarContentItem}
          onStartRename={onStartRenameSidebarContentItem}
          onUpdateRenameValue={onUpdateRenameValue}
        />
        <SidebarContentStylePanel
          item={item}
          contentItem={sidebarContentItem}
          onUpdateGeometry={onUpdateSidebarContentItemGeometry}
          onUpdatePatch={onUpdateSidebarContentItemPatch}
          style={sidebarContentItemStyle}
          onUpdateStyle={onUpdateSidebarContentItemStyle}
        />
      </div>
    );
  }

  if (mode === "rename") {
    return (
      <form
        className={`${menuClassName} is-rename`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => onRename(event, item)}
      >
        <input
          aria-label="Новое имя блока"
          value={renameValue}
          onChange={(event) => onUpdateRenameValue(event.target.value)}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === "Escape") {
              onClose(event);
            }
          }}
        />
        <button type="submit" title="Сохранить" aria-label="Сохранить">
          <CheckIcon />
        </button>
        <button type="button" title="Отменить" aria-label="Отменить" onClick={onClose}>
          <CloseIcon />
        </button>
      </form>
    );
  }

  return (
    <div
      className={menuClassName}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="grid-operation-item-menu-actions">
        <button type="button" title="Удалить" aria-label="Удалить" onClick={(event) => onDelete(event, item)}>
          <TrashIcon />
        </button>
        <button type="button" title="Копировать" aria-label="Копировать" onClick={(event) => onCopy(event, item)}>
          <CopyIcon />
        </button>
        <button type="button" title="Переименовать" aria-label="Переименовать" onClick={(event) => onStartRename(event, item)}>
          <EditIcon />
        </button>
        {!serviceItem && !sidebarItem && (
          <>
            <button
              type="button"
              title="Создать связанную опасность"
              aria-label="Создать связанную опасность"
              onClick={(event) => onCreateLinkedBlock?.(event, item, BLOCK_CONTENT_TYPES.WARNING)}
            >
              <WarningIcon />
            </button>
            <button
              type="button"
              title="Создать связанный контроль"
              aria-label="Создать связанный контроль"
              onClick={(event) => onCreateLinkedBlock?.(event, item, BLOCK_CONTENT_TYPES.CONTROL)}
            >
              <ControlIcon />
            </button>
          </>
        )}
        <button type="button" title="Закрыть меню" aria-label="Закрыть меню" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      {sidebarItem && (
        <SidebarSettingsMenu
          item={item}
          settings={sidebarSettings}
          onSetSidebarState={onSetSidebarState}
        />
      )}
    </div>
  );
}

function SidebarContentNamePanel({
  item,
  contentItem,
  mode,
  renameValue,
  style,
  onClose,
  onRename,
  onStartRename,
  onUpdateRenameValue
}) {
  const editing = mode === "rename";
  const editorStyle = resolveSidebarContentEditorStyle(style);

  return (
    <section className="grid-operation-sidebar-content-panel" aria-label="Внутренняя кнопка сайдбара">
      {editing ? (
        <textarea
          className="grid-operation-sidebar-content-text-window"
          aria-label="Название кнопки сайдбара"
          autoFocus
          rows={2}
          style={editorStyle}
          value={renameValue}
          disabled={!contentItem}
          onChange={(event) => onUpdateRenameValue(event.target.value)}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onRename?.(event, item, contentItem);
            }

            if (event.key === "Escape") {
              onClose(event);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="grid-operation-sidebar-content-title-button"
          disabled={!contentItem}
          style={editorStyle}
          title="Изменить название кнопки"
          aria-label="Изменить название кнопки"
          onClick={(event) => onStartRename?.(event, item, contentItem)}
        >
          <strong>{contentItem?.text || contentItem?.id || "Кнопка"}</strong>
        </button>
      )}
    </section>
  );
}

function SidebarContentStylePanel({
  item,
  contentItem,
  onUpdateGeometry,
  onUpdatePatch,
  style,
  onUpdateStyle
}) {
  const geometry = resolveSidebarContentItemGeometry(contentItem);
  const variant = resolveSidebarContentButtonVariant(contentItem?.variant);
  const disabled = Boolean(contentItem?.disabled);
  const active = Boolean(contentItem?.active);

  return (
    <section className="grid-operation-sidebar-content-style-panel" aria-label="Стиль внутренней кнопки">
      <div className="grid-operation-sidebar-content-section-title">Text</div>
      <label className="grid-operation-sidebar-style-row is-wide-control">
        <span>Font size</span>
        <SidebarNumberField
          min="6"
          max="96"
          step="1"
          value={style.fontSize}
          disabled={!contentItem}
          aria-label="Font size"
          onCommit={(event, value) => onUpdateStyle?.(event, item, contentItem, {
            fontSize: value
          })}
        />
      </label>
      <label className="grid-operation-sidebar-style-row">
        <span>Weight</span>
        <select
          value={style.fontWeight}
          disabled={!contentItem}
          aria-label="Толщина шрифта"
          onChange={(event) => onUpdateStyle?.(event, item, contentItem, {
            fontWeight: event.target.value
          })}
        >
          {SIDEBAR_FONT_WEIGHT_OPTIONS.map((weight) => (
            <option key={weight} value={weight}>{weight}</option>
          ))}
        </select>
      </label>
      <label className="grid-operation-sidebar-style-row">
        <span>Family</span>
        <select
          value={style.fontFamily}
          disabled={!contentItem}
          aria-label="Font family"
          onChange={(event) => onUpdateStyle?.(event, item, contentItem, {
            fontFamily: event.target.value
          })}
        >
          {SIDEBAR_FONT_FAMILY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="grid-operation-sidebar-style-row">
        <span>Line</span>
        <SidebarNumberField
          min="0.8"
          max="2"
          step="0.05"
          value={style.lineHeight}
          disabled={!contentItem}
          aria-label="Line height"
          onCommit={(event, value) => onUpdateStyle?.(event, item, contentItem, {
            lineHeight: value
          })}
        />
      </label>
      <div className="grid-operation-sidebar-style-align" aria-label="Выравнивание текста">
        {SIDEBAR_ALIGN_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={style.align === option.value ? "is-active" : ""}
            title={option.title}
            aria-label={option.title}
            aria-pressed={style.align === option.value}
            disabled={!contentItem}
            onClick={(event) => onUpdateStyle?.(event, item, contentItem, {
              align: option.value
            })}
          >
            {option.icon}
          </button>
        ))}
      </div>
      <div className="grid-operation-sidebar-content-section-title">Appearance</div>
      <label className="grid-operation-sidebar-style-row">
        <span>Variant</span>
        <select
          value={variant}
          disabled={!contentItem}
          aria-label="Button variant"
          onChange={(event) => onUpdatePatch?.(event, item, contentItem, {
            variant: event.target.value
          })}
        >
          {SIDEBAR_VARIANT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="grid-operation-sidebar-color-row" aria-label="Button colors">
        {SIDEBAR_COLOR_OPTIONS.map((option) => (
          <label key={option.field} title={option.title}>
            <span>{option.label}</span>
            <input
              type="color"
              value={style[option.field]}
              disabled={!contentItem}
              aria-label={option.title}
              onChange={(event) => onUpdateStyle?.(event, item, contentItem, {
                [option.field]: event.target.value
              })}
            />
          </label>
        ))}
      </div>
      <div className="grid-operation-sidebar-border-row" aria-label="Контур кнопки">
        <label title="Цвет контура">
          <span>line</span>
          <input
            type="color"
            value={style.borderColor}
            disabled={!contentItem}
            aria-label="Цвет контура"
            onChange={(event) => onUpdateStyle?.(event, item, contentItem, {
              borderColor: event.target.value
            })}
          />
        </label>
        <label title="Толщина контура">
          <span>w</span>
          <SidebarNumberField
            min="0"
            max="8"
            step="1"
            value={style.borderWidth}
            disabled={!contentItem}
            aria-label="Толщина контура"
            onCommit={(event, value) => onUpdateStyle?.(event, item, contentItem, {
              borderWidth: value
            })}
          />
        </label>
      </div>
      <div className="grid-operation-sidebar-opacity-row" aria-label="Прозрачность текста и фона">
        <label title="Прозрачность текста">
          <span>text</span>
          <SidebarNumberField
            min="10"
            max="100"
            step="5"
            value={Math.round(style.textOpacity * 100)}
            disabled={!contentItem}
            aria-label="Прозрачность текста"
            transform={(value) => value / 100}
            onCommit={(event, value) => onUpdateStyle?.(event, item, contentItem, {
              textOpacity: value
            })}
          />
        </label>
        <label title="Прозрачность фона">
          <span>bg</span>
          <SidebarNumberField
            min="10"
            max="100"
            step="5"
            value={Math.round(style.backgroundOpacity * 100)}
            disabled={!contentItem}
            aria-label="Прозрачность фона"
            transform={(value) => value / 100}
            onCommit={(event, value) => onUpdateStyle?.(event, item, contentItem, {
              backgroundOpacity: value
            })}
          />
        </label>
      </div>
      <div className="grid-operation-sidebar-content-section-title">State</div>
      <label className="grid-operation-sidebar-toggle-row">
        <input
          type="checkbox"
          checked={disabled}
          disabled={!contentItem}
          aria-label="Disabled"
          onChange={(event) => onUpdatePatch?.(event, item, contentItem, {
            disabled: event.target.checked
          })}
        />
        <span>Disabled</span>
      </label>
      <div className="grid-operation-sidebar-state-badge" aria-label="Active state">
        <span>Active</span>
        <strong>{active ? "on" : "auto"}</strong>
      </div>
      <div className="grid-operation-sidebar-content-section-title is-advanced">Advanced layout</div>
      <div className="grid-operation-sidebar-geometry-row is-advanced" aria-label="Button position and size">
        {SIDEBAR_GEOMETRY_OPTIONS.map((option) => (
          <label key={option.field} title={option.title}>
            <span>{option.label}</span>
            <SidebarNumberField
              min="1"
              step="1"
              value={geometry[option.field]}
              disabled={!contentItem}
              aria-label={option.title}
              onCommit={(event, value) => onUpdateGeometry?.(event, item, contentItem, {
                [option.field]: value
              })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function SidebarNumberField({
  value,
  min,
  max,
  step,
  disabled,
  transform,
  onCommit,
  ...inputProps
}) {
  const [draftValue, setDraftValue] = useState(() => formatSidebarNumberDraft(value));
  const [focused, setFocused] = useState(false);
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    if (!focused) {
      setDraftValue(formatSidebarNumberDraft(value));
    }
  }, [focused, value]);

  function commitDraft(event) {
    const commit = resolveSidebarNumberFieldCommit({
      draftValue,
      fallbackValue: value,
      min: Number(min),
      max: max === undefined ? Number.POSITIVE_INFINITY : Number(max),
      transform
    });

    setDraftValue(commit.draftValue);

    if (commit.valid) {
      onCommit?.(event, commit.modelValue, commit.value);
    }
  }

  return (
    <input
      {...inputProps}
      type="number"
      min={min}
      max={max}
      step={step}
      value={draftValue}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={(event) => {
        setFocused(false);

        if (skipBlurCommitRef.current) {
          skipBlurCommitRef.current = false;
          setDraftValue(formatSidebarNumberDraft(value));
          return;
        }

        commitDraft(event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();

        if (event.key === "Enter") {
          event.preventDefault();
          commitDraft(event);
        }

        if (event.key === "Escape") {
          event.preventDefault();
          skipBlurCommitRef.current = true;
          setDraftValue(formatSidebarNumberDraft(value));
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function isSidebar(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === BLOCK_CONTENT_TYPES.SIDEBAR ||
    Boolean(item?.meta?.sidebar)
  );
}

function isServiceItem(item) {
  const blockType = String(item?.meta?.blockType ?? "").trim();

  return (
    blockType === BLOCK_CONTENT_TYPES.WARNING ||
    blockType === BLOCK_CONTENT_TYPES.CONTROL
  );
}

function resolveSidebarSettings(item) {
  return {
    state: String(item?.meta?.sidebar?.state ?? SIDEBAR_STATES.OVERLAY)
  };
}

function resolveSidebarContentEditorStyle(style) {
  return {
    backgroundColor: resolveSidebarContentColorWithOpacity(
      style?.backgroundColor ?? SIDEBAR_DEFAULT_BACKGROUND_COLOR,
      style?.backgroundOpacity
    ),
    borderColor: style?.borderColor ?? SIDEBAR_DEFAULT_BORDER_COLOR,
    borderWidth: `${style?.borderWidth ?? SIDEBAR_DEFAULT_BORDER_WIDTH}px`,
    color: resolveSidebarContentColorWithOpacity(
      style?.textColor ?? SIDEBAR_DEFAULT_TEXT_COLOR,
      style?.textOpacity
    ),
    fontSize: `${style?.fontSize ?? 14}px`,
    fontFamily: resolveSidebarContentFontFamily(style?.fontFamily),
    fontWeight: style?.fontWeight ?? 600,
    lineHeight: style?.lineHeight ?? SIDEBAR_DEFAULT_LINE_HEIGHT,
    textAlign: resolveSidebarContentTextAlign(style?.align)
  };
}

const SIDEBAR_FONT_WEIGHT_OPTIONS = [400, 500, 600, 700, 800, 900];
const SIDEBAR_FONT_FAMILY_OPTIONS = [
  { value: SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM, label: "System" },
  { value: SIDEBAR_CONTENT_FONT_FAMILIES.SERIF, label: "Serif" },
  { value: SIDEBAR_CONTENT_FONT_FAMILIES.MONO, label: "Mono" },
  { value: SIDEBAR_CONTENT_FONT_FAMILIES.DISPLAY, label: "Display" }
];
const SIDEBAR_VARIANT_OPTIONS = [
  { value: SIDEBAR_CONTENT_BUTTON_VARIANTS.DEFAULT, label: "Default" },
  { value: SIDEBAR_CONTENT_BUTTON_VARIANTS.PRIMARY, label: "Primary" },
  { value: SIDEBAR_CONTENT_BUTTON_VARIANTS.SECONDARY, label: "Secondary" },
  { value: SIDEBAR_CONTENT_BUTTON_VARIANTS.GHOST, label: "Ghost" },
  { value: SIDEBAR_CONTENT_BUTTON_VARIANTS.DANGER, label: "Danger" }
];
const SIDEBAR_DEFAULT_TEXT_COLOR = "#064e3b";
const SIDEBAR_DEFAULT_BACKGROUND_COLOR = "#ecfdf5";
const SIDEBAR_DEFAULT_BORDER_COLOR = "#059669";
const SIDEBAR_DEFAULT_BORDER_WIDTH = 1;
const SIDEBAR_DEFAULT_TEXT_OPACITY = 1;
const SIDEBAR_DEFAULT_BACKGROUND_OPACITY = 1;
const SIDEBAR_DEFAULT_LINE_HEIGHT = 1.2;
const SIDEBAR_CONTENT_FONT_FAMILY_CSS = {
  [SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM]: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  [SIDEBAR_CONTENT_FONT_FAMILIES.SERIF]: "Georgia, serif",
  [SIDEBAR_CONTENT_FONT_FAMILIES.MONO]: "ui-monospace, SFMono-Regular, Menlo, monospace",
  [SIDEBAR_CONTENT_FONT_FAMILIES.DISPLAY]: "Inter, ui-sans-serif, system-ui, sans-serif"
};

const SIDEBAR_GEOMETRY_OPTIONS = [
  {
    field: "x",
    label: "x",
    title: "Колонка кнопки"
  },
  {
    field: "y",
    label: "y",
    title: "Строка кнопки"
  },
  {
    field: "w",
    label: "w",
    title: "Ширина кнопки"
  },
  {
    field: "h",
    label: "h",
    title: "Высота кнопки"
  }
];

const SIDEBAR_ALIGN_OPTIONS = [
  {
    value: SIDEBAR_CONTENT_TEXT_ALIGNS.LEFT,
    icon: <TextAlignLeftIcon />,
    title: "Выровнять текст по левому краю"
  },
  {
    value: SIDEBAR_CONTENT_TEXT_ALIGNS.CENTER,
    icon: <TextAlignCenterIcon />,
    title: "Выровнять текст по центру"
  },
  {
    value: SIDEBAR_CONTENT_TEXT_ALIGNS.RIGHT,
    icon: <TextAlignRightIcon />,
    title: "Выровнять текст по правому краю"
  }
];

const SIDEBAR_COLOR_OPTIONS = [
  {
    field: "textColor",
    label: "text",
    title: "Цвет текста"
  },
  {
    field: "backgroundColor",
    label: "bg",
    title: "Цвет фона"
  }
];

function resolveSidebarContentItemStyle(contentItem) {
  return {
    fontSize: contentItem?.style?.fontSize ?? 14,
    fontWeight: contentItem?.style?.fontWeight ?? 600,
    fontFamily: resolveSidebarContentFontFamilyValue(contentItem?.style?.fontFamily),
    lineHeight: resolveSidebarLineHeight(contentItem?.style?.lineHeight),
    align: resolveSidebarContentTextAlign(contentItem?.style?.align),
    textColor: resolveSidebarContentColor(
      contentItem?.style?.textColor,
      SIDEBAR_DEFAULT_TEXT_COLOR
    ),
    backgroundColor: resolveSidebarContentColor(
      contentItem?.style?.backgroundColor,
      SIDEBAR_DEFAULT_BACKGROUND_COLOR
    ),
    borderColor: resolveSidebarContentColor(
      contentItem?.style?.borderColor,
      SIDEBAR_DEFAULT_BORDER_COLOR
    ),
    borderWidth: resolveSidebarBorderWidth(contentItem?.style?.borderWidth),
    textOpacity: resolveSidebarStyleOpacity(
      contentItem?.style?.textOpacity,
      SIDEBAR_DEFAULT_TEXT_OPACITY
    ),
    backgroundOpacity: resolveSidebarStyleOpacity(
      contentItem?.style?.backgroundOpacity,
      SIDEBAR_DEFAULT_BACKGROUND_OPACITY
    )
  };
}

function resolveSidebarContentButtonVariant(value) {
  if (Object.values(SIDEBAR_CONTENT_BUTTON_VARIANTS).includes(value)) {
    return value;
  }

  return SIDEBAR_CONTENT_BUTTON_VARIANTS.DEFAULT;
}

function resolveSidebarContentFontFamilyValue(value) {
  if (Object.values(SIDEBAR_CONTENT_FONT_FAMILIES).includes(value)) {
    return value;
  }

  return SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM;
}

function resolveSidebarContentFontFamily(value) {
  return SIDEBAR_CONTENT_FONT_FAMILY_CSS[resolveSidebarContentFontFamilyValue(value)];
}

function resolveSidebarLineHeight(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return SIDEBAR_DEFAULT_LINE_HEIGHT;
  }

  return Math.min(Math.max(number, 0.8), 2);
}

function resolveSidebarContentItemGeometry(contentItem) {
  return {
    x: resolveSidebarGeometryNumber(contentItem?.x),
    y: resolveSidebarGeometryNumber(contentItem?.y),
    w: resolveSidebarGeometryNumber(contentItem?.w),
    h: resolveSidebarGeometryNumber(contentItem?.h)
  };
}

function resolveSidebarGeometryNumber(value) {
  const number = Math.round(Number(value));

  if (!Number.isFinite(number)) {
    return 1;
  }

  return Math.max(1, number);
}

function resolveSidebarContentTextAlign(value) {
  if (Object.values(SIDEBAR_CONTENT_TEXT_ALIGNS).includes(value)) {
    return value;
  }

  return SIDEBAR_CONTENT_TEXT_ALIGNS.CENTER;
}

function resolveSidebarContentColor(value, fallback) {
  const text = String(value ?? "").trim();

  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function resolveSidebarContentColorWithOpacity(color, opacity) {
  const text = resolveSidebarContentColor(color, color);
  const alpha = resolveSidebarStyleOpacity(opacity, 1);

  if (!/^#[0-9a-fA-F]{6}$/.test(text)) {
    return color;
  }

  const red = Number.parseInt(text.slice(1, 3), 16);
  const green = Number.parseInt(text.slice(3, 5), 16);
  const blue = Number.parseInt(text.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function resolveSidebarBorderWidth(value) {
  const number = Math.round(Number(value));

  if (!Number.isFinite(number)) {
    return SIDEBAR_DEFAULT_BORDER_WIDTH;
  }

  return Math.min(Math.max(number, 0), 8);
}

function resolveSidebarStyleOpacity(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, 0.1), 1);
}
