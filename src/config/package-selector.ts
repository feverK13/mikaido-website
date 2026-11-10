/* Налаштування блоку вибору пакета на Головній (docs/specs/package-selector.md). */

/** Прилипання до блоку при прокручуванні (scroll-snap proximity на html). Якщо сторінку тягне назад після виходу з блоку, поставити false. */
export const SNAP_ENABLED = true

/** Висота липкої шапки в px: блок займає решту екрана. */
export const HEADER_HEIGHT = 70

/** Нижче цієї висоти вікна режим на весь екран і прилипання вимкнені (спека, п. 3.1). */
export const FULLSCREEN_MIN_HEIGHT = 560
