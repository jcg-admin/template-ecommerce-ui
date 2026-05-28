# Auditoria: cobertura ui-core-5.25.0 en el template

| Campo | Valor |
|-------|-------|
| Fecha | 2026-05-28 (actualizada) |
| ui-core version | 5.25.0 |
| Total componentes ui-core | 29 |
| Implementados | 29/29 |
| API completa | 29/29 (todas las opciones Default + métodos públicos) |
| Named exports | 29/29 (compatibilidad con imports existing) |
| Tests | 972 pasando / 0 fallando |
| SCSS | 146 entries limpias / 0 issues |

---

## Componentes IMPLEMENTADOS — API completa (29/29)

### Overlays y modales
| Componente | Opciones ui-core | Métodos ref | Tests |
|-----------|------------------|-------------|-------|
| modal | backdrop true/false/static, keyboard, focus, size sm/lg/xl/fullscreen, scrollable, centered | toggle/show/hide/dispose/handleUpdate | 11 |
| tooltip | trigger hover/focus/click/manual, delay {show,hide}, fallbackPlacements, offset, customClass, animation, title alias, html, container | enable/disable/toggleEnabled/toggle/show/hide/update/setContent/dispose | 10 |
| offcanvas | backdrop true/false/static, keyboard, scroll, placement start/end/top/bottom | toggle/show/hide (onShow/onShown/onHide/onHidden/onHidePrevented) | 9 |
| popover | trigger click(default)/hover/focus, title, content fn, delay, placement right(default) | — (extiende Tooltip) | 8 |

### Notificaciones
| Componente | Opciones ui-core | Métodos ref | Tests |
|-----------|------------------|-------------|-------|
| alert | variant, dismissible, onClose cancelable, timeout, icon, title | — | 10 |
| toast | autohide, delay, show/hide | show/hide/dispose/isShown | 6 |

### Navegación y estructura
| Componente | Opciones ui-core | Métodos ref | Tests |
|-----------|------------------|-------------|-------|
| tab | activation auto/manual, orientation, Home/End/ArrowKeys | show(id) | 10 |
| dropdown | autoClose true/false/inside/outside, offset, display, reference | toggle/show/hide/dispose/update | 11 |
| stepper | linear, skipValidation, vertical | showStep/next/prev/finish/reset/getActiveStep | 11 |
| collapse | toggle, parent, horizontal | toggle/show/hide/dispose/isShown | 8 |
| scrollspy | rootMargin, threshold, smoothScroll | refresh() | 7 |
| sidebar | narrow, unfoldable, overlaid, position | show/hide/toggle/narrow/unfoldable/reset/toggleNarrow/toggleUnfoldable/isNarrow/isUnfoldable | 11 |

### Contenido y media
| Componente | Opciones ui-core | Métodos ref | Tests |
|-----------|------------------|-------------|-------|
| carousel | interval, keyboard, pause hover/false, ride, touch, wrap | next/nextWhenVisible/prev/to/pause/cycle/dispose | 12 |

### Formularios
| Componente | Opciones ui-core | Métodos ref | Tests |
|-----------|------------------|-------------|-------|
| autocomplete | cleaner, clearSearchOnSelect, indicator, showHints, search fn, searchNoResultsLabel, allowOnlyDefinedOptions, optionsMaxHeight, disabled/invalid/valid | toggle/show/hide/dispose/clear/search/update/deselectAll | 11 |
| multi-select | multiple, search, searchNoResultsLabel, cleaner, selectAll, selectionType tags/counter/text, optionsStyle checkbox/text, clearSearchOnSelect, optionsMaxHeight | toggle/show/hide/dispose/search/update/selectAll/deselectAll/getValue | 12 |
| range-slider | min/max/step, distance, labels, clickableLabels, tooltips, tooltipsFormat, track fill/left/right, vertical | update | 9 |
| otp-input | length, ariaLabel fn, autoSubmit, linear, masked, placeholder, readonly, required, type number/text/all | clear/reset/update | 11 |
| rating | itemCount, precision, allowClear, highlightOnlySelected, icon/activeIcon, tooltips array/bool, size, readOnly | update/reset | 11 |
| loading-button | disabledOnLoading, spinner, spinnerType border/grow, timeout | start/stop | 9 |
| chip | selectable, removable, selected, disabled, onSelect/onDeselect/onRemove cancelables | — | 10 |
| chip-input | maxChips, separator, createOnBlur, removable, selectable, paste handler | add/remove/clear/getValues | 9 |

### Fecha y hora
| Componente | Opciones ui-core | Métodos ref | Tests |
|-----------|------------------|-------------|-------|
| calendar | selectionType day/week/month/year, range, calendars, firstDayOfWeek, locale, minDate/maxDate, disabledDates, renderDayCell | update/refresh | 9 |
| date-picker | cleaner, indicator, disabled/invalid/valid, locale, timepicker integration | toggle/show/hide/cancel/clear/reset/update | 5 |
| date-range-picker | calendars 2, separator, cancelButton/confirmButton, timepicker integration | toggle/show/hide/cancel/clear/reset/update | 4 |
| time-picker | variant roll/select, hours/minutes/seconds, cleaner, indicator, footer, inputReadOnly, inputOnChangeDelay, locale | toggle/show/hide/cancel/clear/reset/update | 10 |

### Primitivos extendidos (props de ui-core integradas en componentes existentes)
| Componente | Integración |
|-----------|------------|
| button | prop loading → LoadingButton |
| password-input | prop passwordToggle en Field |
| search-button | Ctrl+K en Header |
| navigation | absorbido por Sidebar + SidebarNav/SidebarNavItem |

---

## Barrel export central

`src/components/common/index.js` — exporta todos los 29 componentes y sub-exports.

Named exports en todos los componentes (compatibilidad con imports named existentes).

---

## Integración en páginas del template

| Componente | Páginas que lo usan |
|-----------|---------------------|
| Alert | LoginPage, RegisterPage |
| LoadingButton | LoginPage, RegisterPage, CheckoutPage |
| Chip | CatalogPage (filtros de categoría) |
| ChipInput | AdminProductsPage (etiquetas de producto) |
| DateRangePicker | AdminOrdersPage (filtro de fechas) |
| Offcanvas | Header (carrito lateral) |
| Popover | ProductPage (info de variante) |
| ScrollSpy | ProductPage (índice de secciones) |
| Calendar | (sub de DatePicker) |
| DatePicker | (disponible para filtros) |
| TimePicker | (disponible para horarios) |

---

## Métricas finales

| Métrica | Antes | Ahora |
|---------|-------|-------|
| Componentes implementados | 18/29 | **29/29** |
| Tests pasando | 918 | **972** (+54) |
| Tests fallando | 0 | **0** |
| SCSS issues | 1 | **0** |
| API completa por componente | 0/18 | **29/29** |
| Named exports | 0 | **29/29** |
| Integraciones en páginas | parcial | **8 páginas** |
