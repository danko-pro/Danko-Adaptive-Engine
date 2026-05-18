import { APP_SURFACE_MODES, resolveAppSurfaceMode } from "./app/resolveAppSurfaceMode.js";
import { LayoutCanvas } from "./layout/LayoutCanvas.jsx";
import { ProductionCanvas } from "./layout/ProductionCanvas.jsx";

export default function App() {
  const surfaceMode = resolveAppSurfaceMode(import.meta.env);

  return (
    <main className="app-shell">
      {surfaceMode === APP_SURFACE_MODES.DEBUG ? (
        <LayoutCanvas />
      ) : (
        <ProductionCanvas />
      )}
    </main>
  );
}
