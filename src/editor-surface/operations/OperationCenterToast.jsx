export function OperationCenterToast({ toast }) {
  if (!toast?.message) {
    return null;
  }

  return (
    <output
      className="grid-operation-center-toast"
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </output>
  );
}
