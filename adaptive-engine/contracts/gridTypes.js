// Контракты сетки
// JSDoc-типы для публичных и внутренних структур adaptive-engine.

/**
 * @typedef {Object} GridRules
 * @property {number} minColumns Базовый минимум колонок для нормальной рабочей области.
 * @property {number} minVisibleColumns Абсолютный минимум колонок для узких экранов.
 * @property {number} maxColumns Верхняя граница колонок.
 * @property {number} minRows Базовый минимум строк для нормальной рабочей области.
 * @property {number} minVisibleRows Абсолютный минимум строк для мобильных экранов.
 * @property {number} maxRows Верхняя граница строк.
 * @property {number} fitPadding Технический запас для fit-расчета.
 * @property {number} minCellSize Минимальный размер квадратной ячейки.
 * @property {number} maxCellSize Максимальный размер квадратной ячейки.
 */

/**
 * @typedef {Object} GridModeState
 * @property {string} mode Общий режим сетки.
 * @property {string} horizontalMode Режим горизонтальной оси.
 * @property {string} verticalMode Режим вертикальной оси.
 */

/**
 * @typedef {Object} WorkspaceSnapshot
 * @property {number} width Ширина рабочей области.
 * @property {number} height Высота рабочей области.
 * @property {number} [viewportWidth] Ширина viewport.
 * @property {number} [viewportHeight] Высота viewport.
 * @property {number} [devicePixelRatio] Плотность пикселей экрана.
 */

/**
 * @typedef {Object} GridMetrics
 * @property {string} engineVersion Версия контракта adaptive-engine.
 * @property {number} columns Итоговое количество колонок.
 * @property {number} rows Итоговое количество строк.
 * @property {number} cellSize Итоговый размер квадратной ячейки.
 * @property {number} gridWidth Итоговая ширина сетки.
 * @property {number} gridHeight Итоговая высота сетки.
 * @property {{engineVersion: string, mode: string, horizontalMode: string, verticalMode: string, rules: GridRules, rulesMeta: {source: string, profile: string, profileStatus: string, profileEnabled: boolean, candidate: string, candidateEnabled: boolean, reason: string, selectionReason: string, workspaceState: string, warnings: string[]}}} debug Диагностический снимок расчета.
 * @property {Object.<string, string|number>} cssVariables Готовые CSS variables для UI.
 */

/**
 * @typedef {Object} GridArea
 * @property {number} x Колонка начала области, координаты начинаются с 1.
 * @property {number} y Строка начала области, координаты начинаются с 1.
 * @property {number} w Ширина области в ячейках.
 * @property {number} h Высота области в ячейках.
 */

/**
 * @typedef {GridArea & {id: string}} LayoutItem
 */

/**
 * @typedef {LayoutItem & {rect: {x: number, y: number, width: number, height: number}}} ResolvedLayoutItem
 */

/**
 * @typedef {Object} LayoutReport
 * @property {boolean} valid
 * @property {{total: number, resolved: number, errors: number}} summary
 * @property {Object.<string, number>} errorsByType
 * @property {Array<Object>} errors
 */

/**
 * @typedef {Object} LayoutProcessResult
 * @property {boolean} valid
 * @property {ResolvedLayoutItem[]} items
 * @property {Array<Object>} errors
 * @property {LayoutReport} report
 * @property {{received: number, resolved: number, errors: number}} meta
 */

/**
 * @typedef {Object} EngineResult
 * @property {boolean} valid
 * @property {boolean} rejected
 * @property {string|null} action
 * @property {Object|null} data
 * @property {Array<Object>} errors
 * @property {Object|null} rejection
 * @property {Object|null} report
 * @property {Object} meta
 * @property {Object} details
 */

export {};
