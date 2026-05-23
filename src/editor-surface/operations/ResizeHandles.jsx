export function ResizeHandles({ item, onPointerDown }) {
  return (
    <>
      {["n", "e", "s", "w", "nw", "ne", "se", "sw"].map((handle) => (
        <button
          aria-label={`Изменить размер ${handle}`}
          className={`grid-operation-resize-handle is-${handle}`}
          key={handle}
          type="button"
          onPointerDown={(event) => onPointerDown(event, item, handle)}
        />
      ))}
    </>
  );
}
