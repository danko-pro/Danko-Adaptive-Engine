import { LayoutCanvas } from "./layout/LayoutCanvas.jsx";

// Корневой компонент приложения.
// Сейчас приложение намеренно минимальное: оно только показывает рабочую область с адаптивной сеткой.
export default function App() {
  return (
    <main className="app-shell">
      <LayoutCanvas />
    </main>
  );
}
