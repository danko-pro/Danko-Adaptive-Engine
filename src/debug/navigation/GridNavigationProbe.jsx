export function GridNavigationProbe({
  pages,
  activePageId,
  navigationState,
  onSelectPage,
  onCreatePage
}) {
  const plan = navigationState.data?.plan;

  return (
    <nav className="grid-navigation-probe" aria-label="Тестовая навигация V3">
      <div className="grid-navigation-probe-tabs">
        {pages.map((page) => (
          <button
            className={page.id === activePageId ? "is-active" : ""}
            key={page.id}
            type="button"
            onClick={() => onSelectPage(page.id)}
          >
            {page.title}
          </button>
        ))}
        <button
          className="is-create"
          type="button"
          aria-label="Add page"
          title="Add page"
          onClick={onCreatePage}
        >
          +
        </button>
      </div>
      <small>
        V3: {plan?.status ?? "нет плана"} · workspace:{" "}
        {navigationState.data?.activeWorkspaceId ?? "не выбран"} · issues:{" "}
        {plan?.summary?.issues ?? 0}
      </small>
    </nav>
  );
}
