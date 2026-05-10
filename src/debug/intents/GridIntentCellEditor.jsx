import { CheckIcon, CloseIcon } from "../icons/GridDebugIcons.jsx";
import { getEditorPosition } from "./gridIntentUtils.js";

export function GridIntentCellEditor({
  editor,
  inputRef,
  layerElement,
  metrics,
  onCancel,
  onChange,
  onSubmit
}) {
  return (
    <form
      className="grid-intent-cell-editor"
      style={getEditorPosition(editor, metrics, layerElement)}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onSubmit={onSubmit}
    >
      <input
        ref={inputRef}
        aria-label={`Имя блока ${editor.cell.x}:${editor.cell.y}`}
        value={editor.value}
        onChange={onChange}
        placeholder={`${editor.cell.x}:${editor.cell.y} · ${editor.size.w}x${editor.size.h}`}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === "Escape") {
            onCancel();
          }
        }}
      />
      <button type="submit" title="Создать" aria-label="Создать">
        <CheckIcon />
      </button>
      <button type="button" title="Отмена" aria-label="Отмена" onClick={onCancel}>
        <CloseIcon />
      </button>
    </form>
  );
}
