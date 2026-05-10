import {
  CheckIcon,
  CloseIcon,
  CopyIcon,
  EditIcon,
  TrashIcon
} from "../icons/GridDebugIcons.jsx";

export function ItemActionMenu({
  item,
  mode,
  renameValue,
  onClose,
  onCopy,
  onDelete,
  onRename,
  onStartRename,
  onUpdateRenameValue
}) {
  if (mode === "rename") {
    return (
      <form
        className="grid-operation-item-menu is-rename"
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
        <button type="button" title="Отмена" aria-label="Отмена" onClick={onClose}>
          <CloseIcon />
        </button>
      </form>
    );
  }

  return (
    <div
      className="grid-operation-item-menu"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" title="Удалить" aria-label="Удалить" onClick={(event) => onDelete(event, item)}>
        <TrashIcon />
      </button>
      <button type="button" title="Копировать" aria-label="Копировать" onClick={(event) => onCopy(event, item)}>
        <CopyIcon />
      </button>
      <button type="button" title="Переименовать" aria-label="Переименовать" onClick={(event) => onStartRename(event, item)}>
        <EditIcon />
      </button>
      <button type="button" title="Отмена" aria-label="Отмена" onClick={onClose}>
        <CloseIcon />
      </button>
    </div>
  );
}
