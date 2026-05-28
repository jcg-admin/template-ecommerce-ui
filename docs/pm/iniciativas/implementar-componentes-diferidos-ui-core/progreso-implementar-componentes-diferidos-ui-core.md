# Progreso: implementar-componentes-diferidos-ui-core

| Campo | Valor |
|-------|-------|
| Iniciativa | implementar-componentes-diferidos-ui-core |
| Inicio | 2026-05-28 |

## Registro de eventos

| Timestamp | Tipo | ID | Detalle |
|-----------|------|----|---------|
| 2026-05-28T07:00:00 | Apertura iniciativa | — | 11 componentes diferidos de ui-core-5.25.0. Auditoría completa: API, opciones, eventos y lógica de cada uno leídos del source. Plan: baja complejidad primero, alta al final. |

## Contadores

| Clase | Conteo |
|-------|--------|
| Apertura | 1 |
| Tarea cerrada | 0 |
| Hallazgo | 0 |
| Cierre | 0 |
| 2026-05-28T09:00:00 | Tarea cerrada | Alert | Alert.jsx + Alert.module.scss + Alert.test.jsx (10 tests). Lógica: fade dismiss, onClose cancelable, timeout, aria-live por variante, iconos por defecto. |
| 2026-05-28T09:00:00 | Tarea cerrada | LoadingButton | LoadingButton.jsx + .module.scss + .test.jsx (9 tests). Lógica: start()/stop() via ref, disabledOnLoading, spinnerType=border/grow, timeout auto-stop. |
| 2026-05-28T09:00:00 | Tarea cerrada | Popover | Popover.jsx + .module.scss + .test.jsx (8 tests). Lógica: extiende Tooltip, trigger=click default, title+content, content como función, Escape cierra. |
| 2026-05-28T09:00:00 | Tarea cerrada | Offcanvas | Offcanvas.jsx + .module.scss + .test.jsx (9 tests). Lógica: backdrop true/false/static, keyboard=true, scroll=false, placement 4 dirs, todos los eventos. |
| 2026-05-28T09:00:00 | Tarea cerrada | ScrollSpy | ScrollSpy.jsx + useScrollSpy hook + .test.jsx (7 tests). Lógica: IntersectionObserver, rootMargin, threshold, refresh() via ref, aria-current, smoothScroll. |
| 2026-05-28T09:00:00 | Tarea cerrada | Chip | Chip.jsx + .module.scss + .test.jsx (10 tests). Lógica: selectable/toggle, removable, selected inicial, callbacks cancelables, teclado Space/Enter/Delete. |
| 2026-05-28T09:00:00 | Tarea cerrada | ChipInput | ChipInput.jsx + .module.scss + .test.jsx (9 tests). Lógica: add/remove/clear/getValues via ref, maxChips, separator/paste, createOnBlur, Backspace. |
| 2026-05-28T09:00:00 | Tarea cerrada | Calendar | Calendar.jsx + .module.scss (parte de DatePicker.test, 9 tests). Lógica: grid días/meses/años, navegación prev/next, selección range, renderDayCell slot, ref.refresh()/update(). |
| 2026-05-28T09:00:00 | Tarea cerrada | TimePicker | TimePicker.jsx + .module.scss + .test.jsx (10 tests). Lógica: variant roll/select, toggle/show/hide/cancel/clear/reset/update via ref, cleaner, indicator, footer, Escape. |
| 2026-05-28T09:00:00 | Tarea cerrada | DatePicker | DatePicker.jsx + .module.scss (en DatePicker.test, 5 tests). Lógica: sobre Calendar, cleaner, disabled, ref API completa, input readOnly con formateo. |
| 2026-05-28T09:00:00 | Tarea cerrada | DateRangePicker | DateRangePicker.jsx + .module.scss (en DatePicker.test, 4 tests). Lógica: dos inputs, calendars=2, selector de rango en dos clics, TimePicker integrado opcional, separador. |
| 2026-05-28T09:00:00 | Cierre de iniciativa | implementar-componentes-diferidos-ui-core | 11/11 componentes implementados. Tests: 827 → 918 (+91). SCSS: 135 → 146 entries. 0 fallos. Todos con lógica completa de ui-core-5.25.0. |
