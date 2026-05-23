export function OperationCompositionBadge({ info }) {
  return (
    <div
      className="grid-operation-composition-badge"
      aria-label="V2 информация блока"
      title={info.details}
    >
      <strong>{info.shortType}</strong>
      <small>{info.shortPosition}</small>
      {info.shortGroup && <small>{info.shortGroup}</small>}
      {info.shortAnchors && <small>{info.shortAnchors}</small>}
    </div>
  );
}
