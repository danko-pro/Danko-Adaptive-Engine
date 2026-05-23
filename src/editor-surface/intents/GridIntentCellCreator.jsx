import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  createAreaFromCellCommand,
  formatSelectionStatus,
  resolveAdapterSelection,
  resolveAreaRect,
  resolveEventCell,
  SELECTION_TYPES
} from "../../../engine-adapter/index.js";
import { GridIntentCellEditor } from "./GridIntentCellEditor.jsx";
import {
  GridIntentAreaDraft,
  GridIntentHoverCell,
  GridIntentSelectedCell,
  GridIntentStatus
} from "./GridIntentVisuals.jsx";
import {
  createIntentStatus,
  isCellInsideArea,
  isMainPointer
} from "./gridIntentUtils.js";

// Тестовый adapter-слой: UI-события превращаются в intent, а intent в operation.
// Выделение одной ячейки или области активируется через Enter.
export function GridIntentCellCreator({ items, setItems, metrics, selection, setSelection, blockType }) {
  const inputRef = useRef(null);
  const layerRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [editor, setEditor] = useState(null);
  const [draftArea, setDraftArea] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [portalRoot, setPortalRoot] = useState(null);
  const [status, setStatus] = useState(null);
  const isEditorOpen = Boolean(editor);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    if (editor) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditorOpen]);

  useEffect(() => {
    if (selection?.type === SELECTION_TYPES.AREA) {
      setDraftArea(null);
      setEditor(null);
    }
  }, [selection]);

  function handleClick(event) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const cell = resolveEventCell(event, metrics);

    setHoverCell(cell);

    if (!cell) {
      setEditor(null);
      setDraftArea(null);
      setSelection(null);
      setStatus(createIntentStatus("error", "Ячейка вне сетки."));
      return;
    }

    if (draftArea && isCellInsideArea(cell, draftArea)) {
      setEditor(null);
      setStatus(createIntentStatus("idle", `Выбрана область ${draftArea.x}:${draftArea.y}, размер ${draftArea.w}x${draftArea.h}. Нажмите Enter или двойной клик, чтобы создать блок.`));
      return;
    }

    setEditor(null);
    const nextSelection = resolveAdapterSelection({ cell, items, metrics });
    setSelection(nextSelection);
    setDraftArea(resolveAreaRect(cell, cell));
    setStatus(createIntentStatus("idle", `${formatSelectionStatus(nextSelection)}. Нажмите Enter или двойной клик, чтобы создать блок.`));
  }

  function handleDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (editor) {
      return;
    }

    const cell = resolveEventCell(event, metrics);

    if (!cell) {
      return;
    }

    const area = draftArea && isCellInsideArea(cell, draftArea)
      ? draftArea
      : resolveAreaRect(cell, cell);

    const nextSelection = resolveAdapterSelection({ cell: area.cell, items, metrics });

    setSelection(nextSelection);
    setDraftArea(area);
    openEditorForArea(area);
  }

  function handlePointerDown(event) {
    if (!isMainPointer(event) || editor) {
      return;
    }

    const cell = resolveEventCell(event, metrics);

    if (!cell) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    setHoverCell(cell);
    dragRef.current = {
      pointerId: event.pointerId,
      startCell: cell,
      moved: false
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const cell = resolveEventCell(event, metrics);

    setHoverCell(cell);

    if (!drag) {
      return;
    }

    if (drag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const area = resolveAreaRect(drag.startCell, cell);

    if (!area) {
      return;
    }

    drag.moved = area.w > 1 || area.h > 1;
    setDraftArea(area);

    if (drag.moved) {
      setSelection(null);
      setStatus(createIntentStatus("idle", `Выбрана область ${area.x}:${area.y}, размер ${area.w}x${area.h}. Нажмите Enter, чтобы создать блок.`));
    }
  }

  function handlePointerLeave() {
    setHoverCell(null);
  }

  function handlePointerUp(event) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragRef.current = null;

    if (!drag.moved) {
      const nextSelection = resolveAdapterSelection({
        cell: drag.startCell,
        items,
        metrics
      });

      setSelection(nextSelection);
      setDraftArea(resolveAreaRect(drag.startCell, drag.startCell));
      setStatus(createIntentStatus("idle", `${formatSelectionStatus(nextSelection)}. Нажмите Enter или двойной клик, чтобы создать блок.`));
    }

    suppressClickRef.current = true;
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setDraftArea(null);
      setEditor(null);
      setSelection(null);
      setStatus(createIntentStatus("idle", "Выделение отменено."));
      return;
    }

    if (event.key !== "Enter" || !draftArea || editor) {
      return;
    }

    event.preventDefault();
    openEditorForArea(draftArea);
  }

  function openEditorForArea(area) {
    setEditor({
      cell: area.cell,
      size: area.size,
      value: ""
    });
    setStatus(createIntentStatus("idle", `Введите имя для области ${area.x}:${area.y}, размер ${area.w}x${area.h}.`));
  }

  function handleEditorSubmit(event) {
    event.preventDefault();

    if (!editor) {
      return;
    }

    const value = editor.value.trim();

    if (!value) {
      setStatus(createIntentStatus("error", "Введите имя блока."));
      return;
    }

    const command = createAreaFromCellCommand({
      cell: editor.cell,
      size: editor.size,
      value,
      blockType,
      items,
      metrics
    });

    if (!command.valid) {
      setStatus(createIntentStatus("error", command.message));
      return;
    }

    setItems(command.items);
    setEditor(null);
    setDraftArea(null);
    setSelection(command.selection);
    setStatus(createIntentStatus("ok", command.message));
  }

  function handleEditorChange(event) {
    setEditor((current) => ({
      ...current,
      value: event.target.value
    }));
  }

  function handleEditorCancel() {
    setEditor(null);
    setDraftArea(null);
    setSelection(null);
    setStatus(createIntentStatus("idle", "Ввод отменен."));
  }

  const selectedCell = selection?.type === SELECTION_TYPES.CELL ? selection.cell : null;
  const showHoverCell = hoverCell && !editor && selection?.type !== SELECTION_TYPES.AREA;

  return (
    <>
      <div
        ref={layerRef}
        className="grid-intent-cell-creator-layer"
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={handleKeyDown}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {showHoverCell && <GridIntentHoverCell cell={hoverCell} />}
        <GridIntentAreaDraft area={draftArea} />
        <GridIntentSelectedCell cell={selectedCell} status={status} />
        <GridIntentStatus selection={selection} status={status} />
      </div>
      {editor && portalRoot &&
        createPortal(
          <GridIntentCellEditor
            editor={editor}
            inputRef={inputRef}
            layerElement={layerRef.current}
            metrics={metrics}
            onCancel={handleEditorCancel}
            onChange={handleEditorChange}
            onSubmit={handleEditorSubmit}
          />,
          portalRoot
        )}
    </>
  );
}
