// Workspace observer
// Следит за реальным размером DOM-элемента в браузере.
// Отдает наружу сырой снимок рабочей области и браузерного viewport.

// Основная функция наблюдения за рабочей областью.
// На вход принимает DOM-элемент и callback.
// При изменении размера вызывает callback с актуальным снимком рабочей области.
export function observeWorkspace(target, onChange) {
  if (!target) {
    throw new Error("observeWorkspace: target element is required.");
  }

  if (typeof onChange !== "function") {
    throw new Error("observeWorkspace: onChange callback is required.");
  }

  const emitSize = () => {
    const rect = target.getBoundingClientRect();

    onChange({
      // Размер самой рабочей области в CSS-пикселях.
      width: rect.width,
      height: rect.height,

      // Позиция рабочей области относительно видимой части браузера.
      x: rect.x,
      y: rect.y,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,

      // Размер viewport, то есть видимой области браузера.
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,

      // Плотность пикселей экрана. Позже может пригодиться для точной адаптации.
      devicePixelRatio: window.devicePixelRatio,

      // Текущее смещение прокрутки страницы.
      scrollX: window.scrollX,
      scrollY: window.scrollY
    });
  };

  // Сразу отправляем первый снимок, чтобы UI не ждал первого события resize.
  emitSize();

  // ResizeObserver отслеживает изменение размера самого workspace-элемента.
  const resizeObserver = new ResizeObserver(emitSize);
  resizeObserver.observe(target);

  // Окно и прокрутка тоже влияют на снимок: viewport, координаты и scroll могут измениться
  // даже если размер самого элемента не поменялся.
  window.addEventListener("resize", emitSize);
  window.addEventListener("scroll", emitSize, { passive: true });
  window.addEventListener("orientationchange", emitSize);

  // Возвращаем функцию очистки, чтобы React мог снять подписки при размонтировании.
  return () => {
    resizeObserver.disconnect();
    window.removeEventListener("resize", emitSize);
    window.removeEventListener("scroll", emitSize);
    window.removeEventListener("orientationchange", emitSize);
  };
}
